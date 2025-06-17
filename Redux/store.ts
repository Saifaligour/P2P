import { combineReducers, legacy_createStore } from "redux";
import { chatReducer } from "./chatReducer";
import { createUserReducer } from './createUserReducer';
import userListReducer from "./userListReducer";

const rootReducer = combineReducers({
  userList: userListReducer,
  chat: chatReducer,
  createUser: createUserReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

const store = legacy_createStore(rootReducer);

export default store;
