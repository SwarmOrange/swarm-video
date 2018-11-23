import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { action } from "../Store/actions";

//import Footer from "../Footer";
//import s from "./root.scss";

class App extends Component {
    constructor( props ) {
        super( props );
        this.state = {};
    }

    componentDidMount() {}

    render() {
        const { dispatch } = this.props;

        return (
            <div id="appContainer" className="container-fluid pt-3 pb-3">
                <div className="app__activity row" className="container-fluid">
                    <p>Hello world</p>
                </div>
            </div>
        );
    }
}

App.propTypes = {
    dispatch : PropTypes.func.isRequired,
    errorMessage : PropTypes.string
};

// These props come from the application's state when it is started
function mapStateToProps( state ) {
    const { search } = state;

    return {
        search
    };
}

export default connect( mapStateToProps )( App );
