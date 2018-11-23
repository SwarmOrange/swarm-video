import React from "react";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet";
import PreviewList from "../../components/PreviewList";
import "./style.scss";
//import request from "request";

import BeeFree from "../../middleware/beefree";
import config from "../../../config/app.json";


export default class HomePage extends React.PureComponent {
    // On initial load, get some suggested videos.
    // This is from a pre-set hash for now
    componentDidMount() {
        const { searchResults, defaultHash } = this.props;

        this.getContentForHash( defaultHash );
    }

    getWelcomeMessage() {
        const { searchResults, searchError } = this.props;

        if ( searchError ) return "";
        else if ( !searchResults ) return "Loading...";
        //"Input a hash into the search bar and hit the icon";
        else return "";
    }

    getContentForHash( swarmHash ) {
        const beeFree = new BeeFree( window.BEE_FREE_LOCATION || config.BEE_FREE_LOCATION );
        const { onSearch, onSearchSuccess, onSearchFailure } = this.props;
        onSearch( swarmHash );

        beeFree
            .getAllVideosFromHash( swarmHash )
            .then( results => {
                onSearchSuccess( results );
            } )
            .catch( err => onSearchFailure( err ) );
    }

    render() {
        const {
            loading,
            searchResults,
            searchError,
            requestVideo,
            requestVideoSuggestions,
            video
        } = this.props;

        return (
            <article>
                <Helmet>
                    <title>BeeReal</title>
                    <meta name="description" content="Videos, on SWARM!" />
                </Helmet>
                <div className="home-page">
                    <section className="centered mt-3 mb-3 text-center">
                        {searchResults && (
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
                        )}
                        <h5 className="mt-5">{this.getWelcomeMessage()}</h5>
                        {searchError ? <p>{searchError}</p> : ""}
                    </section>
                </div>
            </article>
        );
    }
}

HomePage.propTypes = {
    loading : PropTypes.bool,
    error : PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
    video : PropTypes.object,
    searchResults : PropTypes.array,
    requestVideo : PropTypes.func,
    requestVideoSuggestions : PropTypes.func,
    defaultHash : PropTypes.string,
    onSearch : PropTypes.func,
    onSearchSuccess : PropTypes.func,
    onSearchFailure : PropTypes.func
};
