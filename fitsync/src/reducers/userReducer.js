const initialUser = {
  member_idx: 0,
  member_email: '',
  member_image: '',
  isLogin: false,
};

const initialState = {
  user: { ...initialUser },
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: { ...initialUser, ...action.payload }, // 기본값 + payload 병합
      };
    case 'LOGOUT_USER':
      return {
        ...state,
        user: { ...initialUser },
      };
    default:
      return state;
  }
};

export default userReducer;