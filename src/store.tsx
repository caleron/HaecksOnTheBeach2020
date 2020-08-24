import { applyMiddleware, combineReducers, createStore } from "redux";
// @ts-ignore
import keplerGlReducer from "kepler.gl/reducers";

// @ts-ignore
import { taskMiddleware } from "react-palm/tasks";

const initialState = {};
const reducers = combineReducers({
  // <-- mount kepler.gl reducer in your app
  keplerGl: keplerGlReducer,
});

// using createStore
export default createStore(
  reducers,
  initialState,
  applyMiddleware(taskMiddleware)
);
