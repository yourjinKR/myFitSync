import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import MuscleGroup from './MuscleGroup';

const FilterWrapper = styled.div`
  position:absolute;
  bottom:0;
  left:0;
  width:100%;
  z-index:1001;
  height:0;
  display:flex;
  align-items:flex-end;
  transition:0.25s ease;
  overflow:hidden;
  h3 {
    text-align:center;
    font-size:1.8rem;
  }
  &.on {
    height:100%;
  }
`;
const FilterInner = styled.div`
  padding:15px;
  background:#d9d9d9;
  height:70%;
  width: 100%;
  border-radius:10px;
`;

const MuscleList = styled.div`
  border: 1px solid #ccc;
  margin-top:10px;
  background:#fff;
  border-radius:10px;
  height:92%;
  overflow-x:hidden;
  overflow-y:auto;
`;


const WorkoutFilter = ({filterRef}) => {

  const [muscle, setMuscle] = useState(0);
  
  useEffect(() => {
    filterRef.current.classList.remove("on");
  },[filterRef, muscle]);

  const handleFilter = (e) => {
    if (e.target === e.currentTarget) {
      filterRef.current.classList.remove("on");
    }
  }
 
  return (
    <FilterWrapper onClick={handleFilter} ref={filterRef}>
      <FilterInner>
        <h3>근육 그룹</h3>
        <MuscleList>
          <MuscleGroup muscle={muscle} setMuscle={setMuscle} idx={0}/>
          <MuscleGroup muscle={muscle} setMuscle={setMuscle} idx={1}/>
          <MuscleGroup muscle={muscle} setMuscle={setMuscle} idx={2}/>
          <MuscleGroup muscle={muscle} setMuscle={setMuscle} idx={3}/>
          <MuscleGroup muscle={muscle} setMuscle={setMuscle} idx={4}/>
          <MuscleGroup muscle={muscle} setMuscle={setMuscle} idx={5}/>
          <MuscleGroup muscle={muscle} setMuscle={setMuscle} idx={6}/>
          <MuscleGroup muscle={muscle} setMuscle={setMuscle} idx={7}/>
        </MuscleList>
      </FilterInner>
    </FilterWrapper>
  );
};

export default WorkoutFilter;