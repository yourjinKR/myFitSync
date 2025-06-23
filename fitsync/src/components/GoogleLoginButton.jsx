import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';
import googleAuthManager from '../util/googleAuth';

const SpinnerAnimation = keyframes`
  0% { transform: rotate(0deg);}
  100% { transform: rotate(360deg);}
`;

const Wrapper = styled.div`
  min-height: 48px;
  width: 100%;
`;

const LoadingBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px 24px;
  background-color: #ffffff;
  border: 2px solid #dadce0;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #3c4043;
  min-height: 48px;
`;

const Spinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #e9ecef;
  border-top: 2px solid #4285f4;
  border-radius: 50%;
  animation: ${SpinnerAnimation} 1s linear infinite;
`;

const ButtonContainer = styled.div.attrs(() => ({}))`
  display: ${props => (props.$isReady ? 'block' : 'none')};

  & > div {
    width: 100% !important;
    min-height: 48px !important;
  }

  & button, & div[role="button"] {
    width: 100% !important;
    min-height: 48px !important;
    border-radius: 8px !important;
    font-size: 16px !important;
    font-weight: 500 !important;
    padding: 12px 24px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 12px !important;
    transition: all 0.2s ease !important;
    border: 2px solid #dadce0 !important;

    &:hover {
      background-color: #f8f9fa !important;
      border-color: #dadce0 !important;
    }
  }
`;

const GoogleLoginButton = ({ onLoginSuccess, onLoginFailure, buttonOptions = {} }) => {
    const [isReady, setIsReady] = useState(false);
    const buttonRef = useRef(null);

    useEffect(() => {
        initializeButton();

        return () => {
            if (buttonRef.current) {
                buttonRef.current.innerHTML = '';
            }
        };
    }, []);

    const initializeButton = async () => {
        try {
            await googleAuthManager.initialize();
            if (buttonRef.current) {
                buttonRef.current.innerHTML = '';
                googleAuthManager.renderButton(
                    buttonRef.current,
                    handleCredentialResponse,
                    {
                        theme: 'outline',
                        size: 'large',
                        width: '100%',
                        text: 'signin_with',
                        ...buttonOptions
                    }
                );
                setIsReady(true);
            }
        } catch (err) {
            console.error('Google 로그인 버튼 초기화 실패:', err);
        }
    };

    const handleCredentialResponse = async (response) => {
        try {
            const idToken = response.credential;
            const result = await axios.post('/auth/google', {
                idToken: idToken
            }, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (result.data.success) {
                onLoginSuccess(result.data.user);
            } else {
                onLoginFailure(result.data.message);
            }
        } catch (error) {
            console.error('로그인 오류:', error);
            onLoginFailure('로그인 처리 중 오류가 발생했습니다.');
        }
    };

    return (
        <Wrapper>
            {!isReady && (
                <LoadingBox>
                    <Spinner />
                    <span>Google 로그인 준비 중...</span>
                </LoadingBox>
            )}
            <ButtonContainer $isReady={isReady} ref={buttonRef} />
        </Wrapper>
    );
};

export default GoogleLoginButton;