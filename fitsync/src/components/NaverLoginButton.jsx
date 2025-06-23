import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Styled Components
const LoginButton = ({ isLoading, onClick, children }) => (
  <button
    onClick={onClick}
    disabled={isLoading}
    style={{
      width: '200px',
      height: '45px',
      backgroundColor: '#03C75A',
      color: 'white',
      border: 'none',
      borderRadius: '3px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: isLoading ? 'not-allowed' : 'pointer',
      opacity: isLoading ? 0.7 : 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}
    onMouseEnter={(e) => {
      if (!isLoading) {
        e.target.style.backgroundColor = '#02B350';
      }
    }}
    onMouseLeave={(e) => {
      if (!isLoading) {
        e.target.style.backgroundColor = '#03C75A';
      }
    }}
  >
    {children}
  </button>
);

const LogoutButton = ({ onClick }) => (
  <button
    onClick={onClick}
    style={{
      width: '200px',
      height: '35px',
      backgroundColor: '#f5f5f5',
      color: '#666',
      border: '1px solid #ddd',
      borderRadius: '3px',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    }}
    onMouseEnter={(e) => {
      e.target.style.backgroundColor = '#e9e9e9';
    }}
    onMouseLeave={(e) => {
      e.target.style.backgroundColor = '#f5f5f5';
    }}
  >
    로그아웃
  </button>
);

const UserInfo = ({ user }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    border: '1px solid #e0e0e0'
  }}>
    {user?.profileImage && (
      <img
        src={user.profileImage}
        alt="프로필"
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          border: '2px solid #03C75A'
        }}
      />
    )}
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
        {user?.name}
      </div>
      <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
        {user?.email}
      </div>
    </div>
  </div>
);

const Container = ({ children }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    padding: '20px'
  }}>
    {children}
  </div>
);

const NaverLoginButton = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState('checking');

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const response = await axios.get('/auth/naver/status', {
        withCredentials: true
      });
      
      if (response.data.isLoggedIn) {
        setUser(response.data.user);
        setLoginStatus('loggedIn');
      } else {
        setLoginStatus('loggedOut');
      }
    } catch (error) {
      console.error('로그인 상태 확인 실패:', error);
      setLoginStatus('loggedOut');
    }
  };

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

  const handleLogout = async () => {
    try {
      const response = await axios.post('/auth/naver/logout', {}, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setUser(null);
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
      {loginStatus === 'loggedOut' ? (
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
      ) : (
        <>
          <UserInfo user={user} />
          <LogoutButton onClick={handleLogout} />
        </>
      )}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </Container>
  );
};

export default NaverLoginButton;