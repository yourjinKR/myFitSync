import React from 'react';
import styled from 'styled-components';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RoutineWrapper = styled.div`
  border: 1px solid var(--border-light);
  background: var(--bg-secondary);
  margin-top: 15px;
  padding: 18px 18px 32px;
  border-radius: 12px;
  position: relative;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  transition: box-shadow 0.2s;
  & > p {
    width: 100%;
    text-align: center;
    font-size: 1.8rem;
    padding-top: 20px;
    color: var(--text-secondary);
    font-weight: 500;
  }
`;

const Inner = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  & > h3 {
    font-size: 1.6rem;
    color: var(--text-primary);
    font-weight: 600;
    margin: 0;
  }
  & > button {
    background: var(--bg-tertiary);
    border: none;
    border-radius: 8px;
    padding: 4px 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: background 0.2s;
    &:active {
      background: var(--primary-blue);
    }
    svg {
      color: var(--text-secondary);
      font-size: 2.2rem;
    }
  }
`;

const ControlBox = styled.div`
  position: absolute;
  right: 10px;
  top: 40px;
  display: none;
  flex-direction: column;
  border: 1px solid var(--border-light);
  background: var(--bg-secondary);
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.12);
  z-index: 10;
  .on & {
    display: flex;
  }
  & > button {
    padding: 10px 18px;
    border-bottom: 1px solid var(--border-light);
    background: transparent;
    color: var(--text-primary);
    font-size: 1.4rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
    &:last-child {
      border-bottom: 0;
    }
    &:active {
      background: var(--primary-blue);
      color: #fff;
    }
  }
`;

const Routine = ({ data, onDelete }) => {
  const nav = useNavigate();

  const handleGoRoutine = (e) => {
    if (
      e.target.tagName !== 'path' &&
      e.target.tagName !== 'svg' &&
      e.target.tagName !== 'button' &&
      e.target.tagName !== 'BUTTON'
    ) {
      nav(`/routine/detail/${data.routine_list_idx}`);
    }
  };

  const handleRoutineEdit = (e) => {
    e.target.closest('div[data-routine-wrapper]').classList.add('on');
  };

  const handleRoutineDelete = async (e) => {
    if (window.confirm('정말로 루틴을 삭제하시겠습니까?')) {
      try {
        const response = await axios.delete(`/routine/delete/${data.routine_list_idx}`, {
          withCredentials: true,
        });
        const result = response.data;
        if (result.success) {
          alert(result.msg);
          if (onDelete) onDelete(); // 삭제 후 목록 갱신
        } else {
          alert(result.msg);
        }
      } catch (error) {
        console.error('루틴 삭제 중 오류 발생:', error);
      }
    }
  };

  return (
    <RoutineWrapper data-routine-wrapper onClick={handleGoRoutine}>
      <Inner>
        <h3>{data.routine_name}</h3>
        <button type="button" onClick={handleRoutineEdit}>
          <MoreHorizIcon fontSize="large" />
        </button>
      </Inner>
      <p>운동하러가기</p>
      <ControlBox>
        <button>루틴편집</button>
        <button onClick={handleRoutineDelete}>루틴삭제</button>
      </ControlBox>
    </RoutineWrapper>
  );
};

export default Routine;