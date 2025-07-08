import React from 'react';
import WorkoutName from './WorkoutName';
import styled from 'styled-components';

const ListWrapper = styled.div`
  border: 1px solid var(--border-light);
  border-bottom: 0;
  margin-bottom: 50px;
  background: var(--bg-secondary);
  border-radius: 12px;
  overflow: hidden;
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