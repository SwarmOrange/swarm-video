/**
 * The global state selectors
 */

import { createSelector } from "reselect";

const selectGlobal = state => state.get( "global" );
const selectVideoPage = state => state.get( "videoPage" );

const makeSelectLoading = () =>
    createSelector( selectGlobal, globalState => globalState.get( "loading" ) );

const makeSelectVideoResult = () =>
    createSelector( selectVideoPage, searchState => searchState.get( "video" ) );
const makeSelectVideoSuggestions = () =>
    createSelector( selectVideoPage, searchState => searchState.get( "suggestions" ) );

const makeSelectVideoError = () =>
    createSelector( selectVideoPage, searchState => searchState.get( "err" ) );

export {
    makeSelectLoading,
    makeSelectVideoSuggestions,
    makeSelectVideoResult,
    makeSelectVideoError
};
