import React, { useState, useEffect } from 'react';
import TrainerInfo from './TrainerInfo';
import styled from 'styled-components';
import axios from 'axios';

const InfoListWrapper = styled.div`
  border-top:1px solid #ccc;
`;
const LoadingMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: #666;
`;

const ErrorMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: #e74c3c;
`;

const TrainerInfoList = ({trainers, setTrainers, fetchTrainers}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 로딩 중일 때
  if (loading) {
    return (
      <InfoListWrapper>
        <LoadingMessage>트레이너 목록을 불러오는 중...</LoadingMessage>
      </InfoListWrapper>
    );
  }

  // 에러 발생 시
  if (error) {
    return (
      <InfoListWrapper>
        <ErrorMessage>
          {error}
          <br />
          <button onClick={fetchTrainers} style={{ marginTop: '10px', padding: '5px 10px', cursor: 'pointer' }}>
            다시 시도
          </button>
        </ErrorMessage>
      </InfoListWrapper>
    );
  }

  // 트레이너가 없을 때
  if (trainers.length === 0) {
    return (
      <InfoListWrapper>
        <LoadingMessage>등록된 트레이너가 없습니다.</LoadingMessage>
      </InfoListWrapper>
    );
  }

  return (
    <InfoListWrapper>
      {trainers.map((trainer, index) => (
        <TrainerInfo 
          key={trainer.member_idx || index} 
          idx={index}
          trainerData={trainer}
        />
      ))}
    </InfoListWrapper>
  );
  
};

export default TrainerInfoList;