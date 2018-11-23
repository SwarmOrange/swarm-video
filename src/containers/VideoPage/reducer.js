import { fromJS } from "immutable";
import {
    VIDEO_REQUEST,
    VIDEO_SUGGESTIONS_REQUEST,
    VIDEO_SUCCESS,
    VIDEO_FAILURE
} from "./constants";

// The initial state of the App
const initialState = fromJS( {
    video : null,
    suggestions : null
    //err : null
} );

function videoReducer( state = initialState, action ) {
    switch ( action.type ) {
    case VIDEO_REQUEST:
            //return state.merge( { video : action.video, err : null } );
        return state.set( "video", action.video );
    case VIDEO_SUGGESTIONS_REQUEST:
        return state.set( "suggestions", action.suggestions );
        //return state.merge( { suggestions : action.suggestions } );
        /*
    case VIDEO_SUCCESS:
        return state.set( "selectedVideo", action.url );
    case VIDEO_FAILURE:
        return state.set( "err", action.err.message || JSON.stringify( action.err ) );
        */
    default:
        return state;
    }
}

export default videoReducer;
