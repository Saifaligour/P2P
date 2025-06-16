import { combineReducers, legacy_createStore } from "redux";
import { chatReducer } from "./chatReducer";
import userListReducer from "./userListReducer";

const rootReducer = combineReducers({
  userList: userListReducer,
  chat:chatReducer
});

export type RootState = ReturnType<typeof rootReducer>;

const store = legacy_createStore(rootReducer);

export default store;
