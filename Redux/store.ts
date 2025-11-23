import { combineReducers, legacy_createStore } from "redux";
import authReducer from "./authReducer";
import { chatReducer } from "./chatReducer";
import { createUserReducer } from './createUserReducer';
import { themeReducer } from "./themeReducer";
import userListReducer from "./userListReducer";

const rootReducer = combineReducers({
  userList: userListReducer,
  chat: chatReducer,
  createUser: createUserReducer,
  auth: authReducer,
  theme: themeReducer
});

export type RootState = ReturnType<typeof rootReducer>;

const store = legacy_createStore(rootReducer);

export default store;
