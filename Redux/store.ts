import { combineReducers, legacy_createStore } from "redux";
import userListReducer from "./userListReducer";

const rootReducer = combineReducers({
  userList: userListReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

const store = legacy_createStore(rootReducer);

export default store;
