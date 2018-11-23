import { connect } from "react-redux";
import { compose } from "redux";
import { createStructuredSelector } from "reselect";
import injectReducer from "../../components/Store/inject_reducer";
import {
    makeSelectLoading,
    makeSelectVideoError,
    makeSelectVideoResult,
    makeSelectVideoSuggestions
} from "./selectors";
import { requestVideo, requestVideoSuggestions } from "./actions";
import reducer from "./reducer";
import VideoPage from "./VideoPage.js";

const mapDispatchToProps = dispatch => ( {
    requestVideo : input => dispatch( requestVideo( input ) )
} );

const mapStateToProps = createStructuredSelector( {
    loading : makeSelectLoading(),
    video : makeSelectVideoResult(),
    suggestions : makeSelectVideoSuggestions()
    //error : makeSelectVideoError()
} );

const withConnect = connect(
    mapStateToProps,
    mapDispatchToProps
);

const withReducer = injectReducer( { key : "videoPage", reducer } );

export default compose(
    withReducer,
    withConnect
)( VideoPage );
export { mapDispatchToProps };
