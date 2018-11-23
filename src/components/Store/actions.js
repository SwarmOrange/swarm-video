// The middleware to call the API
import { CALL_API } from "../../middleware/api";

export const API_ACTION = "API_ACTION";
export const API_ACTION_SUCCESS = "API_ACTION_SUCCESS";
export const API_ACTION_FAILURE = "API_ACTION_FAILURE";
export function someApiAction( payload ) {
    return {
        [CALL_API] : {
            endpoint : "someEndpoint",
            shouldBeAuthenticated : true,
            method : "post",
            payload : payload,
            types : [ API_ACTION, API_ACTION_SUCCESS, API_ACTION_FAILURE ]
        }
    };
}

/*
export const API_ACTION = "API_ACTION";
export const API_ACTION_SUCCESS = "API_ACTION_SUCCESS";
export const API_ACTION_FAILURE = "API_ACTION_FAILURE";
export function apiAction( payload ) {
    return {
        [CALL_API] : {
            endpoint : "someEndpoint",
            shouldBeAuthenticated : true,
            method : "post",
            payload : payload,
            types : [ API_ACTION, API_ACTION_SUCCESS, API_ACTION_FAILURE ]
        }
    };
}
*/
