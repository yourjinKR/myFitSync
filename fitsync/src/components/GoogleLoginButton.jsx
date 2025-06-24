import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';
import googleAuthManager from '../util/googleAuth';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../action/userAction';
import { useNavigate } from 'react-router-dom';

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
    width: 100%;
    min-height: 48px;
  }

  & button, & div[role="button"] {
    width: 100%;
    min-height: 48px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    padding: 12px 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    transition: all 0.2s ease;
    border: 2px solid #dadce0;

    &:hover {
      background-color: #f8f9fa;
      border-color: #dadce0;
    }
  }
`;

const GoogleLoginButton = () => {
    const [isReady, setIsReady] = useState(false);
    const buttonRef = useRef(null);

    const nav = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.userInfo);

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
                dispatch(setUser(result.data.user));
                if(!result.data.user.isInfo) {
                    nav('/register');  
                } else{
                    nav('/');
                }
            } else {
            }
        } catch (error) {
            console.error('로그인 오류:', error);
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