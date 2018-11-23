/*******************************
 * The app entry file
 ******************************/
/*eslint-disable */

/**
 * { Dependencies }
 */
//const config = require(`../config/app/config.json`);

// Extras
require("./favicon.ico");
//import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
//import "react-dropzone-component/styles/filepicker.css";
//import "dropzone/dist/dropzone.css";
import "video-react/dist/video-react.css";
//import "font-awesome/css/font-awesome.css";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
    faSearch,
    faLink,
    faPen,
    faHashtag,
    faBug,
    faHourglassHalf,
    faEnvelopeOpen,
    faTimesCircle,
    faFingerprint,
    faExclamationTriangle
} from "@fortawesome/free-solid-svg-icons";
library.add(
    faSearch,
    faLink,
    faHourglassHalf,
    faTimesCircle,
    faPen,
    faEnvelopeOpen,
    faHashtag,
    faFingerprint,
    faBug,
    faExclamationTriangle
);

const HOST = window.location.host.split(":")[0];

import createHashHistory from "history/createHashHistory";

// React
import config from "../config/app.json";
import React from "react";
import ReactDOM from "react-dom";

// Redux
import { ConnectedRouter } from "react-router-redux";
import { HashRouter } from "react-router-dom";
import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";

import reducers from "./components/store/reducers";
import configureStore from "./components/store/configure_store";

//const createStoreWithMiddleware = applyMiddleware(thunkMiddleware, api, logger)(createStore);
//const store = createStoreWithMiddleware(reducers);

// Create redux store with history
const initialState = {};
const history = createHashHistory();
const store = configureStore(initialState, history);
const MOUNT_NODE = document.getElementById("app");

// The app
import App from "./containers/App";
//import App from "./components/Root";

/**
 * { Init }
 * Initiate the app
 */

// Config override
fetch("config.json")
.then(response => response.json())
.then(config => {
    const options = Object.keys(config);

    for (const key of options) {
        window[key] = config[key]
    }

    loadReact()

}).catch( err => loadReact())

function loadReact() {
    ReactDOM.render(
        <Provider store={store}>
            {/* <LanguageProvider messages={messages}> */}
            <ConnectedRouter history={history}>
                <HashRouter>
                    <App history={history} config={config} defaultHash={window.DEFAULT_HASH || config.DEFAULT_HASH} />
                </HashRouter>
            </ConnectedRouter>
            {/* </LanguageProvider> */}
        </Provider>,
        MOUNT_NODE
    );
}

