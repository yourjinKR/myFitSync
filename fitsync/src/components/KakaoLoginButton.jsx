import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios'; // axios 추가

const SpinnerAnimation = keyframes`
  0% { transform: rotate(0deg);}
  100% { transform: rotate(360deg);}
`;

const KakaoButton = styled.button`
  background-color: #fee500;
  color: #000000;
  border: 2px solid #fee500;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.2s ease;
  min-height: 48px;
  width: 100%;
  
  &:hover {
    background-color: #fdd835;
    border-color: #fdd835;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const KakaoIcon = styled.svg`
  width: 20px;
  height: 20px;
  flex-shrink: 0;
`;

const Spinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top: 2px solid #000000;
  border-radius: 50%;
  animation: ${SpinnerAnimation} 1s linear infinite;
  flex-shrink: 0;
`;

const ButtonText = styled.span`
  font-weight: 500;
`;

const KakaoLoginButton = ({ onLoginSuccess, onLoginFailure }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      handleKakaoCallback(code);
    }
    // eslint-disable-next-line
  }, []);

  // 카카오 로그인 버튼 클릭
  const handleKakaoLogin = async () => {
    try {
      setLoading(true);

      const response = await axios.get('/auth/kakao/url');
      const data = response.data;

      if (response.status === 200) {
        window.location.href = data.loginUrl;
      } else {
        console.error('로그인 URL을 가져오는데 실패했습니다.');
        if (onLoginFailure) {
          onLoginFailure('로그인 URL을 가져오는데 실패했습니다.');
        }
        setLoading(false);
      }

    } catch (err) {
      console.error('로그인 오류:', err);
      if (onLoginFailure) {
        onLoginFailure('로그인 처리 중 오류가 발생했습니다.');
      }
      setLoading(false);
    }
  };

  // 카카오 콜백 처리
  const handleKakaoCallback = async (code) => {
    try {
      setLoading(true);

      const response = await axios.get(`/auth/kakao/callback?code=${code}`);
      const userData = response.data;

      if (response.status === 200) {
        // URL에서 code 파라미터 제거
        window.history.replaceState({}, document.title, window.location.pathname);

        // 로그인 성공 콜백 호출
        if (onLoginSuccess) {
          onLoginSuccess(userData);
        }
      } else {
        console.error('로그인 처리 실패:', userData.message);
        if (onLoginFailure) {
          onLoginFailure(userData.message || '로그인 처리에 실패했습니다.');
        }
      }

    } catch (err) {
      console.error('콜백 처리 오류:', err);
      if (onLoginFailure) {
        onLoginFailure('콜백 처리 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
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