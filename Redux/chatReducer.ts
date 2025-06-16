const LOAD_MESSAGES = 'LOAD_MESSAGES';
const ADD_MESSAGE = 'ADD_MESSAGE';

const initialState = {
  messages: [],
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
