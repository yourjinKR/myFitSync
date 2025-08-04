// src/hooks/useRequireLogin.js
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

// 전역으로 알림 표시 여부를 추적
let hasShownAlert = false;

const useRequireLogin = () => {
  const user = useSelector(state => state.user.user);
  const nav = useNavigate();
  const location = useLocation();
  const hasChecked = useRef(false);

  useEffect(() => {
    // 이미 체크했거나 알림을 표시한 경우 건너뛰기
    if (hasChecked.current || hasShownAlert) return;
    
    if (!user?.isLogin) {
      hasShownAlert = true;
      hasChecked.current = true;
      
      // 현재 경로를 sessionStorage에 저장
      const currentPath = location.pathname + location.search;
      sessionStorage.setItem('redirectAfterLogin', currentPath);
      
      alert('로그인이 필요한 서비스입니다!');
      nav('/login');
      
      // 3초 후 알림 표시 플래그 리셋 (새로고침이나 다른 페이지에서 다시 사용할 수 있도록)
      setTimeout(() => {
        hasShownAlert = false;
      }, 3000);
    } else {
      hasChecked.current = true;
    }
  }, [user, nav, location]);
};

export default useRequireLogin;
