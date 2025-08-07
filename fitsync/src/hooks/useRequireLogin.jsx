// src/hooks/useRequireLogin.js
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

// 전역으로 알림 표시 여부를 추적
let hasShownAlert = false;

const useRequireLogin = () => {
  const user = useSelector(state => state.user.user);
  const isLogin = !!user?.isLogin;
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLogin) {
      const currentPath = location.pathname + location.search;
      sessionStorage.setItem('redirectAfterLogin', currentPath);

      navigate('/login');
    }
  }, [isLogin, location, navigate]);

  return isLogin;
};

export default useRequireLogin;
