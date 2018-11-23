import { fromJS } from "immutable";
import { SEARCH_REQUEST, SEARCH_SUCCESS, SEARCH_FAILURE } from "./constants";

// The initial state of the App
const initialState = fromJS( {
    query : null,
    isFetching : false,
    results : null,
    err : null
} );

function searchBarReducer( state = initialState, action ) {
    switch ( action.type ) {
    case SEARCH_REQUEST:
        return state.merge( {
            err : null,
            query : action.input,
            isFetching : true,
            results : null
        } );
        /*
        return Object.assign( {}, state, {
            ...state,
            err : null,
            query : action.input,
            isFetching : true,
            results : null
        } );
        //return state.set( "isFetching", true );
        */
    case SEARCH_SUCCESS:
        return state.merge( {
            err : null,
            isFetching : false,
            results : action.results
        } );
    case SEARCH_FAILURE:
        return state.merge( {
            isFetching : false,
            err : action.err.message || JSON.stringify( action.err )
        } );
    default:
        return state;
    }
}

export default searchBarReducer;
