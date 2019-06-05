//Redux
import { applyMiddleware, compose, createStore } from "redux";
import rootReducer from "../reducers";

//Middleware
//Logger
import logger from "redux-logger";

//Router
import { connectRouter, routerMiddleware } from "connected-react-router";
import { createBrowserHistory } from "history";

//Sagas
import createSagaMiddleware from "redux-saga";
import rootSaga from "./../sagas/root";

// import Schemas from "./../api/schemas";

//Create Logger
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

//Create Middleware
export const history = createBrowserHistory();
const sagaMiddleware = createSagaMiddleware();

// eslint-disable-next-line
const INITIAL_STATE = {
  listings: {},
};

//Create Store
const store =
  process.env.NODE_ENV === "production"
    ? createStore(
        connectRouter(history)(rootReducer),
        applyMiddleware(routerMiddleware(history), sagaMiddleware)
      )
    : createStore(
        connectRouter(history)(rootReducer),
        INITIAL_STATE,
        composeEnhancers(
          applyMiddleware(
            routerMiddleware(history),
            logger,
            sagaMiddleware
          )
        )
      );

//Run sagas
sagaMiddleware.run(rootSaga);

export default store;
