import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format, differenceInCalendarDays, isToday } from 'date-fns';
import styled from 'styled-components';

// 모달 배경
const ModalBackdrop = styled.div`
  position: fixed;
  top: 0; 
  left: 0;
  width: 100vw; 
  height: 100vh;
  background: rgba(0,0,0,0.55);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  box-sizing: border-box;
`;

// 모달 컨테이너
const ModalWrapper = styled.div`
  background: var(--bg-secondary);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 3rem 2.5rem;
  width: 420px;
  max-width: 100%;
  box-shadow: 
    0 25px 60px rgba(0, 0, 0, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  position: relative;
  color: var(--text-primary);
  margin: auto;
  animation: modalPop 0.22s cubic-bezier(.4,2,.6,1) both;

  @keyframes modalPop {
    0% { transform: scale(0.95); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }

  @media (max-width: 600px) {
    width: 100%;
    padding: 2rem 1.5rem;
    border-radius: 12px;
  }
`;

const Title = styled.h3`
  font-size: 2.2rem;
  color: var(--primary-blue);
  text-align: center;
  font-weight: 700;
  margin-bottom: 2rem;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 8px rgba(74, 144, 226, 0.15);
`;

const Message = styled.p`
  color: var(--text-secondary);
  font-size: 1.6rem;
  text-align: center;
  margin-bottom: 2.5rem;
  font-weight: 500;
  line-height: 1.5;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1.2rem;
  justify-content: center;
  margin-top: 2rem;
`;

const MainButton = styled.button`
  background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-light));
  color: white;
  border-radius: 12px;
  padding: 1.2rem 2.4rem;
  font-size: 1.5rem;
  font-weight: 600;
  border: none;
  box-shadow: 0 8px 24px rgba(74, 144, 226, 0.25);
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover, &:focus {
    background: linear-gradient(135deg, var(--primary-blue-hover), var(--primary-blue));
    box-shadow: 0 12px 32px rgba(74, 144, 226, 0.35);
    transform: translateY(-2px);
    outline: none;
  }
  
  &:disabled {
    background: var(--border-light);
    color: var(--text-tertiary);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const CloseButton = styled.button`
  background: rgba(244, 67, 54, 0.1);
  color: var(--warning);
  border: 1px solid var(--warning);
  border-radius: 12px;
  padding: 1.2rem 2.4rem;
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 0;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover, &:focus {
    background: var(--warning);
    color: white;
    outline: none;
  }
`;

const RemainInfo = styled.div`
  margin-top: 2rem;
  text-align: center;
  color: var(--primary-blue-light);
  font-size: 1.5rem;
  font-weight: 600;
  padding: 1.5rem;
  background: rgba(74, 144, 226, 0.08);
  border-radius: 10px;
  border: 1px solid rgba(74, 144, 226, 0.2);
  
  b {
    color: var(--primary-blue);
    font-size: 1.8rem;
  }
`;

const ScheduleDetailModal = ({ schedule, onClose }) => {
  const [matching, setMatching] = useState(null);
  const [loading, setLoading] = useState(false);

  const scheduleDate = new Date(schedule.schedule_date);

  // 1. 매칭 정보 불러오기
  useEffect(() => {
    const fetchMatching = async () => {
      try {
        const res = await axios.get(`/user/matched-member/${schedule.user_idx}`);
        setMatching(res.data); // matching_remain, total 등 포함
      } catch (error) {
        console.error('매칭 정보 불러오기 실패:', error);
      }
    };

    fetchMatching();
  }, [schedule]);

  const handleConfirmPT = async () => {
    if (!matching) return;
    setLoading(true);

    try {
      // 1. 스케줄 확인 처리
      await axios.put(`/user/schedule/check/${schedule.schedule_idx}`);

      // 2. 매칭 남은 횟수 차감
      await axios.put(`/user/matching/decrease/${matching.matching_idx}`);

      alert('PT 확인되었습니다!');
      onClose(); // 모달 닫기
    } catch (err) {
      console.error('확인 실패:', err);
      alert('PT 확인 중 오류 발생');
    } finally {
      setLoading(false);
    }
  };

  const getMessage = () => {
    if (schedule.schedule_check === 1) return '이미 PT를 완료한 일정입니다.';
    if (isToday(scheduleDate)) return '오늘은 PT 예정일입니다!';
    const daysLeft = differenceInCalendarDays(scheduleDate, new Date());
    return `PT까지 ${daysLeft}일 남았습니다.`;
  };

  return (
    <ModalBackdrop>
      <ModalWrapper>
        <Title>{format(scheduleDate, 'yyyy.MM.dd')} PT 일정</Title>
        <Message>{getMessage()}</Message>
        {matching && (
          <RemainInfo>
            남은 PT 횟수 <b>{matching.matching_remain}</b> / 총 {matching.matching_total}
          </RemainInfo>
        )}

        <ButtonRow>
          {isToday(scheduleDate) && schedule.schedule_check === 0 && (
            <MainButton onClick={handleConfirmPT} disabled={loading}>
              {loading ? '처리 중...' : 'PT 받았습니다'}
            </MainButton>
          )}
          <CloseButton onClick={onClose}>닫기</CloseButton>
        </ButtonRow>
      </ModalWrapper>
    </ModalBackdrop>
  );
};

export default ScheduleDetailModal;
