import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

// 사용법은 밑의 코드를 로딩컨테이너가 필요한곳에 붙여쓰면 된다.
// <BabellLoading isLoading={loading} onComplete={() => console.log('로딩 완료')}/>

const plateColorChange = keyframes`
  0% { background-color: #00BFFF; }
  50% { background-color: #0074D9; }
  100% { background-color: #00BFFF; }
`;

const LoadingContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  background-color: #000; /* 검정 배경 */
`;

const BarbellWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Plate = styled.div`
  width: ${props => props.width || '20px'};
  height: ${props => props.height || '80px'};
  border-radius: 6px;
  animation: ${plateColorChange} 2s infinite ease-in-out;
  margin: 0 10px;
  box-shadow: 0 0 10px rgba(0, 191, 255, 0.5);
`;

const BarWrapper = styled.div`
  width: 200px;
  height: 20px;
  background-color: #333;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 0 5px rgba(255, 255, 255, 0.2);
`;

const BarFill = styled.div`
  height: 100%;
  background-color: #0074D9;
  width: ${props => props.progress}%;
  transition: width 0.2s linear;
`;

const LoadingText = styled.h2`
  margin-top: 30px;
  font-size: 1.8rem;
  font-weight: 800;
  color: #ffffff;
  text-shadow: 2px 2px 5px rgba(0,0,0,0.7);
`;

const BarbellLoading = ({ isLoading, onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval;

    if (isLoading) {
      // 로딩 시작 시 BarFill 채우기
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev < 95) {
            return prev + 1; // 1%씩 증가 (속도 조절 가능)
          } else {
            return prev; // 95%에서 잠시 대기
          }
        });
      }, 30); // 30ms마다 진행률 1%씩 증가
    } else {
      // 로딩 완료 시 바로 100%로 채우고 잠깐 대기 후 종료
      setProgress(100);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 500); // 잠시 멈췄다가 화면 전환
    }

    return () => clearInterval(interval);
  }, [isLoading, onComplete]);

  return (
    <LoadingContainer>
      <BarbellWrapper>
        <Plate width="20px" height="70px" />
        <Plate width="20px" height="90px" />
        <BarWrapper>
          <BarFill progress={progress} />
        </BarWrapper>
        <Plate width="20px" height="90px" />
        <Plate width="20px" height="70px" />
      </BarbellWrapper>
      <LoadingText>로딩중...</LoadingText>
    </LoadingContainer>
  );
};

export default BarbellLoading;