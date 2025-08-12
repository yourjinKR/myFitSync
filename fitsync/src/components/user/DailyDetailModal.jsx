import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';

// 모달 전체 배경
const ModalBackdrop = styled.div`
  position: fixed;
  top: 0; 
  left: 0;
  width: 100vw; 
  height: 100vh;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(15px);
  z-index: 2000;
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
  background: linear-gradient(145deg, rgba(42, 42, 42, 0.95), rgba(58, 58, 58, 0.9));
  border: 1px solid rgba(74, 144, 226, 0.2);
  border-radius: 20px;
  padding: 3rem 2.5rem;
  width: 500px;
  max-width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  color: var(--text-primary);
  backdrop-filter: blur(25px);
  box-shadow: 
    0 30px 80px rgba(0, 0, 0, 0.3),
    0 10px 30px rgba(74, 144, 226, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  margin: auto;
  animation: modalSlideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  @keyframes modalSlideUp {
    from {
      opacity: 0;
      transform: translateY(30px) scale(0.95);
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
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(74, 144, 226, 0.4), transparent);
    border-radius: 20px 20px 0 0;
  }

  @media (max-width: 600px) {
    width: 100%;
    padding: 2rem 1.5rem;
    border-radius: 16px;
    max-height: 85vh;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  right: 1.5rem;
  top: 1.5rem;
  width: 3.5rem;
  height: 3.5rem;
  font-size: 2rem;
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.12), rgba(74, 144, 226, 0.08));
  border: 1px solid rgba(74, 144, 226, 0.2);
  border-radius: 50%;
  color: var(--primary-blue);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(15px);
  
  &:hover {
    background: linear-gradient(135deg, rgba(74, 144, 226, 0.2), rgba(74, 144, 226, 0.15));
    color: white;
    border-color: var(--primary-blue);
    transform: rotate(90deg) scale(1.1);
    box-shadow: 0 8px 25px rgba(74, 144, 226, 0.3);
  }
`;

const Title = styled.h3`
  font-size: 2.6rem;
  margin-bottom: 2.5rem;
  color: var(--primary-blue);
  text-align: center;
  letter-spacing: -0.02em;
  font-weight: 700;
  text-shadow: 0 4px 12px rgba(74, 144, 226, 0.2);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, transparent, var(--primary-blue), transparent);
    border-radius: 2px;
  }

  @media (max-width: 600px) {
    font-size: 2.2rem;
    margin-bottom: 2rem;
  }
`;

const Section = styled.section`
  margin-bottom: 3rem;

  h4 {
    color: var(--primary-blue-light);
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    text-shadow: 0 2px 6px rgba(74, 144, 226, 0.15);
    position: relative;
    padding-left: 1rem;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 70%;
      background: linear-gradient(180deg, var(--primary-blue), var(--primary-blue-light));
      border-radius: 2px;
    }
  }

  p {
    color: var(--text-secondary);
    font-size: 1.4rem;
    margin: 0.8rem 0;
    font-weight: 400;
    letter-spacing: -0.01em;
  }
`;

const List = styled.ul`
  border-radius: 16px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(74, 144, 226, 0.15);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.15),
    0 4px 12px rgba(74, 144, 226, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(74, 144, 226, 0.3), transparent);
  }
`;

const ListItem = styled.li`
  padding: 1.8rem 2.2rem;
  cursor: pointer;
  border-bottom: 1px solid rgba(74, 144, 226, 0.08);
  color: var(--text-primary);
  font-size: 1.6rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: transparent;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 1rem;
  line-height: 1.5;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 0;
    background: linear-gradient(135deg, rgba(74, 144, 226, 0.2), rgba(74, 144, 226, 0.1));
    transition: width 0.3s ease;
  }

  &:hover, &:focus {
    background: linear-gradient(135deg, rgba(74, 144, 226, 0.12), rgba(74, 144, 226, 0.08));
    color: var(--primary-blue-light);
    outline: none;
    transform: translateX(8px);
    
    &::before {
      width: 4px;
    }
  }

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 600px) {
    font-size: 1.5rem;
    padding: 1.5rem 1.8rem;
  }
`;

const EmptyText = styled.p`
  color: var(--text-tertiary);
  text-align: center;
  font-size: 1.5rem;
  margin: 2.5rem 0;
  padding: 2.5rem;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.01));
  border-radius: 12px;
  border: 1px dashed rgba(74, 144, 226, 0.2);
  position: relative;
  
  &::before {
    content: '📭';
    display: block;
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.6;
  }
`;

