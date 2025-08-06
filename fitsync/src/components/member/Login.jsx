import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import KakaoLoginButton from './KakaoLoginButton';
import GoogleLoginButton from './GoogleLoginButton';
import NaverLoginButton from './NaverLoginButton';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

const LoginContainer = styled.div`
  min-height: calc(100vh - 150px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: var(--bg-primary);
`;

const LoginForm = styled.div`
  border-radius: 24px;
  padding: 5rem 4.5rem;
  backdrop-filter: blur(20px);
  width: 100%;
  max-width: 560px;
  position: relative;
  z-index: 1;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60%;
    height: 6px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      var(--primary-blue) 30%, 
      var(--primary-blue-light) 70%, 
      transparent 100%
    );
    border-radius: 0 0 24px 24px;
  }

  @media (max-width: 768px) {
    max-width: 420px;
    padding: 4rem 3rem;
  }

  @media (max-width: 480px) {
    max-width: 100%;
    padding: 3.5rem 2.5rem;
    margin: 1rem;
  }
`;

const LogoSection = styled.div`
  text-align: center;
  margin-bottom: 4rem;
`;

const Logo = styled.h1`
  font-size: 4.2rem;
  font-weight: 800;
  color: var(--primary-blue);
  margin-bottom: 1.2rem;
  letter-spacing: -0.03em;
  text-shadow: 0 2px 8px rgba(74, 144, 226, 0.2);
`;

const Subtitle = styled.p`
  font-size: 1.8rem;
  color: var(--text-secondary);
  font-weight: 400;
  line-height: 1.5;
  opacity: 0.9;
  margin-top: 1.5rem;
`;

const LoginSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 2.4rem;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 2rem;
  letter-spacing: -0.5px;
`;

const SocialButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.8rem;
`;

const ButtonContainer = styled.div`
  position: relative;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
  }
`;

const WelcomeMessage = styled.div`
  background: rgba(74, 144, 226, 0.08);
  border-radius: 16px;
  padding: 2.5rem;
  margin-bottom: 3rem;
  text-align: center;
  border: 1px solid rgba(74, 144, 226, 0.2);
`;

const WelcomeTitle = styled.h3`
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--primary-blue-light);
  margin-bottom: 1.2rem;
  letter-spacing: -0.5px;
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.6rem;
  color: var(--text-secondary);
  opacity: 0.95;
  line-height: 1.5;
  font-weight: 400;
`;

const Login = () => {
  const { user } = useSelector(state => state.user);
  const nav = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 로그인 처리 중이 아니고, 이미 로그인된 상태에서 로그인 페이지에 접근한 경우
    if (
      user.isLogin === true &&
      !loading &&
      location.pathname === '/login'
    ) {
      // 약간의 지연을 두어 Google 로그인 등의 리디렉션과 충돌하지 않도록 함
      const timer = setTimeout(() => {
        // 저장된 리다이렉트 경로가 있으면 해당 경로로, 없으면 홈으로
        const redirectPath = sessionStorage.getItem('redirectAfterLogin');
        if (redirectPath) {
          sessionStorage.removeItem('redirectAfterLogin');
          nav(redirectPath);
        } else {
          nav("/");
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [user.isLogin, nav, loading, location.pathname]);

  return (
    <LoginContainer>
      <LoginForm>
        <LogoSection>
          <Logo>FitSync</Logo>
          <Subtitle>건강한 라이프스타일을 시작하세요</Subtitle>
        </LogoSection>

        <WelcomeMessage>
          <WelcomeTitle>환영합니다!</WelcomeTitle>
          <WelcomeSubtitle>소셜 계정으로 간편하게 시작하세요</WelcomeSubtitle>
        </WelcomeMessage>

        <LoginSection>
          <SectionTitle>로그인</SectionTitle>
          
          <SocialButtonWrapper>
            <ButtonContainer>
              <GoogleLoginButton
                buttonOptions={{
                  theme: 'filled',
                  size: 'large',
                  text: 'signin_with'
                }}
                setLoading={setLoading}
              />
            </ButtonContainer>

            <ButtonContainer>
              <KakaoLoginButton setLoading={setLoading} />
            </ButtonContainer>

            <ButtonContainer>
              <NaverLoginButton setLoading={setLoading} />
            </ButtonContainer>
          </SocialButtonWrapper>
        </LoginSection>
      </LoginForm>
    </LoginContainer>
  );
};

export default Login;