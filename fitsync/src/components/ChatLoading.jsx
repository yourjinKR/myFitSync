import React from 'react';
import styled, { keyframes } from 'styled-components';
import ChatIcon from '@mui/icons-material/Chat';

// 아이콘 애니메이션
const tiltAndScale = keyframes`
  0% {
    transform: rotate(0deg) scale(1.1);
    opacity: 0.8;
  }
  25% {
    transform: rotate(10deg) scale(1.2);
    opacity: 1;
  }
  50% {
    transform: rotate(0deg) scale(1.1);
    opacity: 0.8;
  }
  75% {
    transform: rotate(-10deg) scale(1.2);
    opacity: 1;
  }
  100% {
    transform: rotate(0deg) scale(1.1);
    opacity: 0.8;
  }
`;

// 텍스트 깜빡임 애니메이션
const pulse = keyframes`
  0%, 100% { 
    transform: scale(1); 
    opacity: 0.8; 
  }
  50% { 
    transform: scale(1.05); 
    opacity: 1; 
  }
`;

// 커졋다 작아지는 애니메이션
const bounce = keyframes`
  0%, 80%, 100% {
    transform: scale(0.7);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.4);
    opacity: 1;
  }
`;

// 인라인 로딩 컨테이너 (전체 화면을 차지하지 않음)
const LoadingContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  text-align: center;
`;

// SVG 챗 아이콘 애니메이션
const AnimatedChatIcon = styled(ChatIcon)`
  && {
    width: 100px;
    height: 100px;
  }
  color: var(--primary-blue);
  animation: ${tiltAndScale} 2s infinite ease-in-out;
  filter: drop-shadow(0 0 15px var(--primary-blue));
  margin-bottom: 1.5rem;
`;

const LoadingText = styled.h2`
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--text-primary);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  animation: ${pulse} 1.5s ease-in-out infinite;
  margin-bottom: 1.5rem;
`;

const DotsContainer = styled.div`
  display: flex;
  gap: 0.8rem;
  margin-top: 1.5rem;
`;

// shouldForwardProp으로 delay prop 전달 방지
const Dot = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== '$delay'
})`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: linear-gradient(45deg, var(--primary-blue), var(--primary-blue-light));
  animation: ${bounce} 0.7s ease-in-out infinite;
  animation-delay: ${props => props.$delay}s;
`;

const ChatLoading = () => {
  return (
    <LoadingContainer>
      <AnimatedChatIcon />
      <LoadingText>채팅방 로딩중...</LoadingText>
      <DotsContainer>
        <Dot $delay={0} />
        <Dot $delay={0.2} />
        <Dot $delay={0.4} />
        <Dot $delay={0.6} />
      </DotsContainer>
    </LoadingContainer>
  );
};

export default ChatLoading;