import React from 'react';
import styled, { keyframes } from 'styled-components';

// 색상 변화 애니메이션 (푸른 계열)
const colorChange = keyframes`
  0% { background-color: #0074D9; }
  25% { background-color: #00BFFF; }
  50% { background-color: #2ECCFA; }
  75% { background-color: #0057B7; }
  100% { background-color: #0074D9; }
`;

// 로딩 컨테이너 스타일
const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  background-color: #000000;
`;

// 바벨 막대 스타일 (길이 30% 증가)
const Bar = styled.div`
  width: 130px;
  height: 15px;
  background-color: #333;
  border-radius: 7px;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
`;

// 바벨 원판 스타일 (푸른 계열, 바에 꼽힌 형태, 옆에서 본 모습)
const Plate = styled.div`
  width: 18px;
  height: ${props => props.size || '60px'};
  border-radius: 8px;
  background-color: #0074D9;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: ${colorChange} 3s infinite;
  animation-delay: ${props => props.delay || '0s'};
  margin: 0 ${props => props.margin || '0px'};
  box-shadow: 0 0 15px rgba(0, 123, 255, 0.2);
  position: relative;
  
  &::after {
    content: '';
    width: 60%;
    height: 20%;
    background-color: #333;
    border-radius: 4px;
    position: absolute;
    left: 20%;
    top: 40%;
  }
`;

// 바벨 전체 래퍼 스타일 (원판 간격: 기존의 절반)
const BarbellWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px; /* 원판 간의 간격 */
`;

// 로딩 텍스트 스타일 (흰색, 고정)
const LoadingText = styled.div`
  margin-top: 32px;
  font-size: 2rem;
  font-weight: bold;
  letter-spacing: 2px;
  color: #fff;
`;

// 로딩 컴포넌트
const IsLoading2 = () => {
  return (
    <LoadingContainer>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <BarbellWrapper>
          {/* 왼쪽: 작은(70) → 큰(90) */}
          <Plate size="70px" delay="0s" />
          <Plate size="90px" delay="0.4s" />
          <Bar />
          {/* 오른쪽: 큰(90) → 작은(70) */}
          <Plate size="90px" delay="0.6s" />
          <Plate size="70px" delay="1s" />
        </BarbellWrapper>
        <LoadingText>로딩중 ...</LoadingText>
      </div>
    </LoadingContainer>
  );
};

export default IsLoading2;