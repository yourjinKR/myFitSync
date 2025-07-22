import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useSelector } from 'react-redux';

const ModalWrapper = styled.div`
  position: fixed;
  top: 20%;
  left: 50%;
  transform: translate(-50%, 0);
  width: 400px;
  background: var(--bg-secondary); // 글로벌 스타일 적용
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  padding: 20px;
  z-index: 1000;
  color: var(--text-primary); // 글로벌 스타일 적용
`;

const Title = styled.h3`
  margin-bottom: 10px;
  color: var(--primary-blue); // 강조 컬러
`;

const CloseButton = styled.button`
  float: right;
  background: none;
  border: none;
  font-size: 20px;
  color: var(--text-secondary); // 글로벌 스타일 적용
  cursor: pointer;
  &:hover {
    color: var(--primary-blue);
  }
`;

const Section = styled.div`
  margin-top: 16px;
`;

const ListItem = styled.li`
  font-size: 1.1rem;
  margin: 4px 0;
  color: var(--text-primary); // 글로벌 스타일 적용
`;

const DailyDetailModal = ({ date, onClose }) => {
  const { member_idx } = useSelector((state) => state.user.user);
  const [records, setRecords] = useState([]);
  const [schedules, setSchedules] = useState([]);
  
  const ymd = date.toISOString().split('T')[0];

  useEffect(() => {
    const fetchDetail = async () => {
      const res1 = await axios.get(`/user/${member_idx}/records?date=${ymd}`);
      const res2 = await axios.get(`/user/${member_idx}/schedules?date=${ymd}`);
      setRecords(res1.data);
      setSchedules(res2.data);
      console.log(res1.data);
      
    };
    fetchDetail();
  }, [member_idx, ymd]);
  
  return (
    <ModalWrapper>
      <CloseButton onClick={onClose}>×</CloseButton>
      <Title>{ymd} 상세 내역</Title>

      <Section>
        <h4>🏋️ 운동 기록</h4>
        {records.length === 0 ? (
          <p>기록 없음</p>
        ) : (
          <ul>
            {records.map((r, i) => (
              <ListItem key={i}>{r.routine_title}</ListItem>
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
            {schedules.map((s, i) => (
              <ListItem key={i}>
                {s.schedule_stime} ~ {s.schedule_etime} / 트레이너: {s.trainer_name}
              </ListItem>
            ))}
          </ul>
        )}
      </Section>
    </ModalWrapper>
  );
};

export default DailyDetailModal;
