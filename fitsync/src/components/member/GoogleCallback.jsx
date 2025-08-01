import React, { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
`;

const Message = styled.div`
  text-align: center;
  font-size: 1.8rem;
  color: #333;
`;

const GoogleCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const exchangeCodeForToken = useCallback(async (code, state) => {
    try {
      // Google Token Exchange를 위해 백엔드에 요청
      const response = await fetch('/auth/google/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          state: state
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success && data.idToken) {
        // ID 토큰을 부모 창에 전달
        if (window.opener) {
          window.opener.postMessage({
            type: 'GOOGLE_AUTH_SUCCESS',
            idToken: data.idToken
          }, window.location.origin);
          window.close();
        }
      } else {
        throw new Error(data.message || '토큰 교환 실패');
      }
    } catch (error) {
      console.error('토큰 교환 오류:', error);
      if (window.opener) {
        window.opener.postMessage({
          type: 'GOOGLE_AUTH_ERROR',
          error: error.message
        }, window.location.origin);
        window.close();
      } else {
        alert('Google 로그인 처리 중 오류가 발생했습니다.');
        navigate('/login');
      }
    }
  }, [navigate]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');

    if (error) {
      // 오류가 있는 경우
      console.error('Google OAuth 오류:', error);
      if (window.opener) {
        window.opener.postMessage({
          type: 'GOOGLE_AUTH_ERROR',
          error: error
        }, window.location.origin);
        window.close();
      } else {
        alert('Google 로그인에 실패했습니다.');
        navigate('/login');
      }
      return;
    }

    if (code && state) {
      // 성공적으로 인증 코드를 받은 경우
      // 구글 토큰을 가져와서 부모 창에 전달
      exchangeCodeForToken(code, state);
    } else {
      console.error('Google OAuth: code 또는 state가 없습니다.');
      if (window.opener) {
        window.opener.postMessage({
          type: 'GOOGLE_AUTH_ERROR',
          error: 'Invalid parameters'
        }, window.location.origin);
        window.close();
      } else {
        navigate('/login');
      }
    }
  }, [location, navigate, exchangeCodeForToken]);

  return (
    <Container>
      <Message>Google 로그인 처리 중...</Message>
    </Container>
  );
};

export default GoogleCallback;
