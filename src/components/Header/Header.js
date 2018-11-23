import React from "react";
import { ReactDOM } from "react-dom";
import { Link } from "react-router-dom";
import SearchBar from "../SearchBar";
import {
    Button,
    DropdownButton,
    Dropdown,
    ButtonGroup,
    Form,
    ButtonToolbar
} from "react-bootstrap";
// import Banner from './images/banner.jpg';
import "./style.scss";

class Header extends React.PureComponent {
    constructor( props ) {
        super( props );

        this.logoClick = this.logoClick.bind( this );
    }

    // When you are at the homepage already ("/"), and click again on the logo, it will refresh the page completely
    logoClick() {
        const { history } = this.props;
        const { location } = history;

        if ( location.pathname == "/" ) window.location.reload();
    }

    render() {
        return (
            <div className="header mt-2 ml-5 mr-5">
                <div className="nav-bar row">
                    <h4 className="col-4">
                        <Link className="router-link" to="/" onClick={this.logoClick}>
                            BeeReal
                        </Link>
                    </h4>
                    <span className="col-4">
                        <SearchBar history={this.props.history} />
                    </span>
                    <span className="col-4 d-flex  flex-row-reverse">
                        <ButtonGroup className="justify-content-start" vertical>
                            <DropdownButton
                                as={ButtonGroup}
                                title="Publish"
                                id="bg-vertical-dropdown-1"
                            >
                                <Dropdown.Item eventKey="1" href="#/upload">
                                    Upload
                                </Dropdown.Item>
                                <Dropdown.Item eventKey="2" href="#/migrate">
                                    Migrate
                                </Dropdown.Item>
                            </DropdownButton>
                        </ButtonGroup>
                    </span>

                    {/*
                    <ButtonToolbar className="col-4 d-flex flex-row-reverse">
                        <Link className="ml-3 router-link" to="/upload">
                            <Button variant="primary">Upload</Button>
                        </Link>
                        <Link className="ml-3 router-link" to="/migrate">
                            <Button variant="primary">Migrate</Button>
                        </Link>
                    </ButtonToolbar>


                    */}
                </div>
            </div>
        );
    }
}

export default Header;
