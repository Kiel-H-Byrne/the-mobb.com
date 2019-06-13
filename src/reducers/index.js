import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import ListingsReducer from "./listings";
import MapReducer from './map';

export default (history) => combineReducers({
  router: connectRouter(history),
  map: MapReducer,
  listings: ListingsReducer
});