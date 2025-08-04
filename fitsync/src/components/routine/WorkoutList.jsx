import React from 'react';
import WorkoutName from './WorkoutName';
import styled from 'styled-components';

const ListWrapper = styled.div`
  border: 1px solid var(--border-light);
  margin-bottom: 3rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
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