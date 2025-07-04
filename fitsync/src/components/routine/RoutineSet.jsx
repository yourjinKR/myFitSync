import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import WorkoutSet from './WorkoutSet';
import styled from 'styled-components';

const Wrapper = styled.div`
  margin: 0 auto;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  padding: 0 15px 18px 15px;
`;

const H3Input = styled.input`
  font-size: 1.8rem;
  font-weight: 700;
  padding: 14px 0 10px 0;
  border: none;
  border-bottom: 1px solid #e6e6e6;
  margin-bottom: 0;
  background: #f7f9fc;
  border-radius: 14px 14px 0 0;
  width: 100%;
  outline: none;
`;

const AddButton = styled.button`
  display: block;
  max-width: 700px;
  width: 90%;
  padding: 15px 0;
  background: #7D93FF;
  color: #fff;
  font-size: 2.4rem;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(125,147,255,0.07);
  position:fixed;
  bottom: 15px;
  left:50%;
  transform:translateX(-50%);
`;

const RoutineSet = () => {
  const nav = useNavigate();
  const { routineData, setRoutineData } = useOutletContext();

  useEffect(() => {
    if (routineData.list.length === 0) {
      nav("/routine/add");
    }
  }, []);

  // 입력값만 변경
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    
    // routineData.routine_name도 함께 변경
    setRoutineData(prevData => ({
        ...prevData,
        routine_name: newTitle
    }));
  };

  // 저장/이동 시에만 routineData에 반영
  const handleAddWorkOut = () => {
    nav("/routine/add");
  };

  const list = routineData.list;

  // setRoutineData를 useCallback으로 감싸서 전달 (불필요한 리렌더 방지)
  const memoSetRoutineData = useCallback(setRoutineData, []);

  return (
    <Wrapper>
      <H3Input
        type="text"
        value={routineData.routine_name || ''}
        onChange={handleTitleChange}
        placeholder="루틴 제목을 입력하세요"
      />
      <div>
        {list.map((data) =>
          <WorkoutSet
            key={data.pt_idx}
            data={data}
            setRoutineData={memoSetRoutineData}
            routineData={routineData}
          />
        )}
      </div>
      <AddButton type="button" onClick={handleAddWorkOut}>운동 추가하기 +</AddButton>
    </Wrapper>
  );
};

export default RoutineSet;