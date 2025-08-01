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
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
`;

const LoginForm = styled.div`
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 4rem 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-light);
  width: 100%;
  max-width: 400px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--primary-blue) 0%, var(--primary-blue-light) 100%);
    border-radius: 16px 16px 0 0;
  }
`;

const LogoSection = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Logo = styled.h1`
  font-size: 3.2rem;
  font-weight: 700;
  color: var(--primary-blue);
  margin-bottom: 0.8rem;
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  font-size: 1.6rem;
  color: var(--text-secondary);
  font-weight: 400;
`;

const LoginSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 1rem;
`;

const SocialButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const ButtonContainer = styled.div`
  position: relative;
`;

const WelcomeMessage = styled.div`
  background: linear-gradient(135deg, var(--primary-blue-dark) 0%, var(--primary-blue) 100%);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  border: 1px solid var(--primary-blue-dark);
`;

const WelcomeTitle = styled.h3`
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.8rem;
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.4rem;
  color: var(--text-white);
  opacity: 0.9;
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
        nav("/");
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