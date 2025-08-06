import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0; 
  left: 0;
  width: 100vw; 
  height: 100vh;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 2rem;
  box-sizing: border-box;
`;

const ModalContainer = styled.div`
  background: var(--bg-secondary);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 3rem 2.5rem;
  width: 450px;
  max-width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  color: var(--text-primary);
  box-shadow: 
    0 25px 60px rgba(0, 0, 0, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  position: relative;
  margin: auto;

  @media (max-width: 600px) {
    width: 100%;
    padding: 2rem 1.5rem;
    border-radius: 12px;
    max-height: 85vh;
  }
`;

const Title = styled.h2`
  margin-bottom: 2.5rem;
  color: var(--primary-blue);
  text-align: center;
  font-size: 2.4rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 8px rgba(74, 144, 226, 0.15);
  
  @media (max-width: 600px) {
    font-size: 2rem;
    margin-bottom: 2rem;
  }
`;

const SectionTitle = styled.h3`
  margin-bottom: 1.2rem;
  color: var(--primary-blue-light);
  font-size: 1.6rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  text-shadow: 0 1px 3px rgba(74, 144, 226, 0.1);
`;

const SetList = styled.ul`
  margin-top: 1.5rem;
  padding-left: 0;
  font-size: 1.5rem;
  color: var(--text-primary);
`;

const SetItem = styled.li`
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  margin-bottom: 0.8rem;
  font-size: 1.5rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);

  &:hover {
    background: rgba(74, 144, 226, 0.08);
  }

  &:last-child {
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    margin-bottom: 0;
  }
`;

const MemoBox = styled.div`
  margin-top: 2rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 1.5rem;
  border-radius: 12px;
  font-size: 1.4rem;
  color: var(--text-primary);
  word-break: break-all;
  line-height: 1.5;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 3rem;
  height: 3rem;
  font-size: 2rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 50%;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(74, 144, 226, 0.15);
    color: var(--primary-blue);
    border-color: var(--primary-blue);
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
  
  const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const yyyy = date.getFullYear();
  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
  const dd = date.getDate().toString().padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
  };
  
  if (!records || recordDetails.length === 0) return null;

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}>×</CloseButton>
        <Title>{formatDate(records[0].record_date)} 운동 기록</Title>
        {recordDetails.map((detail, idx) => (
            <div key={idx} style={{ marginBottom: '3rem' }}>
              <SectionTitle>{detail.pt.pt_name}</SectionTitle>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '1.4rem' }}>
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

