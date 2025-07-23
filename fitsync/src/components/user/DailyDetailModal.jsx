import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import WorkoutRecordModal from './WorkoutRecordModal';

const ModalWrapper = styled.div`
  background: var(--bg-secondary);
  border-radius: 1.2rem;
  padding: 2.4rem;
  width: 400px;
  max-width: 95vw;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  color: var(--text-primary);
  box-shadow: 0 0.2rem 1.2rem rgba(0, 0, 0, 0.18);

  @media (max-width: 600px) {
    width: 98vw;
    padding: 1.2rem 0.7rem;
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
  &:hover {
    color: var(--primary-blue);
  }
`;

const Title = styled.h3`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: var(--primary-blue);
  text-align: center;

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
  }

  p {
    color: var(--text-tertiary);
    font-size: 1.05rem;
    margin: 0.5rem 0;
  }
`;

const ListItem = styled.li`
  padding: 0.8rem;
  cursor: pointer;
  border-bottom: 1px solid var(--border-light);
  color: var(--text-primary);
  font-size: 1.15rem;
  border-radius: 0.5rem 0.5rem 0 0;
  transition: background 0.15s;

  &:hover {
    background: var(--bg-tertiary);
  }

  @media (max-width: 600px) {
    font-size: 1rem;
    padding: 0.6rem;
  }
`;

const DailyDetailModal = ({ date, onClose }) => {
  const { member_idx } = useSelector((state) => state.user.user);
  const [records, setRecords] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedRecordId, setSelectedRecordId] = useState(null);

  const ymd = format(date, 'yyyy-MM-dd');
  const displayDate = format(date, 'yyyy.MM.dd');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const [res1, res2] = await Promise.all([
          axios.get(`/user/${member_idx}/records?date=${ymd}`),
          axios.get(`/user/${member_idx}/schedules?date=${ymd}`)
        ]);
        setRecords(res1.data);
        setSchedules(res2.data);
        console.log('요청날짜:', ymd);
        console.log('스케줄 응답:', res2.data);

      } catch (error) {
        console.error('상세 내역 불러오기 실패:', error);
      }
    };

    fetchDetail();
  }, [member_idx, ymd]);

  return (
    <ModalWrapper>
      <CloseButton onClick={onClose}>×</CloseButton>
      <Title>{displayDate} 상세 내역</Title>

      <Section>
        <h4>🏋️ 운동 기록</h4>
        {records.length === 0 ? (
          <p>기록 없음</p>
        ) : (
          <ul>
            {records.map((record) => (
              <ListItem
                key={record.record_idx}
                onClick={() => setSelectedRecordId(record.record_idx)}
              >
                {record.routine_title || `${displayDate} 기록`}
              </ListItem>
            ))}
          </ul>
        )}
      </Section>

      <Section>
        <h4>📅 PT 예약</h4>
        {schedules.length === 0 ? (
          <p>예약 없음</p>
        ) : (
          <ul>
            {schedules.map((schedule, i) => (
              <ListItem key={i}>
                {schedule.schedule_stime} ~ {schedule.schedule_etime} / 트레이너: {schedule.trainer_name}
              </ListItem>
            ))}
          </ul>
        )}
      </Section>

      {selectedRecordId && (
        <WorkoutRecordModal
          recordId={selectedRecordId}
          onClose={() => setSelectedRecordId(null)}
        />
      )}
    </ModalWrapper>
  );
};

export default DailyDetailModal;
