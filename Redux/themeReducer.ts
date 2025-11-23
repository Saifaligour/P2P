// Redux/themeReducer.ts
import themes from "@/constants/themes";

const SET_MODE = 'SET_MODE';
const SET_THEME = 'SET_THEME';
const SET_NEW_THEME = 'SET_NEW_THEME';

const initialState = {
    themes: themes,
    activeTheme: 'jade',
    mode: 'dark'

};


export const themeReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_THEME:
            return {
                ...state,
                activeTheme: action.payload,
            };
        case SET_MODE:
            return {
                ...state,
                mode: action.payload,
            };
        case SET_NEW_THEME:
            return {
                ...state,
                themes: { ...state.themes, ...action.payload }
            };
        default:
            return state;
    }
};

export const setTheme = (theme) => ({
    type: SET_THEME,
    payload: theme,
});
export const setThemeMode = (mode) => ({
    type: SET_MODE,
    payload: mode,
});
export const setNewTheme = (theme) => ({
    type: SET_NEW_THEME,
    payload: theme,
});
