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
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(25px);
  z-index: 2200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  box-sizing: border-box;
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

// 모달 컨테이너
const ModalWrapper = styled.div`
  background: linear-gradient(145deg, rgba(42, 42, 42, 0.98), rgba(58, 58, 58, 0.95));
  border: 1px solid rgba(74, 144, 226, 0.3);
  border-radius: 24px;
  padding: 4rem 3.5rem;
  width: 580px;
  max-width: 100%;
  backdrop-filter: blur(40px);
  box-shadow: 
    0 40px 100px rgba(0, 0, 0, 0.5),
    0 20px 50px rgba(74, 144, 226, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  position: relative;
  color: var(--text-primary);
  margin: auto;
  animation: modalSlideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);

  @keyframes modalSlideUp {
    from {
      opacity: 0;
      transform: translateY(60px) scale(0.85);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, rgba(74, 144, 226, 0.8), transparent);
    border-radius: 24px 24px 0 0;
  }

  @media (max-width: 600px) {
    width: 100%;
    padding: 3rem 2.5rem;
    border-radius: 20px;
  }
`;

const Title = styled.h3`
  font-size: 2.4rem;
  font-weight: 700;
  background: linear-gradient(135deg, #4A90E2 0%, #63B8FF 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  margin-bottom: 2.5rem;
  letter-spacing: -0.02em;
  position: relative;
  text-shadow: 0 4px 8px rgba(74, 144, 226, 0.15);

  &::after {
    content: '';
    position: absolute;
    bottom: -12px;
    left: 50%;
    width: 100px;
    height: 3px;
    background: linear-gradient(90deg, transparent, rgba(74, 144, 226, 0.8), transparent);
    border-radius: 2px;
    transform: translateX(-50%) scaleX(0);
    animation: titleUnderline 0.8s ease-out 0.5s forwards;
  }

  @keyframes titleUnderline {
    to { transform: translateX(-50%) scaleX(1); }
  }
`;

const Message = styled.p`
  color: var(--text-secondary);
  font-size: 1.7rem;
  text-align: center;
  margin-bottom: 3rem;
  font-weight: 500;
  line-height: 1.6;
  padding: 2rem;
  background: linear-gradient(145deg, rgba(74, 144, 226, 0.05), rgba(99, 184, 255, 0.03));
  border-radius: 16px;
  border: 1px solid rgba(74, 144, 226, 0.1);
  position: relative;

  &::before {
    content: '📅';
    position: absolute;
    top: -8px;
    left: 20px;
    background: linear-gradient(145deg, rgba(42, 42, 42, 0.98), rgba(58, 58, 58, 0.95));
    padding: 0.5rem 0.8rem;
    border-radius: 8px;
    font-size: 1.3rem;
    border: 1px solid rgba(74, 144, 226, 0.2);
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  margin-top: 3rem;
`;

const MainButton = styled.button`
  background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-light));
  color: white;
  border-radius: 16px;
  padding: 1.4rem 2.8rem;
  font-size: 1.6rem;
  font-weight: 600;
  border: none;
  box-shadow: 0 12px 32px rgba(74, 144, 226, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.3), transparent);
    border-radius: 50%;
    transition: all 0.4s ease;
    transform: translate(-50%, -50%);
  }
  
  &:hover, &:focus {
    background: linear-gradient(135deg, var(--primary-blue-hover), var(--primary-blue));
    box-shadow: 0 16px 40px rgba(74, 144, 226, 0.4);
    transform: translateY(-3px);
    outline: none;

    &::before {
      width: 300px;
      height: 300px;
    }
  }

  &:active {
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: var(--border-light);
    color: var(--text-tertiary);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;

    &::before {
      display: none;
    }
  }
`;

const CloseButton = styled.button`
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.15), rgba(239, 83, 80, 0.1));
  color: #ff6b6b;
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 16px;
  padding: 1.4rem 2.8rem;
  font-size: 1.6rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: radial-gradient(circle, rgba(244, 67, 54, 0.2), transparent);
    border-radius: 50%;
    transition: all 0.4s ease;
    transform: translate(-50%, -50%);
  }
  
  &:hover, &:focus {
    background: linear-gradient(135deg, rgba(244, 67, 54, 0.25), rgba(239, 83, 80, 0.2));
    border-color: rgba(244, 67, 54, 0.5);
    box-shadow: 0 12px 32px rgba(244, 67, 54, 0.25);
    transform: translateY(-3px);
    outline: none;

    &::before {
      width: 300px;
      height: 300px;
    }
  }

  &:active {
    transform: translateY(-1px);
  }
`;

const RemainInfo = styled.div`
  margin-top: 3rem;
  text-align: center;
  font-size: 1.6rem;
  font-weight: 600;
  padding: 2rem;
  background: linear-gradient(145deg, rgba(74, 144, 226, 0.08), rgba(99, 184, 255, 0.05));
  border-radius: 16px;
  border: 1px solid rgba(74, 144, 226, 0.2);
  color: var(--primary-blue-light);
  position: relative;

  &::before {
    content: '⏰';
    position: absolute;
    top: -8px;
    left: 20px;
    background: linear-gradient(145deg, rgba(42, 42, 42, 0.98), rgba(58, 58, 58, 0.95));
    padding: 0.5rem 0.8rem;
    border-radius: 8px;
    font-size: 1.3rem;
    border: 1px solid rgba(74, 144, 226, 0.2);
  }
  
  b {
    color: var(--primary-blue);
    font-size: 1.9rem;
    text-shadow: 0 2px 4px rgba(74, 144, 226, 0.2);
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
