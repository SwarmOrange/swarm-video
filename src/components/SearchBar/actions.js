import { SEARCH_REQUEST, SEARCH_SUCCESS, SEARCH_FAILURE } from "./constants";

/**
 * Changes the input field of the form
 *
 * @param  {input} string The input of the searchbar
 *
 * @return {object}    An action object with a type of CHANGE_USERNAME
 */

export function requestSearch( input ) {
    return {
        type : SEARCH_REQUEST,
        input
    };
}

export function resolveSearch( results ) {
    return {
        type : SEARCH_SUCCESS,
        results
    };
}

export function rejectSearch( err ) {
    return {
        type : SEARCH_FAILURE,
        err
    };
}
