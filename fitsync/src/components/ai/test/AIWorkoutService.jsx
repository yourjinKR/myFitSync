import React, { useState, useEffect } from 'react';
import styled, { keyframes, createGlobalStyle } from 'styled-components';

// 글로벌 스타일
const GlobalStyle = createGlobalStyle`
  :root {
    --bg-primary: #0a0e1a;
    --bg-secondary: #1a1f2e;
    --bg-tertiary: #242938;
    --text-primary: #ffffff;
    --text-secondary: #b8c5d6;
    --text-tertiary: #8891a3;
    --primary-blue: #4a90e2;
    --primary-blue-hover: #357abd;
    --primary-blue-light: rgba(74, 144, 226, 0.2);
    --border-light: #2d3748;
    --border-medium: #4a5568;
    --check-green: #4caf50;
    --success: #2e7d32;
    --warning: #f44336;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    overflow-x: hidden;
  }
`;

// 애니메이션
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const successPulse = keyframes`
  0% { 
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
  }
  50% { 
    transform: scale(1.05);
    box-shadow: 0 0 0 20px rgba(76, 175, 80, 0);
  }
  100% { 
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
`;

// 메인 컨테이너
const AppContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-width: 750px;
  margin: 0 auto;
`;

// 헤더
const Header = styled.div`
  background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-hover));
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  position: relative;
  
  @media (max-width: 480px) {
    padding: 1.2rem 1.5rem;
  }
`;

const HeaderTitle = styled.h1`
  font-size: 2.2rem;
  font-weight: 800;
  color: white;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 480px) {
    font-size: 1.8rem;
    gap: 0.5rem;
  }
`;

const HeaderButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 0.8rem;
  font-size: 1.4rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 48px;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.6);
    transform: scale(1.1);
  }
  
  @media (max-width: 480px) {
    font-size: 1.2rem;
    min-width: 44px;
    min-height: 44px;
    padding: 0.6rem;
  }
`;

// 프로그레스 바
const ProgressBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, var(--check-green), var(--success));
  width: ${props => props.progress}%;
  transition: width 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 20px;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3));
    animation: ${pulse} 2s ease-in-out infinite;
  }
`;

// 메인 콘텐츠
const MainContent = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
  min-height: 0;
`;

const ContentContainer = styled.div`
  width: 100%;
  padding: 2rem;
  overflow-y: auto;
  animation: ${fadeInUp} 0.6s ease-out;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--primary-blue);
    border-radius: 4px;
  }
  
  @media (max-width: 480px) {
    padding: 1.5rem;
  }
`;

// 입력 화면 컴포넌트들 (SlideInputFormTest와 동일한 스타일)
const FormContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
`;

const SlideTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 1rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  
  @media (max-width: 480px) {
    font-size: 2rem;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
  }
`;

const SlideSubtitle = styled.p`
  font-size: 1.3rem;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 2.5rem;
  line-height: 1.6;
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
    margin-bottom: 2rem;
  }
`;

// 로딩 화면
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
  padding: 2rem;
`;

const LoadingSpinner = styled.div`
  width: 80px;
  height: 80px;
  border: 8px solid var(--bg-secondary);
  border-top: 8px solid var(--primary-blue);
  border-radius: 50%;
  animation: ${spin} 2s linear infinite;
  margin-bottom: 2rem;
`;

const LoadingTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const LoadingMessage = styled.p`
  font-size: 1.2rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 2rem;
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const LoadingStats = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 2rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const LoadingStat = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-blue);
  
  @media (max-width: 480px) {
    font-size: 1.3rem;
  }
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: var(--text-tertiary);
  margin-top: 0.25rem;
`;

// 결과 화면
const ResultContainer = styled.div`
  max-width: 700px;
  margin: 0 auto;
`;

const ResultHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-light);
`;

const ResultTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  
  @media (max-width: 480px) {
    font-size: 2rem;
  }
`;

const ResultMeta = styled.div`
  font-size: 1rem;
  color: var(--text-secondary);
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const RoutineGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const RoutineCard = styled.div`
  background: var(--bg-secondary);
  border: 2px solid var(--border-light);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--primary-blue-light);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(74, 144, 226, 0.2);
  }
`;

const RoutineHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-light);
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
`;

const RoutineTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-blue);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 480px) {
    font-size: 1.3rem;
  }
`;

const RoutineBadge = styled.span`
  background: var(--primary-blue-light);
  color: var(--text-primary);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
`;

const ExerciseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ExerciseItem = styled.div`
  background: var(--bg-tertiary);
  border: 1px solid var(--border-medium);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--primary-blue);
    background: var(--bg-secondary);
  }
`;

const ExerciseIcon = styled.div`
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const ExerciseContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ExerciseName = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const ExerciseDetails = styled.div`
  font-size: 0.95rem;
  color: var(--text-secondary);
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
    gap: 0.5rem;
  }
`;

const DetailChip = styled.span`
  background: var(--bg-primary);
  color: var(--text-primary);
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  border: 1px solid var(--border-light);
`;

// 피드백 섹션
const FeedbackSection = styled.div`
  text-align: center;
  padding: 2rem;
  background: var(--bg-secondary);
  border-radius: 16px;
  margin: 2rem 0;
  border: 2px solid var(--border-light);
`;

const FeedbackTitle = styled.h4`
  font-size: 1.3rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
  
  @media (max-width: 480px) {
    font-size: 1.2rem;
  }
`;

const FeedbackButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const FeedbackButton = styled.button`
  background: ${props => props.positive ? 'var(--check-green)' : 'var(--warning)'};
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 150px;
  justify-content: center;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px ${props => props.positive ? 'rgba(76, 175, 80, 0.4)' : 'rgba(244, 67, 54, 0.4)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 480px) {
    width: 100%;
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
  }
`;

// 성공 화면
const SuccessContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 2rem;
  max-width: 600px;
  margin: 0 auto;
  
  @media (max-width: 480px) {
    padding: 2rem 1.5rem;
  }
`;

const SuccessIcon = styled.div`
  width: 120px;
  height: 120px;
  background: var(--check-green);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  font-size: 3rem;
  color: white;
  animation: ${successPulse} 2s infinite;
  
  @media (max-width: 480px) {
    width: 100px;
    height: 100px;
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
  }
`;

const SuccessTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
  
  @media (max-width: 480px) {
    font-size: 2rem;
  }
`;

const SuccessMessage = styled.p`
  font-size: 1.2rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 2.5rem;
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
    margin-bottom: 2rem;
  }
`;

// 하단 네비게이션
const BottomNavigation = styled.div`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 750px;
  backdrop-filter: blur(20px);
  background: rgba(26, 31, 46, 0.9);
  padding: 1.2rem 2rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
  z-index: 1001;
  border-top: 1px solid var(--border-light);
  
  @media (max-width: 480px) {
    padding: 1rem 1.5rem;
    flex-direction: column;
  }
`;

const NavButton = styled.button`
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 48px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.6s;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 480px) {
    width: 100%;
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
  }
`;

const PrimaryButton = styled(NavButton)`
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-hover) 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(74, 144, 226, 0.3);
  flex: 1;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);
  }
`;

const SecondaryButton = styled(NavButton)`
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 2px solid var(--border-medium);
  
  &:hover:not(:disabled) {
    background: var(--bg-secondary);
    border-color: var(--primary-blue);
    transform: translateY(-2px);
  }
`;

const SuccessButton = styled(NavButton)`
  background: linear-gradient(135deg, var(--check-green) 0%, var(--success) 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.3);
  flex: 1;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
  }
