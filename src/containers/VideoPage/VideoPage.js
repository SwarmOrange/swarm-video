/**
 * VideoPage
 *
 *
 */

import { Player } from "video-react";
import React from "react";
import { Fragment } from "react";
import "./style.scss";
import PreviewList from "../../components/PreviewList";
import PropTypes from "prop-types";
import { Card, Image, Row, Col } from "react-bootstrap";

function filterSuggestions( suggestions, currentVideo ) {
    return suggestions.filter( suggestion => {
        const currentFile = currentVideo.file_url;
        const suggestedFile = suggestion.file_url;
        const matchesCurrentVideo = currentFile == suggestedFile;

        return !matchesCurrentVideo;
    } );
}

export default class VideoPage extends React.PureComponent {
    render() {
        const { video, suggestions, requestVideo } = this.props;

        if ( !video ) {
            this.props.history.push( "/" );

            return <p>Reloading...</p>;
        }

        console.log( video );
        console.log( suggestions );

        const { file_url, description, name } = video;
        const placeholderName = "Lorem ipsum dolor sit amet";
        return (
            <Fragment>
                <Row className="p-5">
                    <Col className="col-12 mb-3">
                        <h1>{name || placeholderName}</h1>
                    </Col>

                    <Col lg="9" md="8" s="12" className="pb-5">
                        <Player autoPlay key={file_url}>
                            <source src={file_url} />
                        </Player>
                        <p className="mt-3">{description}</p>
                    </Col>
                    <Col>
                        <PreviewList
                            items={filterSuggestions( suggestions, video )}
                            direction="vertical"
                            shouldRenderNameOnCard={false}
                            shouldRenderNameBelowCard={true}
                            shouldRenderDescription={true}
                            onClick={requestVideo}
                        />
                    </Col>
                </Row>
            </Fragment>
        );
    }
}

VideoPage.propTypes = {
    video : PropTypes.object,
    requestVideo : PropTypes.func,
    suggestions : PropTypes.array,
    history : PropTypes.object
};
