import { all, call, put, fork, takeEvery } from "redux-saga/effects";
//Actions
import * as ACTIONS from "../actions/actionConstants";

//DB Functions
import { getCollection } from "../db/mlab";

function* categoriesFetchWatcherSaga() {
  // console.log("watching...");
  yield takeEvery(ACTIONS.CATEGORIES_API_REQUEST, categoriesFetchSaga);
}

function* categoriesFetchSaga() {
  yield put({ type: ACTIONS.CATEGORIES_API_START });
  try {
    const categories = yield call(getCollection, "categories");
    yield put({ type: ACTIONS.CATEGORIES_API_RESULT, payload: categories });
  } catch (error) {
    console.warn("ERROR:", error);
    yield put({ type: ACTIONS.CATEGORIES_API_RESULT, error: error });
  }
}
export default function* categoriesWatcherSaga() {
  yield all([fork(categoriesFetchWatcherSaga)]);
}
