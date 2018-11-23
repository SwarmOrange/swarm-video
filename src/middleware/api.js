/*
//const config = require( "../../config/app/config.json" );
const HOST = window.location.host.split( ":" )[0];
//const BASE_URL_BEE_FREE = `http://${HOST}:${appConfig.backend.rest.port}/api/`;
const BASE_URL_BEE_FREE = "http://beefree.me/bzz:/";

function callApi( endpoint, shouldBeAuthenticated, method, payload ) {
    let token = localStorage.getItem( "id_token" ) || null;
    let config = {
        credentials : "same-origin"
    };

    console.log( "Calling API..." );
    console.log( endpoint, shouldBeAuthenticated, method, payload );

    if ( shouldBeAuthenticated ) {
        if ( token ) {
            config = {
                headers : { Authorization : `JWT ${token}` }
            };
        } else {
            throw "No token saved!";
        }
    }

    config.headers = {
        ...config.headers,
        "Content-Type" : "application/text",
        Accept : "application/json",
        Origin : `http://${HOST}:${appConfig.frontend.port}`
    };
    config.mode = process.env.NODE_ENV == "dev" ? "no-cors" : "cors";

    if ( method == "get" ) {
        config.method = "get";
    } else if ( method == "post" ) {
        config.headers = {
            ...config.headers,
            "Content-Type" : "application/json",
            Accept : "application/json"
        };

        config.body = JSON.stringify( payload );
    }

    return fetch( BASE_URL_BEE_FREE + endpoint, config )
        .then( response => response.text().then( text => ( { text, response } ) ) )
        .then( ( { text, response } ) => {
            if ( !response.ok ) {
                console.log( "response nok" );
                return Promise.reject( text );
            }

            return text;
        } )
        .catch( err => {
            console.log( err );
            throw new Error( err ); // throw so that the error handler for store update sees it
        } );
}

export const CALL_API = Symbol( "Call API" );

export default store => next => action => {
    const callAPI = action[CALL_API];

    // So the middleware doesn't get applied to every single action
    if ( typeof callAPI === "undefined" ) {
        return next( action );
    }

    let { endpoint, types, shouldBeAuthenticated, method, payload } = callAPI;

    const [ requestType, successType, errorType ] = types;

    // Passing the shouldBeAuthenticated boolean back in our data will let us distinguish
    return callApi( endpoint, shouldBeAuthenticated, method, payload ).then(
        response => {
            return next( {
                response,
                shouldBeAuthenticated,
                type : successType
            } );
        },

        error => {
            return next( {
                error : error.message || "There was an error.",
                type : errorType,
                payload : payload
            } );
        }
    );
};
*/
