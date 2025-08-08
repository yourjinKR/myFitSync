import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0; 
  left: 0;
  width: 100vw; 
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(20px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2100;
  padding: 2rem;
  box-sizing: border-box;
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContainer = styled.div`
  background: linear-gradient(145deg, rgba(42, 42, 42, 0.98), rgba(58, 58, 58, 0.95));
  border: 1px solid rgba(74, 144, 226, 0.25);
  border-radius: 20px;
  padding: 3.5rem 3rem;
  width: 520px;
  max-width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  color: var(--text-primary);
  backdrop-filter: blur(30px);
  box-shadow: 
    0 35px 90px rgba(0, 0, 0, 0.4),
    0 15px 40px rgba(74, 144, 226, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
  position: relative;
  margin: auto;
  animation: modalBounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);

  @keyframes modalBounceIn {
    from {
      opacity: 0;
      transform: translateY(50px) scale(0.9);
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
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(74, 144, 226, 0.6), transparent);
    border-radius: 20px 20px 0 0;
  }

  @media (max-width: 600px) {
    width: 100%;
    padding: 2.5rem 2rem;
    border-radius: 16px;
    max-height: 85vh;
  }
`;

const Title = styled.h2`
  margin-bottom: 3rem;
  font-size: 2.4rem;
  font-weight: 700;
  background: linear-gradient(135deg, #4A90E2 0%, #63B8FF 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  position: relative;
  text-shadow: 0 4px 8px rgba(74, 144, 226, 0.15);
  letter-spacing: -0.02em;

  &::after {
    content: '';
    position: absolute;
    bottom: -12px;
    left: 50%;
    width: 80px;
    height: 3px;
    background: linear-gradient(90deg, transparent, rgba(74, 144, 226, 0.8), transparent);
    border-radius: 2px;
    transform: translateX(-50%) scaleX(0);
    animation: titleUnderline 0.8s ease-out 0.4s forwards;
  }

  @keyframes titleUnderline {
    to { transform: translateX(-50%) scaleX(1); }
  }
  
  @media (max-width: 600px) {
    font-size: 2rem;
    margin-bottom: 2.5rem;
  }
`;

const SectionTitle = styled.h3`
  margin-bottom: 1.5rem;
  font-size: 1.7rem;
  font-weight: 600;
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.9), rgba(99, 184, 255, 0.8));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.01em;
  position: relative;
  padding-left: 1.5rem;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    width: 4px;
    height: 70%;
    background: linear-gradient(180deg, rgba(74, 144, 226, 0.8), rgba(99, 184, 255, 0.6));
    border-radius: 2px;
    transform: translateY(-50%);
  }
`;

const SetList = styled.ul`
  margin-top: 2rem;
  padding-left: 0;
  font-size: 1.5rem;
  color: var(--text-primary);
  background: linear-gradient(145deg, rgba(74, 144, 226, 0.05), rgba(99, 184, 255, 0.03));
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(74, 144, 226, 0.1);
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(74, 144, 226, 0.4), transparent);
    border-radius: 16px 16px 0 0;
  }
`;

const SetItem = styled.li`
  padding: 1.8rem 2.2rem;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  margin-bottom: 0.8rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid transparent;

  &:hover {
    background: rgba(74, 144, 226, 0.08);
    border-color: rgba(74, 144, 226, 0.2);
    transform: translateX(8px);
    box-shadow: 0 6px 20px rgba(74, 144, 226, 0.1);

    &::before {
      width: 4px;
    }
  }

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    width: 0;
    height: 60%;
    background: linear-gradient(180deg, rgba(74, 144, 226, 0.8), rgba(99, 184, 255, 0.6));
    border-radius: 0 2px 2px 0;
    transform: translateY(-50%);
    transition: width 0.3s ease;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const MemoBox = styled.div`
  margin-top: 2.5rem;
  background: linear-gradient(145deg, rgba(74, 144, 226, 0.06), rgba(99, 184, 255, 0.04));
  border: 1px solid rgba(74, 144, 226, 0.15);
  padding: 2rem;
  border-radius: 16px;
  font-size: 1.4rem;
  color: var(--text-primary);
  word-break: break-all;
  line-height: 1.6;
  position: relative;
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);

  &::before {
    content: '💭';
    position: absolute;
    top: -8px;
    left: 20px;
    background: linear-gradient(145deg, rgba(42, 42, 42, 0.98), rgba(58, 58, 58, 0.95));
    padding: 0.5rem 0.8rem;
    border-radius: 8px;
    font-size: 1.2rem;
    border: 1px solid rgba(74, 144, 226, 0.2);
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 2rem;
  right: 2rem;
  width: 52px;
  height: 52px;
  font-size: 1.6rem;
  font-weight: 600;
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.15), rgba(99, 184, 255, 0.1));
  border: 1px solid rgba(74, 144, 226, 0.3);
  border-radius: 50%;
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
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
    background: radial-gradient(circle, rgba(74, 144, 226, 0.3), transparent);
    border-radius: 50%;
    transition: all 0.4s ease;
    transform: translate(-50%, -50%);
  }
  
  &:hover {
    background: linear-gradient(135deg, rgba(74, 144, 226, 0.25), rgba(99, 184, 255, 0.2));
    border-color: rgba(74, 144, 226, 0.5);
    transform: rotate(90deg) scale(1.1);
    box-shadow: 0 8px 25px rgba(74, 144, 226, 0.25);

    &::before {
      width: 100%;
      height: 100%;
    }
  }

  &:active {
    transform: rotate(90deg) scale(0.95);
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

