//Actions
import * as ACTIONS from "../actions/actionConstants";

const INITIAL_STATE = {
  browser_location: null,
  geolocation_watch_id: null,
  closest_listing: null,
  client_marker: null
};

function SessionReducer(state = INITIAL_STATE, action) {
  const { payload, type, aspect } = action;
  switch (type) {
    case ACTIONS.UPDATE_SESSION_REDUCER: {
      return { ...state, [aspect]: payload };
    }
    default:
      return state;
  }
}

export default SessionReducer;
