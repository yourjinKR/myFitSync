import React, { useEffect } from 'react';
import styled from 'styled-components';
import {
  SwipeableList,
  SwipeableListItem,
  TrailingActions,
  SwipeAction,
} from 'react-swipeable-list';
import 'react-swipeable-list/dist/styles.css';

const WorkoutSetWrapper = styled.div`
  padding: 0;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-light);
  overflow: hidden;
`;

const SetTop = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);
  h4 {
    font-size: 1.8rem;
    color: var(--text-primary);
    font-weight: 500;
  }
  img {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 2px solid var(--border-medium);
    object-fit: cover;
  }
`;
const MemoInput = styled.input`
  padding: 16px 20px;
  font-size: 1.6rem;
  width: 100%;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: none;
  &::placeholder {
    color: var(--text-tertiary);
  }
  &:focus {
    background: var(--bg-primary);
    outline: none;
  }
`;
const ListHeader = styled.div`
  display: flex;
  width: 100%;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-light);
  div {
    flex: 2;
    font-size: 1.6rem;
    font-weight: 600;
    text-align: center;
    padding: 12px 8px;
    color: var(--text-primary);
  }
  div:first-child {
    flex: 1;
  }
`;
const ListBody = styled.div`
  background: var(--bg-secondary);

  .swipeable-list-item:nth-child(2n) {
    background: var(--bg-tertiary);
  }
  .swipeable-list-item__content {
    width: 100%;
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--border-light);
  }
  .swipeable-list-item__content > div {
    flex: 2;
    text-align: center;
    font-size: 1.6rem;
    color: var(--text-primary);
    font-weight: 500;
    height: 100%;
    min-height: 30px;
    padding: 12px 8px;
  }
  .swipeable-list-item__content > div:first-child {
    flex: 1;
  }
    
  .swipeable-list-item__content > input {
    flex: 2;
    width: 100%;
    padding: 12px 8px;
    text-align: center;
    font-size: 1.6rem;
    background: transparent;
    color: var(--text-primary);
    border: none;
    height: 48px;
    outline: none;
    &:focus {
      background: var(--bg-primary);
      border-radius: 4px;
    }
    &::placeholder {
      color: var(--text-tertiary);
    }
  }
  .swipe-action__trailing {
    background: var(--error);
    color: #fff;
    font-weight: 600;
    font-size: 1.4rem;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    &:active {
      background: #d32f2f;
    }
  }
  .swipeable-list-item__trailing-actions {
    max-width: 75px;
  }
`;

const SetAddCTA = styled.button`
  width: 100%;
  font-size: 1.6rem;
  padding: 16px 0;
  background: var(--primary-blue);
  color: #fff;
  border: none;
  font-weight: 500;
  border-radius: 0 0 12px 12px;
  transition: all 0.2s ease;
  cursor: pointer;
  margin: 0;
  box-shadow: none;
  &:active {
    background: var(--primary-blue-hover);
    transform: scale(0.98);
  }
`;

// 공통적으로 list의 특정 운동의 sets 변경하는 함수
function updateSets(routineData, pt_idx, updateFn) {
  return {
    ...routineData,
    routines: routineData.routines.map(item => {
      return item.pt_idx === pt_idx
        	? { ...item, sets: updateFn(item.sets) }
        	: item
    })
  };
}

const WorkoutSet = ({ data, routineData, setRoutineData }) => {
 
  const setData = routineData.routines.find((item) => item.pt_idx === data.pt_idx);

  // 세트 추가
  const handleAddSet = () => {
    setRoutineData(prev =>
      updateSets(prev, data.pt_idx, sets => [
        ...sets,
        { id: Date.now(), set_volume: '', set_count: '' }
      ])
    );
  };

  // 세트 값 변경
  const handleSetChange = (setId, field, value) => {
    setRoutineData(prev =>
      updateSets(prev, data.pt_idx, sets =>
        sets.map(set =>
          set.id === setId ? { ...set, [field]: value } : set
        )
      )
    );
  };
  const handleChangeMemo = (e) => {
    const memo = e.target.value;
    setRoutineData(prev =>
      ({
        ...prev,
        routines: prev.routines.map(item =>
          item.pt_idx === data.pt_idx
            ? { ...item, routine_memo: memo }
            : item
        )
      })
    );
  };

  // 세트 삭제
  const trailingActions = (targetId) => (
    <TrailingActions>
      <SwipeAction
        destructive={true}
        onClick={() => {
          setRoutineData(prev =>
            updateSets(prev, data.pt_idx, sets =>
              sets.filter(set => set.id !== targetId)
            )
          );
        }}
      >
        삭제
      </SwipeAction>
    </TrailingActions>
  );

  // 최초 1세트 없으면 1개 추가
  useEffect(() => {
    if (setData && (!setData.sets || setData.sets.length === 0)) {
      setRoutineData(prev =>
        updateSets(prev, data.pt_idx, () => [{ id: Date.now(), set_volume: '', set_count: '' }])
      );
    }
    // eslint-disable-next-line
  }, []);

  // setData가 없거나 sets이 없는 경우 처리
  if (!setData) {
    return null;
  }

  // sets이 없는 경우 빈 배열로 처리
  const sets = setData.sets || [];

  return (
    <WorkoutSetWrapper>
      <SetTop>
        <img src={data.pt.pt_image.split(",").filter((item) => item.includes(".png"))} alt={data.pt_name}/>
        <h4>{data.pt.pt_name}</h4>
      </SetTop>
      <MemoInput
        name="memo"
        type="text"
        placeholder="루틴에 대한 메모를 적성해주세요."
        value={data.routine_memo}
        onChange={handleChangeMemo}
      />
      <ListHeader>
        <div>번호</div>
        <div>KG</div>
        <div>횟수</div>
      </ListHeader>
      <ListBody>
        <SwipeableList actionDelay={0}>
          {sets.map((set, index) => (
            <SwipeableListItem
              key={set.id}
              trailingActions={trailingActions(set.id)}
            >
              <div>{index + 1}</div>
              <input
                type="number"
                value={set.set_volume}
                onChange={e => handleSetChange(set.id, 'set_volume', e.target.value)}
                placeholder="-"
              />
              <input
                type="number"
                value={set.set_count}
                onChange={e => handleSetChange(set.id, 'set_count', e.target.value)}
                placeholder="-"
              />
              <div></div>
            </SwipeableListItem>
          ))}
        </SwipeableList>
        <SetAddCTA type="button" onClick={handleAddSet}>세트 추가 +</SetAddCTA>
      </ListBody>
    </WorkoutSetWrapper>
  );
};

export default React.memo(WorkoutSet);
