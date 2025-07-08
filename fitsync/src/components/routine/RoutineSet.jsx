import React, { useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import WorkoutSet from './WorkoutSet';
import styled from 'styled-components';

// RoutineDetail 스타일 참고
const WorkoutSetWrapper = styled.div`
  padding: 20px;
  background: var(--bg-primary);
  min-height: 100vh;
`;

const RoutineTop = styled.div`
  margin-bottom: 24px;
`;

const H3Input = styled.input`
  font-size: 2.4rem;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-light);
  padding-bottom: 12px;
  margin-bottom: 20px;
  font-weight: 600;
  background: transparent;
  border: none;
  outline: none;
  width: 100%;
  &::placeholder {
    color: var(--text-tertiary);
    font-weight: 400;
  }
`;

const ExerciseSection = styled.div`
  margin-bottom: 32px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-light);
  transition: all 0.2s ease;
  overflow: hidden;
  &:active {
    border-color: var(--border-medium);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }
`;

const AddButton = styled.button`
  width: 100%;
  font-size: 1.6rem;
  padding: 16px 0;
  background: var(--primary-blue);
  color: #fff;
  border: none;
  font-weight: 500;
  border-radius: 5px;
  transition: all 0.2s ease;
  cursor: pointer;
  margin: 0; /* 카드와 버튼 사이 간격 제거 */
  box-shadow: none;
  &:active {
    background: var(--primary-blue-hover);
    transform: scale(0.98);
  }
`;

const RoutineSet = () => {
  const nav = useNavigate();
  const { routineData, setRoutineData, isSave } = useOutletContext();

  useEffect(() => {
    if (!isSave && routineData.list.length === 0) {
      nav("/routine/add");
    }
  }, [routineData.list.length, nav]);

  const handleTitleChange = (e) => {
    setRoutineData(prevData => ({
      ...prevData,
      routine_name: e.target.value
    }));
  };

  const handleAddWorkOut = () => {
    nav("/routine/add");
  };

  const list = routineData.list;
  const memoSetRoutineData = useCallback(setRoutineData, []);

  return (
    <WorkoutSetWrapper>
      <RoutineTop>
        <H3Input
          type="text"
          value={routineData.routine_name || ''}
          onChange={handleTitleChange}
          placeholder="루틴 제목을 입력하세요"
        />
      </RoutineTop>
      {list.map((data, idx) =>
        <ExerciseSection key={data.pt_idx}>
          <WorkoutSet
            data={data}
            setRoutineData={memoSetRoutineData}
            routineData={routineData}
          />
        </ExerciseSection>
      )}
      <AddButton type="button" onClick={handleAddWorkOut}>
        운동 추가하기 +
      </AddButton>
    </WorkoutSetWrapper>
  );
};

export default RoutineSet;