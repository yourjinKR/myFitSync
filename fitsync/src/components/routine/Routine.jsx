import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import dateFormat from '../../utils/dateFormat';
const {getDateDiffText} = dateFormat;

const RoutineWrapper = styled.div`
  width: calc(50% - 0.75rem);
  border: 1px solid var(--border-light);
  background: var(--bg-secondary);
  padding: 1.5rem 2.5rem 2.5rem;
  border-radius: 16px;
  position: relative;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
  cursor: pointer;
  
  & > p {
    width: 100%;
    text-align: center;
    font-size: 1.6rem;
    padding-top: 2rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  @media (max-width: 650px) {
    width: 100%;
  }
`;

const Inner = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  & > h3 {
    font-size: 1.8rem;
    color: var(--text-primary);
    font-weight: 700;
    margin: 0;
    line-height: 1.3;
  }
  
  & > button {
    background: var(--bg-tertiary);
    border: 1px solid var(--border-light);
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    
    svg {
      width: 2.6rem;
      height: 2.6rem;
      color: white;
      transition: color 0.2s ease;
      background: var(--error);
      border-radius: 50%;
      padding: 0.2rem;
    }
  }
`;

const CategoryText = styled.div`
  font-size: 1.4rem;
  color: var(--text-secondary);
  margin-top: 1rem;
  font-weight: 600;
  line-height: 1.4;
`;


const Routine = ({ data, onDelete, type, setTempData, setHeightData, targetIdx : propTargetIdx  }) => {
  const nav = useNavigate();
  const routineRef = useRef(null);

  const location = useLocation();
  const targetIdx = propTargetIdx ?? location.state?.targetMember;

  // 클릭 이벤트에서 제외할 태그들
  const excludedTags = ['path', 'svg', 'button', 'BUTTON'];

  const handleGoRoutine = (e) => {
    if(type !== null && type === 'custom') {
      e.stopPropagation();
      nav(`/routine/detail/custom?date=${data.saveDate}`);
      return;
    }

    if (!excludedTags.includes(e.target.tagName)) {
      nav(`/routine/detail/${data.routine_list_idx}`,{
        state: { targetMember: targetIdx }
      });
    }
  };
  
  
  const handleRoutineDelete = async (e) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    
    if (window.confirm('정말로 루틴을 삭제하시겠습니까?')) {
      try {
        if(type !== null && type === 'custom') {
          const localData = JSON.parse(localStorage.getItem('routineData'));
          const newLocalData = localData.filter(item => item.saveDate !== data.saveDate);
          setTempData(newLocalData);
          return;
        }
        const response = await axios.delete(`/routine/delete/${data.routine_list_idx}`, {
          withCredentials: true,
        });
        const result = response.data;
        
        if (result.success && onDelete) {
          onDelete(); // 삭제 후 목록 갱신
        }
      } catch (error) {
        console.error('루틴 삭제 중 오류 발생:', error);
        alert('루틴 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  useEffect(() => {
    if(setHeightData && routineRef.current) {
      setHeightData(routineRef.current ? routineRef.current.offsetHeight : 0);
    }
  }, [data]);

  // 카테고리 텍스트 생성 (중복 제거)
  const getCategoryText = () => {
    const uniqueCategories = [...new Set(data.routines.map(routine => routine.pt.pt_category))];
    return uniqueCategories.join(', ');
  };

  return (
    <RoutineWrapper ref={routineRef} onClick={handleGoRoutine}>
      <Inner>
        <h3>
          {
            type !== null && type === 'custom' ? 
            <>{data.saveDate.slice(0, 10)} &ensp; {data.routine_name !== "" ? `( ${data.routine_name === undefined ? '자유운동' : data.routine_name } )` : ''}</> :
            <>{data.routine_name} {data.writer_idx !== data.member_idx  ? data.writer_idx === 0 ? '🤖' : '💪' : '' }</>
          }
        </h3>
        <button onClick={handleRoutineDelete}>
          <DeleteIcon />
        </button>
      </Inner>
      <CategoryText>
        {getCategoryText()}<br/>
         {
            type !== null && type === 'custom' ? 
            <>{getDateDiffText(data.saveDate)}</> :
            <></>
          }
      </CategoryText>
    </RoutineWrapper>
  );
};

export default Routine;