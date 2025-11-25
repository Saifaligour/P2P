import { applyMiddleware, combineReducers, legacy_createStore } from "redux";
import { thunk } from 'redux-thunk'; // Thunk middleware
import authReducer from "./authReducer";
import { chatReducer } from "./chatReducer";
import { createUserReducer } from './createUserReducer';
import userListReducer from "./userListReducer";

const rootReducer = combineReducers({
  userList: userListReducer,
  chat: chatReducer,
  createUser: createUserReducer,
  auth: authReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

const store = legacy_createStore(rootReducer, applyMiddleware(thunk));

export default store;
