import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
`;

const ModalContainer = styled.div`
  background: var(--bg-secondary);
  border-radius: 1.2rem;
  padding: 2.4rem 2rem 2rem 2rem;
  width: 420px;
  max-width: 96vw;
  max-height: 90vh;
  overflow-y: auto;
  color: var(--text-primary);
  box-shadow: 0 0.2rem 1.2rem rgba(0,0,0,0.22);
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
  font-size: 1.7rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  @media (max-width: 600px) {
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }
`;

const SectionTitle = styled.h3`
  margin-bottom: 0.5rem;
  color: var(--primary-blue-light);
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: -0.01em;
`;

const SetList = styled.ul`
  margin-top: 10px;
  padding-left: 0;
  font-size: 1.15rem;
  color: var(--text-primary);
`;

const SetItem = styled.li`
  padding: 0.8rem 1rem;
  border-bottom: 1px solid var(--border-light);
  border-radius: 0.5rem 0.5rem 0 0;
  background: var(--bg-tertiary);
  margin-bottom: 0.5rem;
  font-size: 1.08rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  transition: background 0.15s, color 0.15s;

  &:last-child {
    border-bottom: none;
  }
`;

const MemoBox = styled.div`
  margin-top: 16px;
  background: var(--bg-tertiary);
  padding: 12px;
  border-radius: 8px;
  font-size: 1.08rem;
  color: var(--text-primary);
  word-break: break-all;
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
  &:hover, &:focus {
    background: var(--primary-blue);
    color: var(--text-primary);
    outline: none;
  }
`;

const WorkoutRecordModal = ({ records, onClose }) => {
  const [recordDetails, setRecordDetails] = useState([]);

  useEffect(() => {
    const fetchAllDetails = async () => {
      try {
        const detailPromises = records.map(async (record) => {
          const [setRes, ptRes] = await Promise.all([
            axios.get(`/user/recordset/${record.record_idx}`),
            axios.get(`/user/pt/${record.pt_idx}`)
          ]);
          return {
            record,
            pt: ptRes.data,
            sets: setRes.data
          };
        });

        const allDetails = await Promise.all(detailPromises);
        setRecordDetails(allDetails);
      } catch (error) {
        console.error('운동 기록 전체 불러오기 오류:', error);
      }
    };

    if (records && records.length > 0) {
      fetchAllDetails();
    }
  }, [records]);

  if (!records || recordDetails.length === 0) return null;

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}>닫기</CloseButton>
        <Title>{records[0].record_date} 운동 기록</Title>
        {recordDetails.map((detail, idx) => (
          <div key={idx} style={{ marginBottom: '2rem' }}>
            <SectionTitle>{detail.pt.pt_name}</SectionTitle>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              <strong>루틴:</strong> {detail.record.routine_title}
            </p>
            <SectionTitle>세트 목록</SectionTitle>
            <SetList>
              {detail.sets.map((set, i) => (
                <SetItem key={i}>
                  <span style={{ color: 'var(--primary-blue-light)', fontWeight: 700 }}>
                    {set.set_num}세트
                  </span>
                  <span>{set.set_volume}kg</span>
                  <span>x</span>
                  <span>{set.set_count}회</span>
                </SetItem>
              ))}
            </SetList>
            {detail.record.routinept_memo && (
              <>
                <SectionTitle>메모</SectionTitle>
                <MemoBox>{detail.record.routinept_memo}</MemoBox>
              </>
            )}
          </div>
        ))}
      </ModalContainer>
    </ModalBackdrop>
  );
};

export default WorkoutRecordModal;

