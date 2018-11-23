import React, { Fragment } from "react";
//import DropzoneComponent from "react-dropzone-component";
import { Button, Form, InputGroup, Col, Row, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "./style.scss";

/*
function onDrop( acceptedFiles, rejectedFiles ) {
    acceptedFiles.forEach( file => {
        const reader = new FileReader();
        reader.onload = () => {
            const fileAsBinaryString = reader.result;
            // do whatever you want with the file content
        };
        reader.onabort = () => console.log( "file reading was aborted" );
        reader.onerror = () => console.log( "file reading has failed" );

        reader.readAsBinaryString( file );
    } );
}
*/

import ReactDropzone from "react-dropzone";

import BeeFree from "../../middleware/beefree";
import config from "../../../config/app.json";

export default class UploadPage extends React.Component {
    constructor( props ) {
        super( props );

        this.state = {
            targetHash : "",
            videoDescription : "",
            videoName : "",
            message : "",
            isUploading : false,
            finalHash : null,
            files : [],
            //imagePreview : null,
            userHasRequestedUpload : false,
            filesError : ""
        };

        this.onDrop = this.onDrop.bind( this );
        this.launchUpload = this.launchUpload.bind( this );
        this.getUploadInputIssues = this.getUploadInputIssues.bind( this );
        this.takeSnapShotOfVideo = this.takeSnapShotOfVideo.bind( this );
    }

    launchUpload() {
        const { imageFile, targetHash, videoName, videoDescription } = this.state;
        const beeFree = new BeeFree( window.BEE_FREE_LOCATION || config.BEE_FREE_LOCATION );
        const videoFile = this.state.files[0];
        let targetAlbumId;
        let chainedHash;

        this.setState( {
            ...this.state,
            isUploading : true,
            finalHash : null
        } );

        //@TODO: This should be a single method I can call and get a final hash from,
        // save it to beefree.js
        beeFree
            .appendAlbum( targetHash, imageFile.name )
            .then( result => {
                const { hash, albumId } = result;
                const { blog } = beeFree.wrapHash( hash );
                targetAlbumId = albumId;

                return blog.uploadFileToVideoalbum( albumId, imageFile );
            } )
            .then( result => {
                const hash = result.response;
                const { blog } = beeFree.wrapHash( hash );

                return blog.uploadFileToVideoalbum( targetAlbumId, videoFile );
            } )
            .then( result => {
                const hash = result.response;
                const { blog } = beeFree.wrapHash( hash );
                chainedHash = hash;

                return blog.generateVideoEntry(
                    targetAlbumId,
                    videoName,
                    videoDescription,
                    imageFile.name,
                    videoFile.name,
                    "video"
                );
            } )
            .then( entry => {
                const { blog } = beeFree.wrapHash( chainedHash );

                return blog.appendVideoEntry( targetAlbumId, entry );
            } )
            .then( result => {
                this.setState( {
                    finalHash : result.response,
                    isUploading : false
                } );
            } )
            .catch( err => {
                this.setState( {
                    ...this.state,
                    files : [],
                    filesError : err.message,
                    imageFile : null,
                    isUploading : false
                } );
            } );
    }

    getContentForHash( swarmHash ) {
        const { onSearch, onSearchSuccess, onSearchFailure, history } = this.props;
        const beeFree = new BeeFree( window.BEE_FREE_LOCATION || config.BEE_FREE_LOCATION );
        onSearch( swarmHash );

        beeFree
            .getAllVideosFromHash( swarmHash )
            .then( results => {
                const alreadyAtSearchResults = history.location.pathname == "/search";

                onSearchSuccess( results );
                if ( !alreadyAtSearchResults ) history.push( "/search" );
            } )
            .catch( err => onSearchFailure( err ) );
    }

    onDrop( acceptedFiles, rejectedFiles ) {
        const beeFree = new BeeFree( window.BEE_FREE_LOCATION || config.BEE_FREE_LOCATION );

        if ( acceptedFiles.length == 0 ) {
            this.setState( {
                ...this.state,
                filesError : "Oops, we can't accept this file type."
            } );

            return;
        }
        /*
        if ( this.state.files.length > 0 ) {
            console.log( "Warning! You can only upload one file at a time." );
            this.setState( {
                ...this.state,
                filesError : "You can only upload one file at a time."
            } );
        }
        */

        acceptedFiles.forEach( videoFile => {
            this.takeSnapShotOfVideo( acceptedFiles[0], ( error, result ) => {
                let blob;
                let extension;
                let imageFile;

                if ( !error ) {
                    console.log( result );
                    blob = beeFree.dataURLtoBlob( result );
                    extension = blob.type ? blob.type.split( "/" )[1] : "err";
                    imageFile = beeFree.blobToFile( blob, `cover_image.${extension}` );
                    videoFile.preview = result;
                }

                this.setState( {
                    ...this.state,
                    files : error ? [] : [ videoFile ],
                    filesError : error ? error : "",
                    imageFile
                } );
            } );

            /*
            const reader = new FileReader();

            reader.onload = () => {
                const fileAsBinaryString = reader.result;
                // do whatever you want with the file content

                console.log( "DONE!" );
                console.log( fileAsBinaryString );

            };

            reader.onabort = () => {
                this.setState( {
                    ...this.state,
                    filesError : "Something went wrong!",
                    files : []
                } );
                console.log( "file reading was aborted" );
            };

            reader.onerror = () => {
                this.setState( {
                    ...this.state,
                    filesError : "Something went wrong!",
                    files : []
                } );
                console.log( "file reading has failed" );
            };

            reader.readAsBinaryString( file );


            // @TODO:. handle dow.URL.revokeObjectURL( file.preview );
            */
        } );
    }

    getUploadInputIssues() {
        const { targetHash, videoDescription, videoName, files } = this.state;
        const describers = [ videoName ]; //, videoDescription ];
        const uploadIsDescribed = describers.map( el => el.split( "" ) ).every( el => el.length > 0 );
        const hashIsValid = targetHash.replace( /[^\w\s]/gi, "" ).length == 64;
        const filesRequested = files.length > 0;
        const issues = [];

        if ( !uploadIsDescribed ) issues.push( "please enter a name for your video" );
        if ( !hashIsValid ) issues.push( "hash is not valid" );
        if ( !filesRequested ) issues.push( "no files offered" );

        if ( issues.length > 0 ) {
            const firstIssue = issues[0];
            issues[0] = firstIssue.charAt( 0 ).toUpperCase() + firstIssue.slice( 1 );
        }

        return issues;
    }

    // @TODO: Refactor.
    takeSnapShotOfVideo( file, callback ) {
        const maxTries = 5;
        let currentTries = 0;

        function finish( video, timeupdate, result, error ) {
            video.removeEventListener( "timeupdate", timeupdate );
            video.pause();

            callback( error, result );
        }

        function snapImage( url, video, timeupdate, callback ) {
            ++currentTries;

            let canvas = document.createElement( "canvas" );
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext( "2d" ).drawImage( video, 0, 0, canvas.width, canvas.height );

            let image = canvas.toDataURL();
            const success = image.length > 100000;

            if ( success ) {
                URL.revokeObjectURL( url );
                finish( video, timeupdate, image );
            }

            return success;
        }

        const fileReader = new FileReader();

        fileReader.onload = () => {
            const blob = new Blob( [ fileReader.result ], { type : file.type } );
            const url = URL.createObjectURL( blob );
            let video = document.createElement( "video" );
            //video.setAttribute( "type", "video/mp4" ); // @TODO: Wip, note that MKVs could possibly only work with Chrome, with this hack here

            const timeupdate = () => {
                if ( snapImage( url, video, timeupdate, callback ) ) {
                    //video.removeEventListener( "timeupdate", timeupdate );
                    //video.pause();
                } else if ( currentTries > maxTries ) {
                    finish( video, timeupdate, null, "Unable to create preview" );
                }
            };

            video.addEventListener( "loadeddata", () => {
                if ( snapImage( url, video, timeupdate, callback ) ) {
                    //video.removeEventListener( "timeupdate", timeupdate );
                } else if ( currentTries > maxTries ) {
                    finish( video, timeupdate, null, "Unable to create preview" );
                }
            } );

            video.addEventListener( "timeupdate", timeupdate );
            video.addEventListener(
                "error",
                event => {
                    finish( video, timeupdate, null, event.target.error.message );
                },
                true
            );
            video.preload = "metadata";
            video.src = url;

            // Load video in Safari / IE11
            video.muted = true;
            video.playsInline = true;
            video.play();
        };
        fileReader.readAsArrayBuffer( file );
    }

    render() {
        const previewStyle = {
            display : "inline",
            height : "100%"
            //width : 100,
            //height : 100
        };

        const {
            videoName,
            files,
            userHasRequestedUpload,
            filesError,
            message,
            isUploading,
            finalHash,
            videoDescription,
            targetHash
        } = this.state;

        return (
            <article className="col-10 mt-5 mx-auto">
                <ReactDropzone
                    accept="video/*"
                    className="row align-items-center"
                    multiple={false}
                    disabled={files.length > 0}
                    style={{
                        background : "lightgray",
                        height : "220px",
                        border : "1px dashed gray"
                    }}
                    onDrop={( acceptedFiles, rejectedFiles ) => {
                        this.onDrop( acceptedFiles, rejectedFiles );
                    }}
                >
                    {files.length > 0 ? (
                        <div className="mx-auto h-100">
                            {files.map( file => (
                                <img
                                    alt="Preview"
                                    className="uploadpage__imagepreview"
                                    key={file.preview}
                                    src={file.preview}
                                    style={previewStyle}
                                />
                            ) )}
                        </div>
                    ) : (
                        <div className="mx-auto">
                            <Button variant="primary">Drag or click</Button>
                        </div>
                    )}
                </ReactDropzone>
                <Row>
                    <InputGroup>
                        <Form
                            className="mt-5 w-100"
                            onSubmit={e => {
                                e.preventDefault();
                            }}
                        >
                            <Form.Group controlId="videoUpload">
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        placeholder="Swarm user hash"
                                        aria-label="Swarm user hash"
                                        aria-describedby="basic-addon2"
                                        name="targetHashInput"
                                        value={targetHash}
                                        onChange={e =>
                                            this.setState( {
                                                ...this.state,
                                                targetHash : e.target.value
                                            } )
                                        }
                                    />
                                    <InputGroup.Append>
                                        <Button
                                            type="submit"
                                            id="targetHashInput__append"
                                            variant="outline-secondary"
                                        >
                                            <FontAwesomeIcon icon="hashtag" />
                                        </Button>
                                    </InputGroup.Append>
                                </InputGroup>
                                <Row className="mt-2">
                                    <InputGroup className="mt-2 col-6">
                                        <Form.Control
                                            type="text"
                                            placeholder="Video name"
                                            aria-label="Video name"
                                            aria-describedby="basic-addon2"
                                            name="videoNameInput"
                                            value={videoName}
                                            onChange={e =>
                                                this.setState( {
                                                    ...this.state,
                                                    videoName : e.target.value
                                                } )
                                            }
                                        />
                                        <InputGroup.Append>
                                            <Button
                                                type="submit"
                                                id="videoNameInput__append"
                                                variant="outline-secondary"
                                            >
                                                <FontAwesomeIcon icon="pen" />
                                            </Button>
                                        </InputGroup.Append>
                                    </InputGroup>
                                </Row>
                                <Form.Group
                                    controlId="exampleForm.ControlTextarea1"
                                    placeholder="Video description"
                                    className="mt-4"
                                >
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        name="videoDescription"
                                        value={videoDescription}
                                        onChange={e =>
                                            this.setState( {
                                                ...this.state,
                                                videoDescription : e.target.value
                                            } )
                                        }
                                        rows="3"
                                    />
                                </Form.Group>
                            </Form.Group>
                        </Form>
                    </InputGroup>
                </Row>
                <Row className="mt-3">
                    <Button
                        variant="primary"
                        onClick={() =>
                            this.setState(
                                {
                                    ...this.state,
                                    userHasRequestedUpload : true
                                },
                                () => {
                                    const uploadPrimed = this.getUploadInputIssues().length == 0;
                                    if ( uploadPrimed ) {
                                        this.launchUpload();
                                    }
                                }
                            )
                        }
                    >
                        Upload
                    </Button>
                    {files.length > 0 && (
                        <Button
                            className="ml-3"
                            variant="danger"
                            onClick={() =>
                                this.setState( {
                                    ...this.state,
                                    files : [],
                                    filesError : null,
                                    message : null,
                                    imageFile : null,
                                    finalHash : null,
                                    isUploading : false
                                } )
                            }
                        >
                            Clear files
                        </Button>
                    )}
                </Row>

                {userHasRequestedUpload && this.getUploadInputIssues().length > 0 && (
                    <Row className="mt-5">
                        <Alert variant="warning">
                            <FontAwesomeIcon icon="exclamation-triangle" className="mr-2" />
                            There are a few issues with your input:{" "}
                            <strong>{this.getUploadInputIssues().join( ", " )}</strong>
                        </Alert>
                    </Row>
                )}

                {filesError && (
                    <Row className="mt-5">
                        <Alert dismissible variant="danger">
                            <FontAwesomeIcon icon="bug" className="mr-2" />
                            Oh no! <strong>{filesError}</strong>
                            <br />
                            <small className="mt-3">
                                Please try again with a different file(type)
                            </small>
                        </Alert>
                    </Row>
                )}

                {message && (
                    <Row className="mt-5">
                        <Alert dismissible variant="warning">
                            <FontAwesomeIcon icon="warning" className="mr-2" />
                            {message}
                        </Alert>
                    </Row>
                )}

                {isUploading && (
                    <Row className="mt-5">
                        <Alert variant="primary">Uploading...</Alert>
                    </Row>
                )}

                {finalHash && (
                    <Row className="mt-5">
                        <Alert variant="success" className="col-12">
                            <p className="m-0">
                                🎉 <strong>Awesome!</strong>
                            </p>
                            <p className="m-0">Your new hash is:</p>
                            <p className="mt-1 mb-0" style={{ wordWrap : "break-word" }}>
                                {finalHash}
                            </p>
                            <p
                                className="mt-3 mb-0"
                                style={{ cursor : "pointer" }}
                                onClick={() => this.getContentForHash( finalHash )}
                            >
                                <small>
                                    Click <strong>me</strong> if you want to view the video overview
                                    at this new hash
                                </small>
                            </p>
                        </Alert>
                    </Row>
                )}
            </article>
        );
    }
}
