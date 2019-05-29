//Actions
import * as ACTIONS from "../actions/actionConstants";

const INITIAL_STATE = {
  events: [],
  fetchedEvents: [],
  fetching: false,
  fetchingEvent: false,
  thisEvent: { eventId: "", hostId: "", meta: { location: {} } },
  error: null
};

function eventsReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    //Generic Updates
    case ACTIONS.UPDATE_EVENTS_ASPECT: {
      return { ...state, [`${action.aspect}`]: action.payload };
    }

    case ACTIONS.UPDATE_EVENTS_REDUCER: {
      return { ...state, ...action.payload };
    }

    //Specific Updates
    case ACTIONS.UPDATE_FETCHED_EVENTS: {
      return {
        ...state,
        fetchedEvents: [...state.fetchedEvents, action.payload]
      };
    }

    case ACTIONS.UPDATE_FETCHED_LOCATIONS: {
      return {
        ...state,
        fetchedLocations: [...state.fetchedLocations, action.payload]
      };
    }

    default:
      return state;
  }
}

export default eventsReducer;
