import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../action/userAction';

const SpinnerAnimation = keyframes`
  0% { transform: rotate(0deg);}
  100% { transform: rotate(360deg);}
`;

const KakaoButton = styled.button`
  background: #fee500;
  color: #000000;
  border: 1px solid #fee500;
  border-radius: 16px;
  padding: 20px 32px;
  font-size: 1.8rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  transition: background-color 0.2s ease;
  height: 68px;
  width: 100%;

  &:hover {
    background: #fdd700;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const KakaoIcon = styled.svg`
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  path {
    color : var(--text-black);
  }
`;

const Spinner = styled.div`
  width: 22px;
  height: 22px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top: 2px solid #000000;
  border-radius: 50%;
  animation: ${SpinnerAnimation} 1s linear infinite;
  flex-shrink: 0;
`;

const ButtonText = styled.span`
  font-weight: 600;
  font-size: 1.8rem;
  color: var(--text-black);
  letter-spacing: -0.02em;
`;

const KakaoLoginButton = ({ onLoginSuccess, onLoginFailure, setLoading }) => {
  const [loading, setLocalLoading] = useState(false);

  const nav = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code && user.provider === 'kakao') {
      handleKakaoCallback(code);
    }
    // eslint-disable-next-line
  }, []);

  const handleKakaoLogin = async () => {
    try {
      setLocalLoading(true);
      setLoading && setLoading(true); // 추가

      const response = await axios.get('/auth/kakao/url');
      const data = response.data;

      if (response.status === 200) {
        await dispatch(setUser(data.provider));
        window.location.href = data.loginUrl;
      } else {
        console.error('로그인 URL을 가져오는데 실패했습니다.');
        if (onLoginFailure) {
          onLoginFailure('로그인 URL을 가져오는데 실패했습니다.');
        }
        setLocalLoading(false);
        setLoading && setLoading(false); // 추가
      }

    } catch (err) {
      console.error('로그인 오류:', err);
      if (onLoginFailure) {
        onLoginFailure('로그인 처리 중 오류가 발생했습니다.');
      }
      setLocalLoading(false);
      setLoading && setLoading(false); // 추가
    }
  };

  const handleKakaoCallback = async (code) => {
    try {
      setLocalLoading(true);
      setLoading && setLoading(true); // 추가

      const response = await axios.get(`/auth/kakao/callback?code=${code}`);
      await dispatch(setUser(response.data.user));
      
      if(!response.data.user.isLogin) {
          nav('/register');  
      } else{
          // 저장된 리디렉션 경로 확인
          const redirectPath = sessionStorage.getItem('redirectAfterLogin');
          if (redirectPath) {
              sessionStorage.removeItem('redirectAfterLogin');
              nav(redirectPath);
          } else {
              nav('/');
          }
      }

      // 성공 시에는 페이지 이동하므로 setLoading(false) 불필요

    } catch (err) {
      console.error('콜백 처리 오류:', err);
      if (onLoginFailure) {
        onLoginFailure('콜백 처리 중 오류가 발생했습니다.');
      }
      setLocalLoading(false);
      setLoading && setLoading(false); // 추가
    }
  };

  return (
    <KakaoButton onClick={handleKakaoLogin} disabled={loading}>
      {loading ? (
        <>
          <Spinner />
          <ButtonText>로그인 중...</ButtonText>
        </>
      ) : (
        <>
          <KakaoIcon viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z" />
          </KakaoIcon>
          <ButtonText>카카오로 로그인</ButtonText>
        </>
      )}
    </KakaoButton>
  );
};

export default KakaoLoginButton;