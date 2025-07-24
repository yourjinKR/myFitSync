import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import WorkoutRecordModal from './WorkoutRecordModal';
import ScheduleDetailModal from './ScheduleDetailModal';

// 모달 전체 배경
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
  padding: 2.4rem 2rem 2rem 2rem;
  width: 420px;
  max-width: 96vw;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  color: var(--text-primary);
  box-shadow: 0 0.2rem 1.2rem rgba(0,0,0,0.22);

  @media (max-width: 600px) {
    width: 99vw;
    padding: 1.2rem 0.7rem 1.2rem 0.7rem;
    border-radius: 0.8rem;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  right: 1.2rem;
  top: 1.2rem;
  font-size: 2.2rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: color 0.2s;
  &:hover {
    color: var(--primary-blue);
  }
`;

const Title = styled.h3`
  font-size: 2.1rem;
  margin-bottom: 2rem;
  color: var(--primary-blue);
  text-align: center;
  letter-spacing: -0.02em;
  font-weight: 700;

  @media (max-width: 600px) {
    font-size: 1.3rem;
    margin-bottom: 1.2rem;
  }
`;

const Section = styled.section`
  margin-bottom: 2.4rem;

  h4 {
    color: var(--primary-blue-light);
    font-size: 1.15rem;
    margin-bottom: 0.7rem;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  p {
    color: var(--text-secondary);
    font-size: 1.08rem;
    margin: 0.5rem 0;
    font-weight: 400;
    letter-spacing: -0.01em;
  }
`;

const List = styled.ul`
  border-radius: 0.7rem;
  background: var(--bg-tertiary);
  box-shadow: 0 0.05rem 0.3rem rgba(0,0,0,0.08);
  padding: 0.2rem 0;
`;

const ListItem = styled.li`
  padding: 1rem 1.2rem;
  cursor: pointer;
  border-bottom: 1px solid var(--border-light);
  color: var(--text-primary);
  font-size: 1.15rem;
  border-radius: 0.5rem 0.5rem 0 0;
  transition: background 0.15s, color 0.15s;
  background: transparent;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover, &:focus {
    background: var(--primary-blue-light);
    color: var(--bg-primary);
    outline: none;
  }

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 600px) {
    font-size: 1rem;
    padding: 0.7rem 0.7rem;
  }
`;

const EmptyText = styled.p`
  color: var(--text-tertiary);
  text-align: center;
  font-size: 1.08rem;
  margin: 1.2rem 0;
`;

const DailyDetailModal = ({ date, onClose }) => {
  const { member_idx } = useSelector((state) => state.user.user);
  const [records, setRecords] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedRecordGroup, setSelectedRecordGroup] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const ymd = format(date, 'yyyy-MM-dd');
  const displayDate = format(date, 'yyyy.MM.dd');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const [res1, res2] = await Promise.all([
          axios.get(`/user/${member_idx}/records?date=${ymd}`),
          axios.get(`/user/${member_idx}/schedules?date=${ymd}`)
        ]);

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
        setSchedules(res2.data);
      } catch (error) {
        console.error('상세 내역 불러오기 실패:', error);
      }
    };
    fetchDetail();
  }, [member_idx, ymd]);

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
                  onClick={() => setSelectedRecordGroup(recordGroup)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedRecordGroup(recordGroup);
                    }
                  }}
                >
                  {recordGroup.displayTitle}
                </ListItem>
              ))}
            </List>
          )}
        </Section>

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
                  onClick={() => setSelectedSchedule(schedule)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedSchedule(schedule);
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

        {selectedRecordGroup && (
          <WorkoutRecordModal
            records={selectedRecordGroup.records}
            onClose={() => setSelectedRecordGroup(null)}
          />
        )}

        {selectedSchedule && (
          <ScheduleDetailModal
            schedule={selectedSchedule}
            onClose={() => setSelectedSchedule(null)}
          />
        )}
      </ModalWrapper>
    </ModalBackdrop>
  );
};

export default DailyDetailModal;
