import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const ResultContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  text-align: center;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  color: var(--primary-blue);
  text-shadow: 0 0 10px rgba(74, 144, 226, 0.5);
`;

const Subtitle = styled.p`
  font-size: 1.5rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.8;
`;

const ResultBox = styled.div`
  background: var(--bg-secondary);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 600px;
  text-align: left;
  color: var(--text-primary);
`;

const ResultItem = styled.div`
  margin-bottom: 1rem;
  font-size: 1.2rem;
  line-height: 1.6;

  span {
    font-weight: 700;
    color: var(--primary-blue);
  }
`;

const BackButton = styled.button`
  margin-top: 2rem;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  background: var(--primary-blue);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--primary-blue-hover);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ResponseResultPage = ({ resultData }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/ai');
  };

  return (
    <ResultContainer>
      <Title>결과가 도착했습니다!</Title>
      <Subtitle>아래는 AI가 생성한 맞춤형 운동 루틴입니다:</Subtitle>

      <ResultBox>
        {resultData && Object.entries(resultData).map(([key, value]) => (
          <ResultItem key={key}>
            <span>{key}:</span> {value}
          </ResultItem>
        ))}
      </ResultBox>

      <BackButton onClick={handleBack}>돌아가기</BackButton>
    </ResultContainer>
  );
};

export default ResponseResultPage;
