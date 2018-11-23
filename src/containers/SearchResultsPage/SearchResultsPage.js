import React from "react";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet";
import PreviewList from "../../components/PreviewList";
import "./style.scss";
//import request from "request";

/*
Page @ http://beefree.me/bzz:/68fbd10c6538b21663a058e37876185d22e39af70b0ad0cde6eac62d7a24bbf7/

Profile @ http://beefree.me/bzz:/68fbd10c6538b21663a058e37876185d22e39af70b0ad0cde6eac62d7a24bbf7/social/profile.json
HASH/social/profile.json

Video Albums @ http://beefree.me/bzz:/68fbd10c6538b21663a058e37876185d22e39af70b0ad0cde6eac62d7a24bbf7/social/videoalbum/info.json
HASH/social/videoalbum/info.json

Video Album example @ http://beefree.me/bzz-list:/68fbd10c6538b21663a058e37876185d22e39af70b0ad0cde6eac62d7a24bbf7/social/videoalbum/2/
HASH/social/videoalbum/2/
*/

import BeeFree from "../../middleware/beefree";
import config from "../../../config/app.json";

export default class SearchResultsPage extends React.PureComponent {
    // On initial load, get some suggested videos.
    // This is from a pre-set hash for now
    componentDidMount() {
        const { searchResults, history } = this.props;

        if ( !searchResults || searchResults.length == 0 ) history.push( "/" );
    }

    getWelcomeMessage() {
        const { searchResults, searchError } = this.props;

        if ( searchError ) return "";
        else if ( !searchResults ) return "Loading...";
        //"Input a hash into the search bar and hit the icon";
        else return "";
    }

    getContentForHash( swarmHash ) {
        const { onSearch, onSearchSuccess, onSearchFailure } = this.props;
        const beeFree = new BeeFree( window.BEE_FREE_LOCATION || config.BEE_FREE_LOCATION );

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
                <div>
                    <section className="centered text-center mt-3 mb-3">
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

SearchResultsPage.propTypes = {
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