const DailyDetailModal = ({ 
  date, 
  onClose,
  onOpenWorkoutRecord, // 운동 기록 모달 열기 콜백
  onOpenScheduleDetail // 스케줄 상세 모달 열기 콜백
}) => {
  const { member_idx, member_type } = useSelector((state) => state.user.user);
  const [records, setRecords] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const ymd = format(date, 'yyyy-MM-dd');
  const displayDate = format(date, 'yyyy.MM.dd');
  const isTrainer = member_type === 'trainer';

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        // 운동 기록은 항상 가져오기
        const recordsPromise = axios.get(`/user/${member_idx}/records?date=${ymd}`);
        
        // 트레이너가 아닐 때만 스케줄 가져오기
        const promises = [recordsPromise];
        if (!isTrainer) {
          promises.push(axios.get(`/user/${member_idx}/schedules?date=${ymd}`));
        }

        const responses = await Promise.all(promises);
        const [res1, res2] = responses;

        // ✅ 중복된 record_date를 기준으로 그룹핑
        const groupedByDate = {};
        res1.data.forEach((record) => {
          const dateKey = record.record_date;
          if (!groupedByDate[dateKey]) {
            groupedByDate[dateKey] = [];
          }
          groupedByDate[dateKey].push(record);
        });
          
        // ✅ record_date 하나당 1개만 리스트에 보여주기 위해 대표 하나만 추출
          const displayList = Object.entries(groupedByDate).map(([date, records]) => {
            const parsed = new Date(parseInt(date));  // ← 명확히 숫자로 변환
            const displayDate = isNaN(parsed.getTime())
              ? '기록'
              : `${format(parsed, 'yyyy.MM.dd')} 기록`;

            return {
              date,
              records,
              displayTitle: records[0].routine_title || displayDate,
            };
          });

        setRecords(displayList);
        
        // 트레이너가 아닐 때만 스케줄 설정
        if (!isTrainer && res2) {
          setSchedules(res2.data);
        } else {
          setSchedules([]);
        }
      } catch (error) {
        console.error('상세 내역 불러오기 실패:', error);
      }
    };
    fetchDetail();
  }, [member_idx, ymd, isTrainer]);

  return (
    <ModalBackdrop>
      <ModalWrapper>
        <CloseButton onClick={onClose} aria-label="닫기">×</CloseButton>
        <Title>{displayDate} 상세 내역</Title>

        <Section>
          <h4>🏋️ 운동 기록</h4>
          {records.length === 0 ? (
            <EmptyText>기록 없음</EmptyText>
          ) : (
            <List>
              {records.map((recordGroup, i) => (
                <ListItem
                  key={i}
                  tabIndex={0}
                  onClick={() => {
                    onClose(); // 현재 모달 닫기
                    onOpenWorkoutRecord && onOpenWorkoutRecord(recordGroup.records);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onClose(); // 현재 모달 닫기
                      onOpenWorkoutRecord && onOpenWorkoutRecord(recordGroup.records);
                    }
                  }}
                >
                  {recordGroup.displayTitle}
                </ListItem>
              ))}
            </List>
          )}
        </Section>

        {/* 트레이너가 아닐 때만 PT 예약 섹션 표시 */}
        {!isTrainer && (
          <Section>
            <h4>📅 PT 예약</h4>
            {schedules.length === 0 ? (
              <EmptyText>예약 없음</EmptyText>
            ) : (
              <List>
                {schedules.map((schedule, i) => (
                  <ListItem
                    key={i}
                    tabIndex={0}
                    onClick={() => {
                      onClose(); // 현재 모달 닫기
                      onOpenScheduleDetail && onOpenScheduleDetail(schedule);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        onClose(); // 현재 모달 닫기
                        onOpenScheduleDetail && onOpenScheduleDetail(schedule);
                      }
                    }}
                  >
                    {schedule.schedule_stime} ~ {schedule.schedule_etime}
                    <span style={{ color: 'var(--primary-blue-light)', fontWeight: 400 }}>
                      / 트레이너: {schedule.trainer_name}
                    </span>
                  </ListItem>
                ))}
              </List>
          )}
        </Section>
        )}
      </ModalWrapper>
    </ModalBackdrop>
  );
};export default DailyDetailModal;
