import React, { useEffect, useState } from 'react';

import KakaoLoginButton from './KakaoLoginButton';
import GoogleLoginButton from './GoogleLoginButton';
import NaverLoginButton from './NaverLoginButton';
import axios from 'axios';
import googleAuthManager from '../util/googleAuth';


const Login = () => {

  
  const handleLoginSuccess = (userData) => {
    console.log('로그인 성공:', userData);
  };

  const handleLoginFailure = (error) => {
    console.error('로그인 실패:', error);
    alert('로그인에 실패했습니다: ' + error);
  };

  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout', {}, {
        withCredentials: true
      });

      // Google 로그아웃
      googleAuthManager.logout();

    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };
  return (
    <>
      <div>
        <GoogleLoginButton
          onLoginSuccess={handleLoginSuccess}
          onLoginFailure={handleLoginFailure}
          buttonOptions={{
            theme: 'filled',
            size: 'large',
            text: 'signin_with'
          }}
        />
      </div>

      <KakaoLoginButton />
      <NaverLoginButton />
    </>
  );
};

export default Login;