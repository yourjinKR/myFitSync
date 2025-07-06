import React, { useEffect, useState } from 'react';

import KakaoLoginButton from './KakaoLoginButton';
import GoogleLoginButton from './GoogleLoginButton';
import NaverLoginButton from './NaverLoginButton';
import axios from 'axios';
import googleAuthManager from '../../utils/googleAuth';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';


const Login = () => {

  const { user } = useSelector(state => state.user);
  const nav = useNavigate();

  
  useEffect(()=>{
    if(user.isLogin === true){
      alert("이미 로그인되어있습니다.");
      nav("/");
    }
  },[])

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