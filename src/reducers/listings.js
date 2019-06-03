//Actions
import * as ACTIONS from "../actions/actionConstants";

const INITIAL_STATE = {
  listings: [],
  fetchedEvents: [],
  fetching: false,
  fetchingEvent: false,
  thisListing: { listingId: "", creatorId: "", meta: { location: {} } },
  error: null
};

function listingsReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    //Generic Updates
    case ACTIONS.UPDATE_LISTINGS_ASPECT: {
      return { ...state, [`${action.aspect}`]: action.payload };
    }

    case ACTIONS.UPDATE_LISTINGS_REDUCER: {
      return { ...state, ...action.payload };
    }

    //Specific Updates
    case ACTIONS.UPDATE_FETCHED_LISTINGS: {
      return {
        ...state,
        fetchedEvents: [...state.fetchedEvents, action.payload]
      };
    }

    // case ACTIONS.UPDATE_FETCHED_LOCATIONS: {
    //   return {
    //     ...state,
    //     fetchedLocations: [...state.fetchedLocations, action.payload]
    //   };
    // }

    default:
      return state;
  }
}

export default listingsReducer;
