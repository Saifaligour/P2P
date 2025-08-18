
const LOAD_MESSAGES = 'LOAD_MESSAGES';
const ADD_MESSAGE = 'ADD_MESSAGE';
const SET_ACTIVE_USER = 'SET_ACTIVE_USER';
const ADD_MESSAGE_IN_BATCH = 'ADD_MESSAGE_IN_BATCH';

const initialState = {
  messages: new Map(),
  activeUser: null,
};

export const chatReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_MESSAGES: {
      // action.payload is array of messages [{id, ...}, ...]
      const msgMap = new Map();
      [...action.payload].reverse().forEach(msg => {
        msgMap.set(msg.id, msg);
      });
      return {
        ...state,
        messages: msgMap,
      };
    }
    case ADD_MESSAGE: {
      console.log('ADD_MESSAGE debug:', {
        activeUser: state.activeUser,
        payload: action.payload,
        isMatch: state.activeUser && action.payload && state.activeUser.groupId === action.payload.groupId
      });
      if (state.activeUser && action.payload && state.activeUser.groupId === action.payload.groupId) {
        // action.payload is a single message {id, ...}
        const msgMap = new Map(state.messages);
        msgMap.set(action.payload.id, action.payload);
        return {
          ...state,
          messages: msgMap,
        };
      }
      else {
        return state;
      }
    }
    case ADD_MESSAGE_IN_BATCH: {
      // action.payload is array of messages [{id, ...}, ...]
      const msgMap = new Map(state.messages);
      for (const msg of action?.payload) {
        msgMap.set(msg.id, msg);
      }
      return {
        ...state,
        messages: msgMap,
      };
    }
    case SET_ACTIVE_USER:
      return {
        ...state,
        activeUser: action.payload,
      };
    default:
      return state;
  }
};

// ACTION CREATORS

export const loadMessages = (messages) => ({
  type: LOAD_MESSAGES,
  payload: messages, // array of messages [{id, ...}]
});

export const addMessage = (message) => ({
  type: ADD_MESSAGE,
  payload: message, // single message {id, ...}
});

export const addMessageInBatchs = (messages) => ({
  type: ADD_MESSAGE_IN_BATCH,
  payload: messages, // array of messages [{id, ...}]
});

export const setActiveUser = (user) => ({
  type: SET_ACTIVE_USER,
  payload: user,
});


