// src/hooks/useRequireLogin.js
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const useRequireLogin = () => {
  const user = useSelector(state => state.user.user);
  const nav = useNavigate();

  useEffect(() => {
    if (!user?.isLogin) {
      alert('로그인이 필요한 서비스입니다!');
      nav('/login');
    }
  }, [user, nav]);
};

export default useRequireLogin;
