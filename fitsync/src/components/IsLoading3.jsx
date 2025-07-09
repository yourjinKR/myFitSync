import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

// 페이드 인/아웃 애니메이션
const fadeInOut = keyframes`
  0% { opacity: 0; transform: scale(0.8) rotate(-10deg); }
  20% { opacity: 1; transform: scale(1.1) rotate(5deg); }
  80% { opacity: 1; transform: scale(1.1) rotate(-5deg); }
  100% { opacity: 0; transform: scale(0.8) rotate(10deg); }
`;

// 펄스 애니메이션
const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// 글로우 애니메이션
const glow = keyframes`
  0%, 100% { 
    text-shadow: 0 0 10px var(--primary-blue), 0 0 20px var(--primary-blue), 0 0 30px var(--primary-blue);
  }
  50% { 
    text-shadow: 0 0 20px var(--primary-blue), 0 0 30px var(--primary-blue), 0 0 40px var(--primary-blue), 0 0 50px var(--primary-blue);
  }
`;

// 인라인 로딩 컨테이너 (전체 화면을 차지하지 않음)
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 3rem 2rem;
  color: white;
  font-family: 'Arial Black', 'Arial', sans-serif;
  text-align: center;
`;

const ExerciseIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: ${fadeInOut} 2s ease-in-out;
  filter: drop-shadow(0 0 15px var(--primary-blue)) drop-shadow(0 0 20px var(--primary-blue-light));
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadingTitle = styled.h2`
  font-size: 2rem;
  font-weight: 900;
  margin-bottom: 0.5rem;
  color: var(--primary-blue);
  animation: ${glow} 2s ease-in-out infinite;
  text-transform: uppercase;
  letter-spacing: 2px;
  line-height: 1.2;
`;

const LoadingSubtitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const DotsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const Dot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(45deg, var(--primary-blue), var(--primary-blue-light));
  animation: ${pulse} 1s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
  box-shadow: 0 0 10px var(--primary-blue);
`;

const ProgressText = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--primary-blue);
  margin-top: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
`;

const IsLoading3 = () => {
  const [currentExercise, setCurrentExercise] = useState(0);
  
  const exercises = [
    { icon: "🏋️‍♂️", name: "덤벨" },
    { icon: "🚴‍♀️", name: "사이클" },
    { icon: "🏃‍♂️", name: "러닝머신" },
    { icon: "🤸‍♀️", name: "요가매트" },
    { icon: "🥊", name: "복싱글러브" },
    { icon: "⚡", name: "파워" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentExercise(prev => (prev + 1) % exercises.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [exercises.length]);

  return (
    <LoadingContainer>
      <ExerciseIcon key={currentExercise}>
        {exercises[currentExercise].icon}
      </ExerciseIcon>
      
      <LoadingTitle>
        FIT SYNC
      </LoadingTitle>
      
      <LoadingSubtitle>
        {exercises[currentExercise].name} 준비 중...
      </LoadingSubtitle>
      
      <ProgressText>
        채팅방 목록 로딩중
      </ProgressText>
      
      <DotsContainer>
        <Dot delay={0} />
        <Dot delay={0.3} />
        <Dot delay={0.6} />
        <Dot delay={0.9} />
      </DotsContainer>
    </LoadingContainer>
  );
};

export default IsLoading3;