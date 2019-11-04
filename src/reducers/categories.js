//Actions
import * as ACTIONS from "../actions/actionConstants";

const INITIAL_STATE = {
  status: null,
  selected_categories: []
};

function CategoriesReducer(state = INITIAL_STATE, action) {
  const { payload, type, error, aspect } = action;
  switch (type) {
    case ACTIONS.CATEGORIES_API_REQUEST: {
      return { ...state, status: "FETCHING" };
    }
    case ACTIONS.CATEGORIES_API_START: {
      return { ...state, status: null };
    }
    case ACTIONS.CATEGORIES_API_RESULT: {
      // console.log(error)
      window.thesenutz = payload;
      return { ...state, 
        status: error || "SUCCESS", 
        byId: payload,
        selected_categories: payload.map(el => el.name)};
    }
    case ACTIONS.UPDATE_CATEGORIES_ASPECT: {
      return { ...state, [`${aspect}`]: payload };
    }

    case ACTIONS.UPDATE_SELECTED_CATEGORIES: {
      return {
        ...state,
        selected_categories: payload
      };
    }

    default:
      return state;
  }
}

export default CategoriesReducer;
