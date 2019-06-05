import { call, put, takeEvery } from "redux-saga/effects";

//Actions
import * as ACTIONS from "../actions/actionConstants";

//DB Functions
import { getCollection } from "../db/mlab";

// import { push } from "react-router-redux";

function* handleListings(action) {
  switch (action.aspect) {
    // case "getListing": {
    //   yield put({
    //     type: ACTIONS.UPDATE_LISTINGS_ASPECT,
    //     aspect: "fetchingListing",
    //     payload: true
    //   });

    //   const listing = yield call(getListing, action.payload);
    //   if (listing) {
    //     yield put({
    //       type: ACTIONS.UPDATE_FETCHED_LISTINGS,
    //       payload: listing
    //     });

    //     yield put({
    //       type: ACTIONS.UPDATE_LISTINGS_ASPECT,
    //       aspect: "thisListing",
    //       payload: listing
    //     });
    //   }

    //   yield put({
    //     type: ACTIONS.UPDATE_LISTINGS_ASPECT,
    //     aspect: "fetchingListing",
    //     payload: false
    //   });
    //   break;
    // }

    case "getListings": {
      yield put({
        type: ACTIONS.UPDATE_LISTINGS_ASPECT,
        aspect: "fetching",
        payload: true
      });
      try {
        const listings = yield call(getCollection("listings"));
        yield put({
          type: ACTIONS.UPDATE_LISTINGS_ASPECT,
          aspect: "listings",
          payload: listings
        });
      } catch (error) {
        yield put({
          type: ACTIONS.UPDATE_LISTINGS_ASPECT,
          aspect: "fetchListingsError",
          payload: error
        });
      }
      yield put({
        type: ACTIONS.UPDATE_LISTINGS_ASPECT,
        aspect: "fetching",
        payload: false
      });
      break;
    }

    // case "submitListing": {
    //   try {
    //     const id = yield call(submitListing, action.payload);
    //     yield put({
    //       type: ACTIONS.UPDATE_LISTINGS_ASPECT,
    //       aspect: "activeListing",
    //       payload: id
    //     });
    //     yield put(push(`/listings/${id}`));
    //   } catch (error) {
    //     yield put({
    //       type: ACTIONS.UPDATE_LISTINGS_ASPECT,
    //       aspect: "submitListingError",
    //       payload: error
    //     });
    //   }

    //   break;
    // }

    default: {
      yield;
    }
  }
}

export default function* listingsSaga() {
  yield takeEvery(ACTIONS.LISTINGS_SAGA, handleListings);
}
