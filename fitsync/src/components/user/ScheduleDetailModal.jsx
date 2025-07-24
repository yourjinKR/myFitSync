import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format, differenceInCalendarDays, isToday } from 'date-fns';
import styled from 'styled-components';

// 모달 배경
const ModalBackdrop = styled.div`
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.55);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// 모달 컨테이너
const ModalWrapper = styled.div`
  background: var(--bg-secondary);
  border-radius: 1.2rem;
  padding: 2.2rem 2rem 2rem 2rem;
  width: 370px;
  max-width: 96vw;
  box-shadow: 0 0.2rem 1.2rem rgba(0,0,0,0.22);
  position: relative;
  color: var(--text-primary);
  animation: modalPop 0.22s cubic-bezier(.4,2,.6,1) both;

  @keyframes modalPop {
    0% { transform: scale(0.95); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }

  @media (max-width: 600px) {
    width: 98vw;
    padding: 1.2rem 0.7rem 1.2rem 0.7rem;
    border-radius: 0.8rem;
  }
`;

const Title = styled.h3`
  font-size: 1.5rem;
  color: var(--primary-blue);
  text-align: center;
  font-weight: 700;
  margin-bottom: 1.2rem;
  letter-spacing: -0.02em;
`;

const Message = styled.p`
  color: var(--text-secondary);
  font-size: 1.08rem;
  text-align: center;
  margin-bottom: 2rem;
  font-weight: 500;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 0.7rem;
  justify-content: center;
  margin-top: 1.2rem;
`;

const MainButton = styled.button`
  background: var(--primary-blue);
  color: var(--text-primary);
  border-radius: 0.8rem;
  padding: 0.7rem 1.6rem;
  font-size: 1.08rem;
  font-weight: 600;
  border: none;
  box-shadow: 0 0.05rem 0.2rem rgba(74,144,226,0.10);
  transition: background 0.18s, color 0.18s;
  &:hover, &:focus {
    background: var(--primary-blue-hover);
    color: var(--bg-primary);
    outline: none;
  }
  &:disabled {
    background: var(--border-light);
    color: var(--text-tertiary);
    cursor: not-allowed;
  }
`;

const CloseButton = styled.button`
  background: var(--warning);
  color: var(--text-primary);
  border-radius: 0.8rem;
  padding: 0.7rem 1.6rem;
  font-size: 1.08rem;
  font-weight: 600;
  border: none;
  margin-top: 0.5rem;
  transition: background 0.18s, color 0.18s;
  &:hover, &:focus {
    background: var(--primary-blue-light);
    color: var(--bg-primary);
    outline: none;
  }
`;

const RemainInfo = styled.div`
  margin-top: 1.2rem;
  text-align: center;
  color: var(--primary-blue-light);
  font-size: 1.02rem;
  font-weight: 500;
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
