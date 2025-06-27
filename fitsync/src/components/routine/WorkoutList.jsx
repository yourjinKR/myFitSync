import React, { useEffect, useState } from 'react';
import WorkoutName from './WorkoutName';
import styled from 'styled-components';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';

const ListWrapper = styled.div`
  border:1px solid #ccc;
  border-bottom:0px;
`;


const WorkoutList = ({list}) => {

  const { routineData, setRoutineData } = useOutletContext();
  
  return (
    <ListWrapper>
      {
        list.map((workout, idx) => (
          <WorkoutName
            key={workout.idx || idx}
            routineData={routineData}
            setRoutineData={setRoutineData}
            data={workout}
          />
        ))
      }
    </ListWrapper>
  );
};

export default WorkoutList;