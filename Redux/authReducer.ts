

const SET_AUTH_FIELD = 'SET_AUTH_FIELD';
const SET_AUTH_LOADING = 'SET_AUTH_LOADING';
const SET_AUTH_ERROR = 'SET_AUTH_ERROR';
const SET_AUTH_DETAILS = 'SET_AUTH_DETAILS';
const RESET_AUTH = 'RESET_AUTH';

const initialState = {
  loading: false,
  error: null,
  credentials: {
    name: '',
    username: '',
    userId: Date.now().toString()
  }
};

export default function authReducer(state = initialState, action: any) {
  switch (action.type) {
    case SET_AUTH_FIELD:
      return {
        ...state,
        credentials: {
          ...state.credentials,
          [action.payload.field]: action.payload.value
        },
        error: null
      };
    case SET_AUTH_DETAILS:
      return {
        ...state,
        credentials: {
          ...state.credentials,
          ...action.payload
        }
      };
    case SET_AUTH_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    case SET_AUTH_ERROR:
      return {
        ...state,
        error: action.payload
      };
    case RESET_AUTH:
      return { ...initialState };
    default:
      return state;
  }
}

export const setAuthField = (field: 'name' | 'username', value: string) => ({
  type: SET_AUTH_FIELD,
  payload: { field, value }
});

export const setAuthLoading = (loading: boolean) => ({
  type: SET_AUTH_LOADING,
  payload: loading
});

export const setAuthError = (error: string | null) => ({
  type: SET_AUTH_ERROR,
  payload: error
});

export const setAuthDetails = (details: any) => ({
  type: SET_AUTH_DETAILS,
  payload: details
});

export const resetAuth = () => ({ type: RESET_AUTH });
