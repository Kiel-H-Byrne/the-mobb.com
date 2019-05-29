import { combineReducers } from "redux";
import ListingsReducer from "./listings";
import MapReducer from './map';

const rootReducer = combineReducers({
  listings: ListingsReducer,
  map: MapReducer
  // users: UsersReducer
});

export default rootReducer;
