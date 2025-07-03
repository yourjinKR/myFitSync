const initialUser = {
  member_email: '',
  member_image: '',
  provider: '',
  isLogin: false,
};

const initialState = {
  user: { ...initialUser },
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_USER':
      if (action.payload === 'kakao' || action.payload === 'naver') {
        return {
          ...state,
          user: {
            ...initialUser,
            provider: action.payload,
          },
        };
      } else {
        return {
          ...state,
          user: {
            ...initialUser,
            ...action.payload,
          },
        };
      }
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