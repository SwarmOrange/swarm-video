/**
 * The global state selectors
 */

const selectSearchResults = state => state.get( "results" );
const selectSearchError = state => state.get( "err" );

export { selectSearchResults, selectSearchError };
