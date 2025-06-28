const LOAD_MESSAGES = 'LOAD_MESSAGES';
const ADD_MESSAGE = 'ADD_MESSAGE';
const SET_ACTIVE_USER = 'SET_ACTIVE_USER';
const ADD_MESSAGE_IN_BATCH = 'ADD_MESSAGE_IN_BATCH';
const SET_GROUP_ID_HASH = 'SET_GROUP_ID_HASH';

const initialState = {
  messages: [],
  activeUser: null,
  groupIdHash: null
};

export const chatReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_MESSAGES:
      return {
        ...state,
        messages: [...action.payload].reverse(), // reverse to keep latest message at top
      };

    case ADD_MESSAGE:
      return {
        ...state,
        messages: [action.payload, ...state.messages],
      };

    case ADD_MESSAGE_IN_BATCH:
      return {
        ...state,
        messages: [...action.payload, ...state.messages],
      };

    case SET_ACTIVE_USER:
      return {
        ...state,
        activeUser: action.payload,
      };
    case SET_GROUP_ID_HASH:
      return {
        ...state,
        groupIdHash: action.payload,
      };

    default:
      return state;
  }
};

// ACTION CREATORS

export const loadMessages = (messages) => ({
  type: LOAD_MESSAGES,
  payload: messages,
});

export const addMessage = (message) => ({
  type: ADD_MESSAGE,
  payload: message,
});
export const addMessageInBatchs = (message) => ({
  type: ADD_MESSAGE_IN_BATCH,
  payload: message,
});


export const setActiveUser = (user) => ({
  type: SET_ACTIVE_USER,
  payload: user,
});

export const setGroupIdHash = (groupId) => ({
  type: SET_GROUP_ID_HASH,
  payload: groupId,
});

