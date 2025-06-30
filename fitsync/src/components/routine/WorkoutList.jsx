import React from 'react';
import WorkoutName from './WorkoutName';
import styled from 'styled-components';

const ListWrapper = styled.div`
  border:1px solid #ccc;
  border-bottom:0px;
  margin-bottom: 50px;
`;


const WorkoutList = ({routineData, setRoutineData, list}) => {
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

export default React.memo(WorkoutList);