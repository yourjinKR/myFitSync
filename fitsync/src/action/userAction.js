export const setUser = (userData) => ({
  type: 'SET_USER',
  payload: userData,
});

export const logoutUser = () => ({
  type: 'LOGOUT_USER',
});