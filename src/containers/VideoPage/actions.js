import {
    VIDEO_REQUEST,
    VIDEO_SUGGESTIONS_REQUEST,
    VIDEO_SUCCESS,
    VIDEO_FAILURE
} from "./constants";

/**
 * Changes the input field of the form
 *
 * @param  {input} string The input of the VIDEObar
 *
 * @return {object}    An action object with a type of CHANGE_USERNAME
 */

export function requestVideo( video ) {
    return {
        type : VIDEO_REQUEST,
        video
    };
}

export function requestVideoSuggestions( suggestions ) {
    return {
        type : VIDEO_SUGGESTIONS_REQUEST,
        suggestions
    };
}

/*
export function resolveVideo( video ) {
    return {
        type : VIDEO_SUCCESS,
        video
    };
}

export function rejectVideo( err ) {
    return {
        type : VIDEO_FAILURE,
        err
    };
}
*/
