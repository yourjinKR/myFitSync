import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';

// Styled Components
const LoginButton = styled.button`
  width: 200px;
  height: 45px;
  background-color: #03C75A;
  color: white;
  border: none;
  border-radius: 3px;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const LogoutButton = styled.button`
  width: 200px;
  height: 35px;
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #e9e9e9;
  }

  &:active {
    background-color: #f5f5f5;
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
`;

const NaverLoginButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState('checking');

  useEffect(() => {
    checkLoginStatus();
  }, []);

  // 현재 로그인 상태를 서버에 요청하여 확인
  const checkLoginStatus = async () => {
    try {
      const response = await axios.get('/auth/naver/status', {
        withCredentials: true
      });
      
      if (response.data.isLoggedIn) {
        setLoginStatus('loggedIn');
      } else {
        setLoginStatus('loggedOut');
      }
    } catch (error) {
      console.error('로그인 상태 확인 실패:', error);
      setLoginStatus('loggedOut');
    }
  };

  // 네이버 로그인 버튼 클릭 시 호출, 로그인 URL을 받아 리다이렉트
  const handleNaverLogin = async () => {
    setIsLoading(true);
    
    try {
      const response = await axios.get('/auth/naver/login');
      
      if (response.data.success) {
        window.location.href = response.data.loginUrl;
      } else {
        alert('로그인 URL 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('네이버 로그인 실패:', error);
      alert('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 로그아웃 버튼 클릭 시 호출, 서버에 로그아웃 요청
  const handleLogout = async () => {
    try {
      const response = await axios.post('/auth/naver/logout', {}, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setLoginStatus('loggedOut');
      }
    } catch (error) {
      console.error('로그아웃 실패:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };

  if (loginStatus === 'checking') {
    return (
      <Container>
        <div style={{ color: '#666' }}>로그인 상태 확인 중...</div>
      </Container>
    );
  }

  return (
    <Container>
        <LoginButton isLoading={isLoading} onClick={handleNaverLogin}>
          {isLoading ? (
            <>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid transparent',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              로그인 중...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845Z"/>
              </svg>
              네이버 로그인
            </>
          )}
        </LoginButton>
    </Container>
  );
};

export default NaverLoginButton;