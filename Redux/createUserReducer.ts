
const SET_GROUP_NAME = 'SET_GROUP_NAME';
const SET_GROUP_DESCRIPTION = 'SET_GROUP_DESCRIPTION';
const SET_GROUP_DP = 'SET_GROUP_DP';
const RESET_CREATE_USER = 'RESET_CREATE_USER';

const initialState = {
  groupName: '',
  groupDescription: '',
  groupDP: null,
};

export const createUserReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_GROUP_NAME:
      return { ...state, groupName: action.payload };
    case SET_GROUP_DESCRIPTION:
      return { ...state, groupDescription: action.payload };
    case SET_GROUP_DP:
      return { ...state, groupDP: action.payload };
    case RESET_CREATE_USER:
      return { ...initialState };
    default:
      return state;
  }
};

export const setGroupName = (name) => ({ type: SET_GROUP_NAME, payload: name });
export const setGroupDescription = (desc) => ({ type: SET_GROUP_DESCRIPTION, payload: desc });
export const setGroupDP = (dp) => ({ type: SET_GROUP_DP, payload: dp });
export const resetCreateUser = () => ({ type: RESET_CREATE_USER });