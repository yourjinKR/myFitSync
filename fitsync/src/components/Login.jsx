import React, { useEffect, useState } from 'react';

import KakaoLoginButton from './KakaoLoginButton';
import GoogleLoginButton from './GoogleLoginButton';
import NaverLoginButton from './NaverLoginButton';
import axios from 'axios';
import googleAuthManager from '../util/googleAuth';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';


const Login = () => {

  const { user } = useSelector(state => state.user);
  const nav = useNavigate();

  

  useEffect(()=>{
    if(user !== null){
      alert("이미 로그인되어있습니다.");
      if(user.isInfo){
        nav("/");
      }else{
        nav("/register");
      }
    }
  },[])

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