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

const TrainerInfoList = () => {

  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 컴포넌트 마운트 시 트레이너 목록 조회
  useEffect(() => {
    fetchTrainers();
  }, []);

  // 트레이너 목록을 서버에서 가져오는 함수 - 기존 MemberController의 임시 API 활용
  const fetchTrainers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 실제 API 호출
      const response = await axios.get('/member/trainers');
      setTrainers(response.data || []);
      
    } catch (error) {
      console.error('트레이너 목록 조회 실패:', error);
      setError('트레이너 목록을 불러오는데 실패했습니다.');
      setTrainers([]);
    } finally {
      setLoading(false);
    }
  };

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