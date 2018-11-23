/**
 * The global state selectors
 */

import { createSelector } from "reselect";

const selectGlobal = state => state.get( "global" );
const selectRoute = state => state.get( "route" );
const selectSearchBar = state => state.get( "searchBar" );

const makeSelectLoading = () =>
    createSelector( selectGlobal, globalState => globalState.get( "loading" ) );

const makeSelectSearchBarResult = () =>
    createSelector( selectSearchBar, searchState => {
        const data = searchState.get( "results" );

        //@TODO: remove toJs() call
        if ( data ) return data.toJS();
        else return data;
    } );

const makeSelectSearchBarError = () =>
    createSelector( selectSearchBar, searchState => searchState.get( "err" ) );

const makeSelectError = () => createSelector( selectGlobal, globalState => globalState.get( "error" ) );

const makeSelectLocation = () =>
    createSelector( selectRoute, routeState => routeState.get( "location" ).toJS() );

export {
    selectGlobal,
    makeSelectLoading,
    makeSelectError,
    makeSelectLocation,
    makeSelectSearchBarResult,
    makeSelectSearchBarError
};
