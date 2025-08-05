import React, { useState } from 'react';
import TrainerInfo from './TrainerInfo';
import styled from 'styled-components';

const InfoListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0;
  
  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 20px;
  }
`;

const MessageContainer = styled.div`
  padding: 40px 20px;
  text-align: center;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-light);
  
  @media (min-width: 768px) {
    grid-column: 1 / -1;
    padding: 60px 20px;
    border-radius: 16px;
  }
`;

const LoadingMessage = styled.div`
  color: var(--text-secondary);
  font-size: 1rem;
  
  &::after {
    content: '...';
    animation: dots 1.5s infinite;
  }
  
  @keyframes dots {
    0%, 20% { content: ''; }
    40% { content: '.'; }
    60% { content: '..'; }
    80%, 100% { content: '...'; }
  }
  
  @media (min-width: 768px) {
    font-size: 1.1rem;
  }
`;

const ErrorMessage = styled.div`
  color: var(--text-danger, #e74c3c);
  font-size: 1rem;
  
  .retry-btn {
    margin-top: 12px;
    background: var(--primary-blue);
    color: white;
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    
    &:hover {
      background: var(--primary-blue-hover);
      transform: translateY(-1px);
    }
    
    @media (min-width: 768px) {
      margin-top: 16px;
      border-radius: 8px;
      padding: 10px 20px;
      font-size: 1rem;
      
      &:hover {
        transform: translateY(-2px);
      }
    }
  }
  
  @media (min-width: 768px) {
    font-size: 1.1rem;
  }
`;

const EmptyMessage = styled.div`
  color: var(--text-secondary);
  font-size: 1rem;
  
  .suggestion {
    margin-top: 8px;
    font-size: 0.9rem;
    color: var(--text-tertiary);
  }
  
  @media (min-width: 768px) {
    font-size: 1.1rem;
    
    .suggestion {
      margin-top: 12px;
      font-size: 0.95rem;
    }
  }
`;

const ResultCount = styled.div`
  margin-bottom: 16px;
  color: var(--text-secondary);
  font-size: 0.9rem;
  text-align: left;
  
  .count {
    color: var(--primary-blue);
    font-weight: 600;
  }
  
  @media (min-width: 768px) {
    grid-column: 1 / -1;
    margin-bottom: 20px;
    font-size: 1rem;
  }
`;

const TrainerInfoList = ({trainers, setTrainers, fetchTrainers}) => {
  const [loading] = useState(false);
  const [error] = useState(null);

  // 로딩 중일 때
  if (loading) {
    return (
      <MessageContainer>
        <LoadingMessage>트레이너 목록을 불러오는 중</LoadingMessage>
      </MessageContainer>
    );
  }

  // 에러 발생 시
  if (error) {
    return (
      <MessageContainer>
        <ErrorMessage>
          <div>{error}</div>
          <button className="retry-btn" onClick={fetchTrainers}>
            다시 시도
          </button>
        </ErrorMessage>
      </MessageContainer>
    );
  }

  // 트레이너가 없을 때
  if (trainers.length === 0) {
    return (
      <MessageContainer>
        <EmptyMessage>
          <div>검색 조건에 맞는 트레이너가 없습니다</div>
          <div className="suggestion">다른 검색어나 필터 조건을 시도해보세요</div>
        </EmptyMessage>
      </MessageContainer>
    );
  }

  return (
    <>
      <ResultCount>
        총 <span className="count">{trainers.length}명</span>의 트레이너를 찾았습니다
      </ResultCount>
      <InfoListWrapper>
        {trainers.map((trainer, index) => (
          <TrainerInfo 
            key={trainer.member_idx || index} 
            idx={index}
            trainerData={trainer}
          />
        ))}
      </InfoListWrapper>
    </>
  );
};

export default TrainerInfoList;