`;

// 메인 컴포넌트
const AIWorkoutService = () => {
  const [currentStep, setCurrentStep] = useState('input'); // input, loading, result, success
  const [formData, setFormData] = useState({
    name: '유어진',
    age: 25,
    gender: '남자',
    height: 186,
    weight: 72,
    disease: [],
    purpose: '근육 증가',
    bmi: 20,
    fat: 12,
    fat_percentage: 12,
    skeletal_muscle: 30,
    split: 4
  });
  
  const [aiResult, setAiResult] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  // 샘플 AI 결과 데이터
  const sampleResult = {
    content: [
      {
        routine_name: "상체 루틴",
        exercises: [
          {
            pt_name: "벤치프레스",
            set_volume: 70,
            set_count: 8,
            set_num: 4
          },
          {
            pt_name: "랫풀다운",
            set_volume: 60,
            set_count: 10,
            set_num: 4
          },
          {
            pt_name: "오버헤드 프레스",
            set_volume: 40,
            set_count: 10,
            set_num: 3
          },
          {
            pt_name: "덤벨 로우",
            set_volume: 25,
            set_count: 10,
            set_num: 3
          }
        ]
      },
      {
        routine_name: "하체 루틴",
        exercises: [
          {
            pt_name: "레그 프레스",
            set_volume: 100,
            set_count: 10,
            set_num: 3
          },
          {
            pt_name: "레그 컬",
            set_volume: 40,
            set_count: 10,
            set_num: 3
          },
          {
            pt_name: "힙 어브덕션 머신",
            set_volume: 40,
            set_count: 12,
            set_num: 3
          }
        ]
      },
      {
        routine_name: "팔 루틴",
        exercises: [
          {
            pt_name: "덤벨 컬",
            set_volume: 12,
            set_count: 10,
            set_num: 3
          },
          {
            pt_name: "덤벨 트라이셉 익스텐션",
            set_volume: 15,
            set_count: 10,
            set_num: 3
          }
        ]
      },
      {
        routine_name: "코어 및 유산소 루틴",
        exercises: [
          {
            pt_name: "플랭크",
            set_volume: 60,
            set_count: 1,
            set_num: 3
          },
          {
            pt_name: "크런치",
            set_volume: 0,
            set_count: 15,
            set_num: 3
          },
          {
            pt_name: "트레드밀",
            set_volume: 1800,
            set_count: 1,
            set_num: 1
          }
        ]
      }
    ],
    logIdx: 317,
    responseTime: 11.91,
    split: 4
  };

  // 로딩 시뮬레이션
  useEffect(() => {
    if (currentStep === 'loading') {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setAiResult(sampleResult);
            setCurrentStep('result');
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 500);

      return () => clearInterval(interval);
    }
  }, [currentStep]);

  const handleStartInput = () => {
    setCurrentStep('input');
  };

  const handleGenerateRoutine = () => {
    setCurrentStep('loading');
    setLoadingProgress(0);
  };

  const handleSaveResult = () => {
    setCurrentStep('success');
  };

  const handleRetry = () => {
    setCurrentStep('input');
    setFeedbackGiven(false);
    setAiResult(null);
    setLoadingProgress(0);
  };

  const handleFeedback = (type) => {
    setFeedbackGiven(true);
    console.log('Feedback:', type);
  };

  const handleNewRoutine = () => {
    setCurrentStep('input');
    setFeedbackGiven(false);
    setAiResult(null);
    setLoadingProgress(0);
  };

  const getProgressPercentage = () => {
    switch (currentStep) {
      case 'input': return 25;
      case 'loading': return 50;
      case 'result': return 75;
      case 'success': return 100;
      default: return 0;
    }
  };

  const renderContent = () => {
    switch (currentStep) {
      case 'input':
        return (
          <ContentContainer>
            <FormContainer>
              <SlideTitle>👤 정보 입력</SlideTitle>
              <SlideSubtitle>
                AI가 맞춤형 운동 루틴을 생성하기 위해<br/>
                기본 정보를 확인하고 있습니다
              </SlideSubtitle>
              
              <div style={{ 
                background: 'var(--bg-secondary)', 
                padding: '2rem', 
                borderRadius: '16px', 
                border: '2px solid var(--border-light)',
                marginBottom: '2rem'
              }}>
                <h3 style={{ 
                  color: 'var(--primary-blue)', 
                  marginBottom: '1.5rem',
                  fontSize: '1.3rem',
                  fontWeight: '600'
                }}>
                  📊 입력된 정보
                </h3>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '1rem' 
                }}>
                  {[
                    { label: '이름', value: formData.name, icon: '👤' },
                    { label: '나이', value: `${formData.age}세`, icon: '🎂' },
                    { label: '성별', value: formData.gender, icon: '⚧' },
                    { label: '키', value: `${formData.height}cm`, icon: '📏' },
                    { label: '몸무게', value: `${formData.weight}kg`, icon: '⚖️' },
                    { label: '목적', value: formData.purpose, icon: '🎯' },
                    { label: '분할', value: `${formData.split}분할`, icon: '📅' },
                    { label: '골격근량', value: `${formData.skeletal_muscle}kg`, icon: '💪' }
                  ].map((item, index) => (
                    <div key={index} style={{
                      background: 'var(--bg-tertiary)',
                      padding: '1rem',
                      borderRadius: '12px',
                      border: '1px solid var(--border-medium)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}>
                      <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                      <div>
                        <div style={{ 
                          fontSize: '0.85rem', 
                          color: 'var(--text-tertiary)',
                          marginBottom: '0.25rem'
                        }}>
                          {item.label}
                        </div>
                        <div style={{ 
                          fontSize: '1rem', 
                          fontWeight: '600',
                          color: 'var(--text-primary)'
                        }}>
                          {item.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div style={{
                background: 'var(--primary-blue-light)',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid var(--primary-blue)',
                textAlign: 'center'
              }}>
                <h4 style={{ 
                  color: 'var(--text-primary)', 
                  marginBottom: '0.5rem',
                  fontSize: '1.1rem'
                }}>
                  💡 준비 완료!
                </h4>
                <p style={{ 
                  color: 'var(--text-secondary)', 
                  fontSize: '0.95rem',
                  lineHeight: '1.5',
                  margin: 0
                }}>
                  입력하신 정보를 바탕으로 AI가 최적의 운동 루틴을 생성합니다.<br/>
                  개인 맞춤형 운동 계획을 받아보세요!
                </p>
              </div>
            </FormContainer>
          </ContentContainer>
        );

      case 'loading':
        return (
          <ContentContainer>
            <LoadingContainer>
              <LoadingSpinner />
              <LoadingTitle>🤖 AI가 루틴을 생성 중입니다</LoadingTitle>
              <LoadingMessage>
                개인 맞춤형 운동 루틴을 분석하고 있어요.<br/>
                잠시만 기다려주세요!
              </LoadingMessage>
              
              <div style={{
                width: '100%',
                maxWidth: '400px',
                background: 'var(--bg-secondary)',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    생성 진행률
                  </span>
                  <span style={{ color: 'var(--primary-blue)', fontWeight: '600' }}>
                    {Math.round(loadingProgress)}%
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${loadingProgress}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--primary-blue), var(--primary-blue-hover))',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              <LoadingStats>
                <LoadingStat>
                  <StatValue>4</StatValue>
                  <StatLabel>분할 루틴</StatLabel>
                </LoadingStat>
                <LoadingStat>
                  <StatValue>16+</StatValue>
                  <StatLabel>추천 운동</StatLabel>
                </LoadingStat>
                <LoadingStat>
                  <StatValue>100%</StatValue>
                  <StatLabel>개인 맞춤</StatLabel>
                </LoadingStat>
              </LoadingStats>
            </LoadingContainer>
          </ContentContainer>
        );

      case 'result':
        return (
          <ContentContainer style={{ paddingBottom: '8rem' }}>
            <ResultContainer>
              <ResultHeader>
                <ResultTitle>🎉 AI 루틴 생성 완료!</ResultTitle>
                <ResultMeta>
                  생성된 루틴: {aiResult?.content?.length || 0}개 | 
                  응답 시간: {aiResult?.responseTime || 0}초
                  {aiResult?.logIdx && ` | 로그 ID: ${aiResult.logIdx}`}
                </ResultMeta>
              </ResultHeader>
              
              <RoutineGrid>
                {aiResult?.content?.map((routine, idx) => (
                  <RoutineCard key={idx}>
                    <RoutineHeader>
                      <RoutineTitle>
                        🏋️ {routine.routine_name}
                      </RoutineTitle>
                      <RoutineBadge>
                        {routine.exercises?.length || 0}개 운동
                      </RoutineBadge>
                    </RoutineHeader>
                    
                    <ExerciseList>
                      {routine.exercises?.map((exercise, i) => (
                        <ExerciseItem key={i}>
                          <ExerciseIcon>💪</ExerciseIcon>
                          <ExerciseContent>
                            <ExerciseName>
                              {exercise.pt_name}
                            </ExerciseName>
                            <ExerciseDetails>
                              <DetailChip>{exercise.set_num || 0}세트</DetailChip>
                              <DetailChip>{exercise.set_count || 0}회</DetailChip>
                              {exercise.set_volume && exercise.set_volume > 0 && (
                                <DetailChip>{exercise.set_volume}kg</DetailChip>
                              )}
                            </ExerciseDetails>
                          </ExerciseContent>
                        </ExerciseItem>
                      )) || []}
                    </ExerciseList>
                  </RoutineCard>
                )) || []}
              </RoutineGrid>

              <FeedbackSection>
                <FeedbackTitle>💭 이 루틴이 어떠신가요?</FeedbackTitle>
                {feedbackGiven ? (
                  <div style={{
                    color: 'var(--text-secondary)',
                    fontSize: '1rem',
                    fontWeight: '500',
                    padding: '1rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-light)'
                  }}>
                    <span style={{ color: 'var(--check-green)', fontSize: '1.5rem' }}>✅</span>
                    <br />
                    피드백이 완료되었습니다. 감사합니다!
                  </div>
                ) : (
                  <FeedbackButtons>
                    <FeedbackButton positive onClick={() => handleFeedback('positive')}>
                      👍 좋아요
                    </FeedbackButton>
                    <FeedbackButton onClick={() => handleFeedback('negative')}>
                      👎 개선 필요
                    </FeedbackButton>
                  </FeedbackButtons>
                )}
              </FeedbackSection>
            </ResultContainer>
          </ContentContainer>
        );

      case 'success':
        return (
          <ContentContainer>
            <SuccessContainer>
              <SuccessIcon>✅</SuccessIcon>
              <SuccessTitle>🎉 루틴 저장 완료!</SuccessTitle>
              <SuccessMessage>
                AI가 생성한 운동 루틴이 성공적으로 저장되었습니다.<br />
                이제 나의 루틴에서 확인하고 운동을 시작해보세요!
              </SuccessMessage>
              
              <div style={{
                background: 'var(--bg-secondary)',
                border: '2px solid var(--border-light)',
                borderRadius: '16px',
                padding: '2rem',
                marginBottom: '2rem',
                width: '100%',
                maxWidth: '500px'
              }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: '1.5rem',
                  textAlign: 'center'
                }}>
                  <div>
                    <div style={{ 
                      fontSize: '2rem', 
                      fontWeight: '700', 
                      color: 'var(--primary-blue)',
                      marginBottom: '0.5rem'
                    }}>
                      {aiResult?.content?.length || 0}
                    </div>
                    <div style={{ 
                      fontSize: '0.9rem', 
                      color: 'var(--text-secondary)',
                      fontWeight: '500'
                    }}>
                      저장된 루틴
                    </div>
                  </div>
                  <div>
                    <div style={{ 
                      fontSize: '2rem', 
                      fontWeight: '700', 
                      color: 'var(--primary-blue)',
                      marginBottom: '0.5rem'
                    }}>
                      {aiResult?.content?.reduce((total, routine) => 
                        total + (routine.exercises?.length || 0), 0) || 0}
                    </div>
                    <div style={{ 
                      fontSize: '0.9rem', 
                      color: 'var(--text-secondary)',
                      fontWeight: '500'
                    }}>
                      총 운동 수
                    </div>
                  </div>
                  <div>
                    <div style={{ 
                      fontSize: '2rem', 
                      fontWeight: '700', 
                      color: 'var(--primary-blue)',
                      marginBottom: '0.5rem'
                    }}>
                      {aiResult?.responseTime || 0}초
                    </div>
                    <div style={{ 
                      fontSize: '0.9rem', 
                      color: 'var(--text-secondary)',
                      fontWeight: '500'
                    }}>
                      생성 시간
                    </div>
                  </div>
                </div>
              </div>
            </SuccessContainer>
          </ContentContainer>
        );

      default:
        return null;
    }
  };

  const renderBottomNavigation = () => {
    switch (currentStep) {
      case 'input':
        return (
          <BottomNavigation>
            <PrimaryButton onClick={handleGenerateRoutine}>
              🚀 AI 루틴 생성하기
            </PrimaryButton>
          </BottomNavigation>
        );

      case 'loading':
        return null;

      case 'result':
        return (
          <BottomNavigation>
            <SecondaryButton onClick={handleRetry}>
              🔄 다시 생성하기
            </SecondaryButton>
            <SuccessButton onClick={handleSaveResult}>
              💾 루틴 저장하기
            </SuccessButton>
          </BottomNavigation>
        );

      case 'success':
        return (
          <BottomNavigation>
            <SecondaryButton onClick={handleNewRoutine}>
              🔄 새 루틴 만들기
            </SecondaryButton>
            <PrimaryButton onClick={() => alert('나의 루틴 페이지로 이동')}>
              📋 나의 루틴 보기
            </PrimaryButton>
          </BottomNavigation>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <Header>
          {currentStep !== 'input' && currentStep !== 'loading' && (
            <HeaderButton onClick={handleRetry}>
              ←
            </HeaderButton>
          )}
          <HeaderTitle>
            🤖 AI 운동 루틴
          </HeaderTitle>
          <HeaderButton onClick={() => alert('홈으로 이동')}>
            ✕
          </HeaderButton>
          <ProgressBar>
            <ProgressFill progress={getProgressPercentage()} />
          </ProgressBar>
        </Header>
        
        <MainContent>
          {renderContent()}
        </MainContent>
        
        {renderBottomNavigation()}
      </AppContainer>
    </>
  );
};

export default AIWorkoutService;