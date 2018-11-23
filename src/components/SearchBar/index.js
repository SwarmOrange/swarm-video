import { connect } from "react-redux";
import { compose } from "redux";
import { createStructuredSelector } from "reselect";
import injectReducer from "../Store/inject_reducer";
//import { loadRepos } from "../App/actions";
import { makeSelectSearchBarResult } from "../../containers/App/selectors";
import { requestSearch, resolveSearch, rejectSearch } from "./actions";
//import { selectSearchError, selectSearchResults } from "./selectors";
import reducer from "./reducer";
import SearchBar from "./SearchBar.js";

const mapDispatchToProps = dispatch => ( {
    onSearch : input => dispatch( requestSearch( input ) ),
    onSearchSuccess : input => dispatch( resolveSearch( input ) ),
    onSearchFailure : input => dispatch( rejectSearch( input ) )
} );

const mapStateToProps = createStructuredSelector( {
    searchResults : makeSelectSearchBarResult()
    //loading : makeSelectLoading()
    //error : makeSelectError()
} );

const withConnect = connect(
    mapStateToProps,
    mapDispatchToProps
);

const withReducer = injectReducer( { key : "searchBar", reducer } );

export default compose(
    withReducer,
    withConnect
)( SearchBar );
export { mapDispatchToProps };
