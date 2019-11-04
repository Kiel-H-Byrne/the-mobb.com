import { all } from "redux-saga/effects";

//Watchers
// import authSaga from "./auth";
// import init from "./init";
import listingsWatcherSaga from "./listings";
import categoriesWatcherSage from "./categories";

export default function* rootSaga() {
  yield all([listingsWatcherSaga(), categoriesWatcherSage()]);
}
