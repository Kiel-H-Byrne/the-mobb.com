//Actions
import * as ACTIONS from "../actions/actionConstants";

const INITIAL_STATE = {
  'GMap': null
};

function MapReducer(state = INITIAL_STATE, action) {
  const { payload, type } = action;
  switch (type) {
    case ACTIONS.SHOW_INFOWINDOW: {
      return { ...state, 
        'showInfoWindow': payload
      };
    }
    case ACTIONS.SHOW_SIDEDRAWER: {
      return { ...state, 
        'showSideDrawer': payload
      };
    }
    case ACTIONS.MAP_LOADED: {
      return { ...state, 
        'GMap': payload 
      };
    }
    case ACTIONS.SET_BROWSER_LOCATION: {
      return {...state, 
        'browserLoc': payload
      };
    }
    default:
      return state;
  }
}

export default MapReducer;