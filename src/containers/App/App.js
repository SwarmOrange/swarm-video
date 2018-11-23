/**
 *
 * App
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 */

import React from "react";
import { Helmet } from "react-helmet";
import { Switch, Route } from "react-router-dom";

import HomePage from "../HomePage/Loadable";
import SearchResultsPage from "../SearchResultsPage/Loadable";
import VideoPage from "../VideoPage/Loadable";
import UploadPage from "../UploadPage/Loadable";
import NotFoundPage from "../NotFoundPage/Loadable";
import MigrationPage from "../MigrationPage/Loadable";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "./style.scss";

const App = props => {
    const { defaultHash, history } = props;

    return (
        <div className="app-wrapper">
            <Helmet titleTemplate="%s" defaultTitle="BeeReal">
                <meta name="description" content="The swarm social module for videos" />
            </Helmet>
            <Header history={history} />
            <div className="mb-5">
                <hr className="mt-10" />
                <Switch>
                    <Route exact path="/" render={() => <HomePage defaultHash={window.DEFAULT_HASH || defaultHash} />} />
                    <Route
                        exact
                        path="/search"
                        render={() => (
                            <SearchResultsPage history={history} defaultHash={window.DEFAULT_HASH || defaultHash} />
                        )}
                    />
                    <Route path="/migrate" render={() => <MigrationPage history={history} />} />
                    <Route path="/view" render={() => <VideoPage history={history} />} />
                    <Route path="/upload" render={() => <UploadPage history={history} />} />
                    <Route path="*" component={NotFoundPage} />
                </Switch>
            </div>
            {/*<Footer />*/}
        </div>
    );
};

export default App;
