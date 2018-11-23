/**
 * MigrationPage
 *
 */

import React, { Fragment } from "react";
//import DropzoneComponent from "react-dropzone-component";
import { FormControl, Button, Form, InputGroup, Col, Row, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import validUrl from "is-url";
import PreviewList from "../../components/PreviewList";
import PropTypes from "prop-types";

import "./style.scss";

import ReactDropzone from "react-dropzone";

import BeeFree from "../../middleware/beefree";
import config from "../../../config/app.json";

let pollers = {
    updateRequest : null
};

export default class MigrationPage extends React.Component {
    constructor( props ) {
        super( props );

        this.state = {
            message : "",
            isRequestingUpdate : false,
            userHasRequestedUpdate : false,
            updateRequestError : null,
            updateTargetUUID : "",
            sdQuality : false,
            hdQuality : true,
            exception : null,
            targetUrl : "",
            userHasRequestedMigration : false,
            isRequestingMigration : false,
            migrationTargetHash : "",
            migrationStatus : null,
            migrationStatusSince : null,
            migrationProgress : null,
            responseUuid : null,
            migrationError : "",
            responseTimestamp : null,
            finalHash : null
        };

        this.launchMigration = this.launchMigration.bind( this );
        this.clearPoller = this.clearPoller.bind( this );
        this.hashIsValid = this.hashIsValid.bind( this );
        this.uuidIsValid = this.uuidIsValid.bind( this );
        this.getMigrationInputErrors = this.getMigrationInputErrors.bind( this );
    }

    hashIsValid( hash ) {
        return hash.replace( /[^\w\s]/gi, "" ).length == 64;
    }

    uuidIsValid( uuid ) {
        return uuid.trim().replace( /["'\\]/g, "" );
    }

    getMigrationInputErrors() {
        const { migrationTargetHash, targetUrl, sdQuality, hdQuality } = this.state;
        const hashIsValid = this.hashIsValid( migrationTargetHash );
        const cleanUrl = "http://www." + targetUrl.replace( "http://", "" ).replace( "www.", "" );
        const urlIsValid = validUrl( cleanUrl );

        const targetIsYoutube = targetUrl.includes( "youtube" );
        const issues = [];


        if ( !targetIsYoutube ) issues.push( "we only support YouTube right now" );
        if ( !hashIsValid ) issues.push( "hash is not valid" );
        if ( !urlIsValid ) issues.push( "url is not valid" );

        if ( issues.length > 0 ) {
            const firstIssue = issues[0];
            issues[0] = firstIssue.charAt( 0 ).toUpperCase() + firstIssue.slice( 1 );
        }

        return issues;
    }

    launchUpdateRequest( updateTargetUUID ) {
        const MIGRATION_PRODUCER_ORDER_ENDPOINT = window.MIGRATION_PRODUCER_ORDER_ENDPOINT || config.MIGRATION_PRODUCER_ORDER_ENDPOINT;
        const MIGRATION_PRODUCER_ORDER_USERNAME = window.MIGRATION_PRODUCER_ORDER_USERNAME || config.MIGRATION_PRODUCER_ORDER_USERNAME;
        const MIGRATION_PRODUCER_ORDER_PASSWORD = window.MIGRATION_PRODUCER_ORDER_PASSWORD || config.MIGRATION_PRODUCER_ORDER_PASSWORD;

        /*
        const {
            MIGRATION_PRODUCER_ORDER_ENDPOINT,
            MIGRATION_PRODUCER_ORDER_USERNAME,
            MIGRATION_PRODUCER_ORDER_PASSWORD
        } = config;
        */

        const url = `${MIGRATION_PRODUCER_ORDER_ENDPOINT}/${updateTargetUUID}`;
        const headers = new Headers();

        headers.set(
            "Authorization",
            "Basic " +
                Buffer.from(
                    MIGRATION_PRODUCER_ORDER_USERNAME + ":" + MIGRATION_PRODUCER_ORDER_PASSWORD
                ).toString( "base64" )
        );

        const requestOptions = {
            method : "GET",
            headers
        };

        this.setState( {
            ...this.state,
            isRequestingUpdate : true
        } );

        const updateRequestPoller = () => {
            fetch( url, requestOptions )
                .then( response => {
                    const { status, statusText } = response;
                    const responseIsOk = status == 200;

                    if ( !responseIsOk ) {
                        response.text().then( err => {
                            throw Error( err || statusText );
                        } );
                    } else {
                        return response.json();
                    }
                } )
                .then( orders => {
                    if ( !orders ) throw new Error( "No response from server" );

                    const noSuchOrder = orders.length == 0;
                    if ( noSuchOrder ) throw new Error( "No such order." );
                    const order = orders[0];

                    const { status, latest_hash } = order;
                    const statusSince = order[status + "_at"];

                    const migrationStatus = status;
                    const migrationStatusSince = new Date( statusSince ).toTimeString();

                    let migrationProgress;
                    let finalHash;
                    let intermediateHash;

                    if ( status == "accepted" ) {
                        migrationProgress =
                            "Your order has been registered, but work has not yet started.";
                    } else if ( status == "pulled" ) {
                        migrationProgress = "We are indexing your channel.";
                    } else if ( status == "pending_child_orders" ) {
                        migrationProgress = "We are trying to grab the videos.";
                        intermediateHash = latest_hash;
                    } else if ( status == "cancelled" ) {
                        this.clearPoller();
                    } else if ( status == "completed" ) {
                        this.clearPoller();
                        finalHash = latest_hash;
                    }


                    this.setState( {
                        ...this.state,
                        finalHash,
                        intermediateHash,
                        migrationProgress,
                        migrationStatus,
                        migrationError : status == "cancelled" ? "Order cancelled" : null,
                        migrationStatusSince : migrationStatusSince,
                        updateRequestError : null,
                        isRequestingUpdate : false,
                        responseTimestamp : new Date( Date.now() ).toTimeString()
                    }, ( ) => {
                         if ( intermediateHash ) this.getContentForHash( intermediateHash, false )
                    } );
                } )
                .catch( err =>
                    this.setState( {
                        ...this.state,
                        finalHash : null,
                        isRequestingUpdate : false,
                        migrationProgress : null,
                        migrationStatus : null,
                        updateRequestError : err.message,
                        responseTimestamp : new Date( Date.now() ).toTimeString()
                    } )
                );
        };

        // Set up a poller. If we already have a poller, then clear it first.
        this.clearPoller();
        updateRequestPoller();
        pollers.updateRequest = setInterval( updateRequestPoller, 30000 );
    }

    clearPoller() {
        if ( pollers.updateRequest ) clearInterval( pollers.updateRequest );
    }

    launchMigration() {
        const { migrationTargetHash, hdQuality, sdQuality, targetUrl } = this.state;
        const quality = hdQuality ? "hd" : "sd";

        const {
            MIGRATION_PRODUCER_ORDER_ENDPOINT,
            MIGRATION_PRODUCER_ORDER_USERNAME,
            MIGRATION_PRODUCER_ORDER_PASSWORD
        } = config;
        const url = `${MIGRATION_PRODUCER_ORDER_ENDPOINT}`;
        const headers = new Headers();

        headers.set(
            "Authorization",
            "Basic " +
                Buffer.from(
                    MIGRATION_PRODUCER_ORDER_USERNAME + ":" + MIGRATION_PRODUCER_ORDER_PASSWORD
                ).toString( "base64" )
        );
        headers.set( "Accept", "application/json, text/plain, */*" );
        headers.set( "Content-Type", "application/json" );

        const requestOptions = {
            method : "POST",
            headers,
            body : JSON.stringify( {
                quality,
                output : "video",
                upload_to : "beefree",
                swarm_hash : migrationTargetHash,
                url : targetUrl
            } )
        };

        this.setState( {
            ...this.state,
            isRequestingMigration : true
        } );

        fetch( url, requestOptions )
            .then( response => {
                const { status, statusText, data } = response;
                const responseIsOk = status == 200;

                if ( !responseIsOk ) {
                    response.text().then( err => {
                        throw Error( err || statusText );
                    } );
                } else {
                    return response.json();
                }
            } )
            .then( response => {
                if ( !response ) throw new Error( "No response from server" );

                const { uuid, message } = response;

                this.setState(
                    {
                        ...this.state,
                        responseUuid : null,
                        finalHash : null,
                        updateTargetUUID : uuid,
                        message : message,
                        migrationProgress : null,
                        isRequestingMigration : false,
                        migrationStatus : null,
                        responseTimestamp : new Date( Date.now() ).toTimeString()
                    },
                    () => {
                        setTimeout( () => {
                            this.launchUpdateRequest( uuid );
                        }, 5000 );
                    }
                );
            } )
            .catch( err =>
                this.setState( {
                    ...this.state,
                    finalHash : null,
                    migrationProgress : null,
                    isRequestingMigration : false,
                    migrationStatus : null,
                    updateRequestError : null,
                    migrationError : err.message,
                    responseTimestamp : new Date( Date.now() ).toTimeString()
                } )
            );
    }

    getContentForHash( swarmHash, shouldNavigate ) {
        const { onSearch, onSearchSuccess, onSearchFailure, history } = this.props;
        const beeFree = new BeeFree( window.BEE_FREE_LOCATION || config.BEE_FREE_LOCATION );

        onSearch( swarmHash );

        beeFree
            .getAllVideosFromHash( swarmHash )
            .then( results => {
                const alreadyAtSearchResults = history.location.pathname == "/search";

                onSearchSuccess( results );
                if ( shouldNavigate && !alreadyAtSearchResults ) history.push( "/search" );
            } )
            .catch( err => {
                this.setState( {
                    ...this.state,
                    exception : err.message
                } );
            } );
    }

    render() {
        const previewStyle = {
            display : "inline",
            height : "100%"
            //width : 100,
            //height : 100
        };

        const {
            migrationTargetHash,
            targetUrl,
            hdQuality,
            sdQuality,
            message,
            responseUuid,
            searchError,
            exception,
            updateTargetUUID,
            isRequestingMigration,
            responseTimestamp,
            finalHash,
            migrationProgress,
            isRequestingUpdate,
            migrationStatus,
            migrationStatusSince,
            userHasRequestedUpdate,
            updateRequestError,
            userHasRequestedMigration,
            migrationError
        } = this.state;

        const { requestVideo, requestVideoSuggestions, searchResults } = this.props;

        return (
            <article className="col-10 mt-5 mx-auto">
                <Row>
                    <h3 className="mb-3">Request update of ongoing migration</h3>
                    <InputGroup>
                        <Form
                            className="w-100"
                            onSubmit={e => {
                                e.preventDefault();
                            }}
                        >
                            <Form.Group controlId="updateRequest">
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        placeholder="Order uuid"
                                        aria-label="Order uuid"
                                        aria-describedby="basic-addon2"
                                        name="updateTargetUUIDInput"
                                        value={updateTargetUUID}
                                        onChange={e =>
                                            this.setState( {
                                                ...this.state,
                                                updateTargetUUID : e.target.value
                                            } )
                                        }
                                    />
                                    <InputGroup.Append>
                                        <Button
                                            type="submit"
                                            id="updateTargetUUIDInput__append"
                                            variant="outline-secondary"
                                        >
                                            <FontAwesomeIcon icon="fingerprint" />
                                        </Button>
                                    </InputGroup.Append>
                                </InputGroup>
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
                                    userHasRequestedUpdate : true
                                },
                                () => {
                                    const updateRequestPrimed = this.uuidIsValid( updateTargetUUID );

                                    if ( updateRequestPrimed ) {
                                        this.launchUpdateRequest( updateTargetUUID );
                                    }
                                }
                            )
                        }
                    >
                        Request
                    </Button>
                </Row>

                {userHasRequestedUpdate &&
                    !this.uuidIsValid( updateTargetUUID ) && (
                        <Row className="mt-3">
                            <Alert variant="warning">
                                <FontAwesomeIcon icon="exclamation-triangle" className="mr-2" />
                                This is not a valid uuid.
                            </Alert>
                        </Row>
                    )}

                <hr className="mt-5 mb-5" />

                <Row>
                    <h3 className="mb-3">Request new migration</h3>
                    <InputGroup>
                        <Form
                            className="w-100"
                            onSubmit={e => {
                                e.preventDefault();
                            }}
                        >
                            <Form.Group controlId="migrationRequest">
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        placeholder="Swarm user hash"
                                        aria-label="Swarm user hash"
                                        aria-describedby="basic-addon2"
                                        name="migrationTargetHashInput"
                                        value={migrationTargetHash}
                                        onChange={e =>
                                            this.setState( {
                                                ...this.state,
                                                migrationTargetHash : e.target.value
                                            } )
                                        }
                                    />
                                    <InputGroup.Append>
                                        <Button
                                            type="submit"
                                            id="migrationTargetHashInput__append"
                                            variant="outline-secondary"
                                        >
                                            <FontAwesomeIcon icon="hashtag" />
                                        </Button>
                                    </InputGroup.Append>
                                </InputGroup>

                                <InputGroup className="mt-2">
                                    <Form.Control
                                        type="text"
                                        placeholder="Video link"
                                        aria-label="Target url"
                                        aria-describedby="basic-addon2"
                                        name="targetUrlInput"
                                        value={targetUrl}
                                        onChange={e => {
                                            const url = e.target.value;

                                            this.setState( {
                                                ...this.state,
                                                targetUrl : url //"http://www." + url.replace( "http://", "" ).replace( "www.", "" )
                                            } );
                                        }}
                                    />
                                    <InputGroup.Append>
                                        <Button
                                            type="submit"
                                            id="targetUrlInput__append"
                                            variant="outline-secondary"
                                        >
                                            <FontAwesomeIcon icon="link" />
                                        </Button>
                                    </InputGroup.Append>
                                </InputGroup>
                            </Form.Group>
                        </Form>
                    </InputGroup>
                </Row>
                <Row>
                    <span className="col-2 pl-0">
                        <InputGroup>
                            <InputGroup.Prepend>
                                <InputGroup.Checkbox
                                    aria-label="Checkbox for following text input"
                                    value={true}
                                    checked={hdQuality}
                                    onChange={e => {
                                        this.setState( {
                                            ...this.state,
                                            hdQuality : !hdQuality,
                                            sdQuality : !sdQuality
                                        } );
                                    }}
                                />
                                <InputGroup.Text className="bg-white">HD</InputGroup.Text>
                            </InputGroup.Prepend>
                        </InputGroup>
                    </span>
                    <span className="col-2">
                        <InputGroup>
                            <InputGroup.Prepend>
                                <InputGroup.Checkbox
                                    aria-label="Checkbox for following text input"
                                    value={true}
                                    checked={sdQuality}
                                    onChange={e => {
                                        this.setState( {
                                            ...this.state,
                                            sdQuality : !sdQuality,
                                            hdQuality : !hdQuality
                                        } );
                                    }}
                                />
                                <InputGroup.Text className="bg-white">SD</InputGroup.Text>
                            </InputGroup.Prepend>
                        </InputGroup>
                    </span>
                </Row>
                <Row className="mt-4">
                    <Button
                        variant="primary"
                        onClick={() =>
                            this.setState(
                                {
                                    ...this.state,
                                    userHasRequestedMigration : true
                                },
                                () => {
                                    const migrationIsPrimed =
                                        this.getMigrationInputErrors().length == 0;

                                    if ( migrationIsPrimed ) {
                                        this.launchMigration();
                                    }
                                }
                            )
                        }
                    >
                        Migrate
                    </Button>
                </Row>

                {userHasRequestedMigration &&
                    this.getMigrationInputErrors().length > 0 && (
                        <Row className="mt-5" className="mt-5 mb-0">
                            <Alert variant="warning">
                                <FontAwesomeIcon icon="exclamation-triangle" className="mr-2" />
                                There are a few issues with your input:{" "}
                                <strong>{this.getMigrationInputErrors().join( ", " )}</strong>
                            </Alert>
                        </Row>
                    )}

                {updateRequestError && (
                    <Row className="mt-5">
                        <Alert dismissible variant="danger" className="mb-0">
                            <FontAwesomeIcon icon="bug" className="mr-2" />
                            Oh no! <strong>{updateRequestError}</strong>
                            <p className="mt-3 mb-0">
                                <small>Last update at {responseTimestamp}</small>
                            </p>
                        </Alert>
                    </Row>
                )}

                {migrationError && (
                    <Row className="mt-5" className="mt-5">
                        <Alert dismissible variant="danger">
                            <FontAwesomeIcon icon="bug" className="mr-2" />
                            Oh no! <strong>{migrationError}</strong>
                            <p className="mt-3 mb-0">
                                <small>Last update at {responseTimestamp}</small>
                            </p>
                        </Alert>
                    </Row>
                )}

                {message && (
                    <Row className="mt-5">
                        <Alert dismissible variant="info">
                            <FontAwesomeIcon icon="envelope-open" className="mr-2" />
                            {message}
                            <br />
                            <small>Your order uuid is: <strong>{updateTargetUUID}</strong></small>
                        </Alert>
                    </Row>
                )}

                {isRequestingUpdate && (
                    <Row className="mt-5">
                        <Alert variant="primary" className="mb-0">
                            Requesting update...
                        </Alert>
                    </Row>
                )}

                {isRequestingMigration && (
                    <Row className="mt-5">
                        <Alert variant="primary" className="mb-0">
                            Requesting migration...
                        </Alert>
                    </Row>
                )}

                {migrationStatus && !finalHash && (
                    <Row className="mt-5">
                        {migrationError ? (
                            <Alert variant="danger" className="col-12 mb-0">
                                <p className="m-0">
                                    <FontAwesomeIcon icon="times-circle" className="mr-2" />
                                    <strong>Darn!</strong> {migrationError}
                                </p>
                                <p className="mt-1 mb-0">
                                    Status is currently <strong>{migrationStatus}</strong> since {migrationStatusSince}
                                </p>
                                <p
                                    className="mt-3 mb-0"
                                    style={{ cursor : "pointer" }}
                                    onClick={() => this.getContentForHash( migrationStatus )}
                                >
                                    <small>
                                        Click <strong>me</strong> if you want to view the video
                                        overview at this new hash
                                    </small>
                                </p>
                            </Alert>
                        ) : (
                            <Alert variant="info" className="col-12 mb-0">
                                <p className="m-0">
                                    <FontAwesomeIcon icon="hourglass-half" className="mr-2" />
                                    We're still processing your request.
                                </p>
                                {migrationProgress && (
                                    <p className="mt-3 mb-0">{migrationProgress}</p>
                                )}
                                <p className="mt-1 mb-0">
                                    Status is currently <strong>{migrationStatus}</strong> since {migrationStatusSince}
                                </p>
                                <p className="mt-3 mb-0">Please check back later. This page will update periodically and show an overview of the videos as soon as we have results.</p>
                                <p className="mt-3 mb-0">
                                    <small>Last update at {responseTimestamp}</small>
                                </p>
                            </Alert>
                        )}
                    </Row>
                )}

                {finalHash && (
                    <Row className="mt-5">
                        <Alert variant="success" className="col-12">
                            <p className="m-0">
                                🎉 <strong>Awesome!</strong>
                            </p>
                            <p className="m-0">Migration is done! Your new hash is:</p>
                            <p className="mt-1 mb-0" style={{ wordWrap : "break-word" }}>
                                {finalHash}
                            </p>
                            <p
                                className="mt-3 mb-0"
                                style={{ cursor : "pointer" }}
                                onClick={() => this.getContentForHash( finalHash, true )}
                            >
                                <small>
                                    Click <strong>me</strong> if you want to view the video overview
                                    at this new hash
                                </small>
                            </p>
                        </Alert>
                    </Row>
                )}

                {(migrationStatus == "pending_child_orders" || migrationError == "completed" ) && searchResults && (
                    <Fragment>
                        <hr className="mt-5 mb-5" />

                        <section className="centered text-center mt-3 mb-3">
                            <h3 className="mb-3">Here's a live overview of the videos already migrated:</h3>
                                <PreviewList
                                    items={searchResults}
                                    direction="horizontal"
                                    shouldRenderNameOnCard={false}
                                    shouldRenderNameBelowCard={true}
                                    shouldRenderDescription={true}
                                    onClick={video => {
                                        requestVideo( video );
                                        requestVideoSuggestions( searchResults );
                                    }}
                                />
                            {searchError ? <p>{searchError}</p> : ""}
                        </section>
                    </Fragment>
                )}

                {exception && (
                    <Row className="mt-5">
                        <Alert dismissible variant="danger">
                            <FontAwesomeIcon icon="times-circle" className="mr-2" />
                            {exception}
                        </Alert>
                    </Row>
                )}
            </article>
        );
    }
}

MigrationPage.propTypes = {
    loading : PropTypes.bool,
    video : PropTypes.object,
    searchResults : PropTypes.array,
    requestVideo : PropTypes.func,
    requestVideoSuggestions : PropTypes.func,
    onSearch : PropTypes.func,
    onSearchSuccess : PropTypes.func,
    onSearchFailure : PropTypes.func
};
