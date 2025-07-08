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
    text-shadow: 0 0 10px #00ff88, 0 0 20px #00ff88, 0 0 30px #00ff88;
  }
  50% { 
    text-shadow: 0 0 20px #00ff88, 0 0 30px #00ff88, 0 0 40px #00ff88, 0 0 50px #00ff88;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a, #1a1a1a, #2a2a2a);
  color: white;
  font-family: 'Arial Black', 'Arial', sans-serif;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 9999;
  overflow: hidden;
`;

const ExerciseIcon = styled.div`
  font-size: 8rem;
  margin-bottom: 2rem;
  animation: ${fadeInOut} 2s ease-in-out;
  filter: drop-shadow(0 0 20px rgba(0, 255, 136, 0.8));
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadingTitle = styled.h1`
  font-size: 4rem;
  font-weight: 900;
  margin-bottom: 1rem;
  color: #00ff88;
  animation: ${glow} 2s ease-in-out infinite;
  text-transform: uppercase;
  letter-spacing: 4px;
  text-align: center;
  line-height: 1.2;
`;

const LoadingSubtitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 3rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  animation: ${pulse} 1.5s ease-in-out infinite;
  text-align: center;
`;

const DotsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const Dot = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(45deg, #00ff88, #00cc66);
  animation: ${pulse} 1s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
  box-shadow: 0 0 15px rgba(0, 255, 136, 0.6);
`;

const ProgressText = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #00ff88;
  margin-top: 2rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
`;

const IsLoading = () => {
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
        운동 데이터 로딩중
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

export default IsLoading;
