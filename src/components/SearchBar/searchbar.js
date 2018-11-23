import React from "react";
//import { ReactDOM } from "react-dom";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Form, InputGroup, FormControl, ButtonToolbar } from "react-bootstrap";

import BeeFree from "../../middleware/beefree";
import config from "../../../config/app.json";

// import Banner from './images/banner.jpg';
import "./style.scss";

export default class SearchBar extends React.Component {
    constructor( props ) {
        super( props );

        this.handleSearchSubmission = this.handleSearchSubmission.bind( this );

        this.state = {
            searchBarValue : ""
        };
    }

    /*
    componentDidUpdate( prevProps ) {
        if ( this.props.searchResults !== prevProps.searchResults ) {
            const { history } = this.props;
            const alreadyAtSearchResults = history.location.pathname == "/search";

            if ( !alreadyAtSearchResults ) history.push( "/search" );
        }
    }
    */

    handleSearchSubmission( event ) {
        const beeFree = new BeeFree( window.BEE_FREE_LOCATION || config.BEE_FREE_LOCATION );
        const { onSearch, onSearchSuccess, onSearchFailure, history } = this.props;
        const swarmHash = this.state.searchBarValue.replace( "/", "" );

        event.preventDefault();
        onSearch( swarmHash );

        beeFree
            .getAllVideosFromHash( swarmHash )
            .then( results => {
                const alreadyAtSearchResults = history.location.pathname == "/search";

                onSearchSuccess( results );
                if ( !alreadyAtSearchResults ) history.push( "/search" );
            } )
            .catch( err => onSearchFailure( err ) );
    }

    render() {
        return (
            <Form onSubmit={this.handleSearchSubmission}>
                <Form.Group controlId="searchBar">
                    <InputGroup>
                        <Form.Control
                            type="text"
                            placeholder="Swarm user hash"
                            aria-label="Swarm user hash"
                            aria-describedby="basic-addon2"
                            name="searchBar"
                            value={this.state.searchBarValue}
                            onChange={e =>
                                this.setState( {
                                    ...this.state,
                                    searchBarValue : e.target.value
                                } )
                            }
                        />
                        <InputGroup.Append>
                            <Button
                                type="submit"
                                id="searchBar__append"
                                variant="outline-secondary"
                            >
                                <FontAwesomeIcon icon="search" />
                            </Button>
                        </InputGroup.Append>
                    </InputGroup>
                </Form.Group>
            </Form>
        );
    }
}

SearchBar.propTypes = {
    onSearch : PropTypes.func,
    searchResults : PropTypes.array,
    onSearchSuccess : PropTypes.func,
    onSearchFailure : PropTypes.func
};
