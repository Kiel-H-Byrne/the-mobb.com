//Actions
import * as ACTIONS from "../actions/actionConstants";

const INITIAL_STATE = {
  'status': null,
};

function ListingsReducer(state = INITIAL_STATE, action) {
  const { payload, type, error } = action;
  switch (type) {
    case ACTIONS.LISTINGS_API_REQUEST: {
      return { ...state, 'status': "FETCHING"};
    }
    case ACTIONS.LISTINGS_API_START: {
      return { ...state, 'status': null };
    }
    case ACTIONS.LISTINGS_API_RESULT: {
      // console.log(error)
      return { ...state, 
        'status': error || "SUCCESS", 
        'byId': payload 
      }
    }
    default:
      return state;
  }
}

export default ListingsReducer;
