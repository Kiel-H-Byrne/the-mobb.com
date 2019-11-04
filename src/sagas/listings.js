import { all, call, put, fork, takeEvery } from "redux-saga/effects";
//Actions
import * as ACTIONS from "../actions/actionConstants";

//DB Functions
import { getCollection } from "../db/mlab";

function* listingsFetchWatcherSaga() {
  // console.log("watching...");
  yield takeEvery(ACTIONS.LISTINGS_API_REQUEST, listingsFetchSaga);
}

function* listingsFetchSaga() {
  yield put({ type: ACTIONS.LISTINGS_API_START });
  try {
    const listings = yield call(getCollection, "listings");
    yield put({ type: ACTIONS.LISTINGS_API_RESULT, payload: listings });
  } catch (error) {
    console.warn("ERROR:", error);
    yield put({ type: ACTIONS.LISTINGS_API_RESULT, error: error });
  }
  
}
export default function* listingsWatcherSaga() {
  yield all([fork(listingsFetchWatcherSaga)]);
}
