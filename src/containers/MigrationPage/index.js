import { connect } from "react-redux";
import { compose } from "redux";
import { createStructuredSelector } from "reselect";
import injectReducer from "../../components/Store/inject_reducer";
import {
    makeSelectLoading,
    makeSelectError,
    makeSelectSearchBarResult,
    makeSelectSearchBarError
} from "../../containers/App/selectors";
//import { loadRepos } from "../App/actions";
//import reducer from "./reducer";
import MigrationPage from "./MigrationPage";
import { requestVideo, requestVideoSuggestions } from "./../VideoPage/actions";
import { makeSelectVideoResult } from "./../VideoPage/selectors";
import { requestSearch, resolveSearch, rejectSearch } from "../../components/SearchBar/actions";
//import { selectSearchError, selectSearchResults } from "../../components/SearchBar/selectors";

const mapDispatchToProps = dispatch => ( {
    onSearch : input => dispatch( requestSearch( input ) ),
    requestVideo : input => dispatch( requestVideo( input ) ),
    requestVideoSuggestions : input => dispatch( requestVideoSuggestions( input ) ),
    onSearchSuccess : input => dispatch( resolveSearch( input ) ),
    onSearchFailure : input => dispatch( rejectSearch( input ) )
} );

const mapStateToProps = createStructuredSelector( {
    //video : makeSelectVideoResult(),
    searchError : makeSelectSearchBarError(),
    searchResults : makeSelectSearchBarResult(),
    loading : makeSelectLoading(),
    error : makeSelectError()
} );

const withConnect = connect(
    mapStateToProps,
    mapDispatchToProps
);

//const withReducer = injectReducer( { key : "home", reducer } );

export default compose(
    //withReducer,
    withConnect
)( MigrationPage );
export { mapDispatchToProps };
