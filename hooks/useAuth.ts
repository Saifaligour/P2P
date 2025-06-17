let isLoggedIn = true;

export const login = () => {
  isLoggedIn = true;
};

export const logout = () => {
  isLoggedIn = false;
};

export const checkAuth = (): boolean => {
  return isLoggedIn;
};
