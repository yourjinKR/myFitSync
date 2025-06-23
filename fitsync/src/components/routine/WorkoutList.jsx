import React from 'react';
import WorkoutName from './WorkoutName';
import styled from 'styled-components';
import { useOutletContext } from 'react-router-dom';

const ListWrapper = styled.div`
  border:1px solid #ccc;
  border-bottom:0px;
`;


const WorkoutList = () => {
  const { routineData, setRoutineData } = useOutletContext();
  
  return (
    <ListWrapper>
      <WorkoutName routineData={routineData} setRoutineData={setRoutineData} idx={1}/>
      <WorkoutName routineData={routineData} setRoutineData={setRoutineData} idx={2}/>
      <WorkoutName routineData={routineData} setRoutineData={setRoutineData} idx={3}/>
      <WorkoutName routineData={routineData} setRoutineData={setRoutineData} idx={4}/>
      <WorkoutName routineData={routineData} setRoutineData={setRoutineData} idx={5}/>
      <WorkoutName routineData={routineData} setRoutineData={setRoutineData} idx={6}/>
    </ListWrapper>
  );
};

export default WorkoutList;