import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import WorkoutSet from './WorkoutSet';
import styled from 'styled-components';

const Wrapper = styled.div`
  margin: 0 auto;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  padding: 0 15px 18px 15px; /* 좌우 15px, 아래 18px */
`;

const H3 = styled.h3`
  font-size: 1.8rem;
  font-weight: 700;
  padding: 14px 0 10px 0; /* 좌우 여백 제거 */
  border-bottom: 1px solid #e6e6e6;
  margin-bottom: 0;
  background: #f7f9fc;
  border-radius: 14px 14px 0 0;
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
  if(routineData.list.length === 0){
    nav("/routine/add");
  }
  
  const list = routineData.list;

  const handleAddWorkOut = () => {
    nav("/routine/add");
  }

  return (
    <Wrapper>
      <H3>{routineData.name}</H3>
      <div>
        {list.map((data) =>
          <WorkoutSet key={data.value} data={data} routineData={routineData} setRoutineData={setRoutineData}/>
        )}
      </div>
      <AddButton type="button" onClick={handleAddWorkOut}>운동 추가하기 +</AddButton>
    </Wrapper>
  );
};

export default RoutineSet;