import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import dateFormat from '../../utils/dateFormat';
const {getDateDiffText} = dateFormat;

const RoutineWrapper = styled.div`
  width: calc( 50% - 5px );
  border: 1px solid var(--border-light);
  background: var(--bg-secondary);
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

  @media (max-width: 650px) {
    width: 100%;
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

const CategoryText = styled.div`
  font-size: 1.4rem;
  color: var(--text-secondary);
  margin-top: 8px;
  font-weight: bold;
`;

const Routine = ({ data, onDelete, type, setTempData, setHeightData }) => {
  const nav = useNavigate();
  const routineRef = useRef(null);

  // 클릭 이벤트에서 제외할 태그들
  const excludedTags = ['path', 'svg', 'button', 'BUTTON'];

  const handleGoRoutine = (e) => {
    if(type !== null && type === 'custom') {
      e.stopPropagation();
      nav(`/routine/detail/custom?date=${data.saveDate}`);
      return;
    }

    if (!excludedTags.includes(e.target.tagName)) {
      nav(`/routine/detail/${data.routine_list_idx}`);
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
        
        alert(result.msg);
        
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
    console.log("🚀  :  data:", data)
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
            <>{data.saveDate.slice(0, 10)} &ensp; {data.routine_name !== "" ? `( ${data.routine_name} )` : ''}</> :
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