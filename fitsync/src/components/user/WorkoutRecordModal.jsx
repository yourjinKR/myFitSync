import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
`;

const ModalContainer = styled.div`
  background: var(--bg-secondary);
  border-radius: 1.2rem;
  padding: 2.4rem;
  width: 420px;
  max-width: 96vw;
  max-height: 90vh;
  overflow-y: auto;
  color: var(--text-primary);
  box-shadow: 0 0.2rem 1.2rem rgba(0,0,0,0.18);
  position: relative;

  @media (max-width: 600px) {
    width: 99vw;
    padding: 1.2rem 0.7rem 1.2rem 0.7rem;
    border-radius: 0.8rem;
  }
`;

const Title = styled.h2`
  margin-bottom: 1.5rem;
  color: var(--primary-blue);
  text-align: center;
  font-size: 1.6rem;
`;

const SetList = styled.ul`
  margin-top: 12px;
  padding-left: 20px;
  font-size: 1.15rem;
  color: var(--text-primary);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1.2rem;
  right: 1.2rem;
  background: var(--warning);
  color: var(--text-primary);
  border: none;
  border-radius: 0.7rem;
  padding: 0.5rem 1.2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  &:hover {
    background: var(--primary-blue);
    color: var(--text-primary);
  }
`;

const MemoBox = styled.div`
  margin-top: 16px;
  background: var(--bg-tertiary);
  padding: 12px;
  border-radius: 8px;
  font-size: 1.15rem;
  color: var(--text-primary);
`;

const WorkoutRecordModal = ({ recordId, onClose }) => {
  const [recordDetail, setRecordDetail] = useState(null);
  const [recordSets, setRecordSets] = useState([]);
  const [ptInfo, setPtInfo] = useState(null);

  useEffect(() => {
    if (!recordId) return;

    const fetchData = async () => {
      try {
        // 1. record 정보
        const recordRes = await axios.get(`/user/record/${recordId}`);
        const record = recordRes.data;
        setRecordDetail(record);

        // 2. recordset 정보
        const setRes = await axios.get(`/user/recordset/${recordId}`);
        setRecordSets(setRes.data);

        console.log(setRes.data);

        // 3. pt 정보
        const ptRes = await axios.get(`/user/pt/${record.pt_idx}`);
        setPtInfo(ptRes.data);
      } catch (error) {
        console.error('운동 기록 불러오기 오류:', error);
      }
    };

    fetchData();
  }, [recordId]);

  if (!recordDetail || !ptInfo) return null;
 
  
  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}>닫기</CloseButton>
        <Title>{ptInfo.pt_name}</Title>
        <p><strong>날짜:</strong> {recordDetail.record_date}</p>
        <p><strong>루틴:</strong> {recordDetail.routine_title}</p>

        <h4 style={{ color: 'var(--primary-blue-light)', margin: '1.2rem 0 0.7rem' }}>세트 목록</h4>
        <SetList>
          {recordSets.map((set, idx) => (
            <li key={idx}>
              {set.set_num}세트 - {set.set_volume}kg x {set.set_count}회
            </li>
          ))}
        </SetList>

        {recordDetail.routinept_memo && (
          <>
            <h4 style={{ color: 'var(--primary-blue-light)', margin: '1.2rem 0 0.7rem' }}>메모</h4>
            <MemoBox>{recordDetail.routinept_memo}</MemoBox>
          </>
        )}
      </ModalContainer>
    </ModalBackdrop>
  );
};

export default WorkoutRecordModal;
