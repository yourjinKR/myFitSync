import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import WorkoutSet from './WorkoutSet';
import styled from 'styled-components';
import { useDebounce } from 'use-debounce';

// RoutineDetail 스타일 참고
const WorkoutSetWrapper = styled.div`
  padding: 20px;
  background: var(--bg-primary);
  min-height: 100vh;
`;

const RoutineTop = styled.div`
  margin-bottom: 24px;
`;

// 스타일 개선된 루틴 제목 입력란
const RoutineTitleInput = styled.input`
  font-size: 2.4rem;
  color: var(--text-primary);
  border: none;
  border-bottom: 1px solid var(--border-light);
  margin-bottom: 20px;
  font-weight: 600;
  background: transparent;
  width: 100%;
  outline: none;
  transition: border-color 0.2s;
  border-radius: 0;
  padding-left: 0;

  &::placeholder {
    color: var(--text-tertiary);
    font-weight: 400;
    opacity: 0.8;
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

// 디바운스 적용된 입력 컴포넌트
const RoutineTitleInputBox = React.memo(({ value, onChange }) => {
  const [localValue, setLocalValue] = useState(value || "");
  const [debouncedValue] = useDebounce(localValue, 300);

  // value prop이 바뀌면 localValue도 동기화
  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  // 로컬 상태 변경 처리
  const handleLocalChange = (e) => {
    setLocalValue(e.target.value);
  };

  // 디바운스된 값이 바뀔 때만 부모 컴포넌트에 알림
  useEffect(() => {
    if (debouncedValue !== value) {
      onChange({ target: { value: debouncedValue } });
    }
  }, [debouncedValue, onChange, value]);

  return (
    <RoutineTitleInput
      type="text"
      value={localValue}
      onChange={handleLocalChange}
      placeholder="루틴명 입력"
      autoComplete="off"
    />
  );
});


const RoutineSet = () => {
  const nav = useNavigate();
  const { routineData, setRoutineData } = useOutletContext();

  useEffect(() => {
    if (routineData.routines.length === 0) {
      nav("/routine/add");
    }
  }, [routineData.routines.length, nav]);

  const handleTitleChange = (e) => {
    setRoutineData(prevData => ({
      ...prevData,
      routine_name: e.target.value
    }));
  };

  const handleAddWorkOut = () => {
    nav("/routine/add");
  };

  const list = routineData.routines;
  const memoSetRoutineData = useCallback(setRoutineData, []);

  // 루틴 제목 변경 핸들러
  const handleRoutineTitle = useCallback((e) => {
    setRoutineData(prev => ({
      ...prev,
      routine_name: e.target.value
    }));
  }, [setRoutineData]);

  return (
    <WorkoutSetWrapper>
      <RoutineTop>
        <RoutineTitleInputBox value={routineData.routine_name || ""} onChange={handleRoutineTitle} />
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
    </WorkoutSetWrapper>
  );
};

export default RoutineSet;