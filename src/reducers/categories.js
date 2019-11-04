//Actions
import * as ACTIONS from "../actions/actionConstants";

const INITIAL_STATE = {
  status: null,
  selectedCategories: []
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
      return { ...state, status: error || "SUCCESS", byId: payload };
    }
    case ACTIONS.UPDATE_CATEGORIES_ASPECT: {
      return { ...state, [`${aspect}`]: payload };
    }

    case ACTIONS.UPDATE_SELECTED_CATEGORIES: {
      return {
        ...state,
        selectedCategories: [...state.selectedCategories, payload]
      };
    }

    default:
      return state;
  }
}

export default CategoriesReducer;
