import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  SwipeableList,
  SwipeableListItem,
  TrailingActions,
  SwipeAction,
} from 'react-swipeable-list';
import 'react-swipeable-list/dist/styles.css';

const WorkoutSetWrapper = styled.div`
  padding: 15px;
  border-bottom: 1px solid #ccc;
`;

const SetTop = styled.div`
  display:flex;
  align-items:center;
  gap: 15px;
  h4{
    font-size:1.8rem;
  }
  
  img {
    width:50px;
    height:50px;
    border-radius:50%;
    border:1px solid #ccc;
  }
`;
const MemoInput = styled.input`
  padding: 5px 0;
  font-size: 1.8rem;
`;
const ListHeader = styled.div`
  display:flex;
  width:100%;
  div { 
    flex: 3;
    font-size: 1.8rem;
    font-weight:bold;
    text-align:center;
  }
  div:first-child, div:last-child{
    flex: 2;
  }
`;
const ListBody = styled.div`
  .swipeable-list-item:nth-child(2n){
    background:#d9d9d9;
  }
  .swipeable-list-item__content{
    width:100%;
  }
  .swipeable-list-item__content > div {
    flex:2;
    text-align:center;
    font-size: 1.8rem;Z
  } 
  .swipeable-list-item__content > input {
    flex:3;
    width:100%;
    padding:5px;
    text-align:center;
    font-size: 1.8rem;
    background:none;
  } 
  .swipe-action__trailing{
    background:#f00;
    color:#fff;
    font-weight:bold;
    font-size:1.4rem;
    width:100%;
    display:flex;
    align-items:center;
    justify-content:center;
  }
  .swipeable-list-item__trailing-actions{
    max-width:75px;
  }
`;

const SetAddCTA = styled.button`
  width:100%; 
  font-size: 1.8rem;
  padding:15px 0;
`;

// 공통적으로 list의 특정 운동의 routineSet 변경하는 함수
function updateSets(routineData, pt_idx, updateFn) {
  return {
    ...routineData,
    list: routineData.list.map(item =>
      item.pt_idx === pt_idx
        ? { ...item, routineSet: updateFn(item.routineSet) }
        : item
    )
  };
}

const WorkoutSet = ({ data, routineData, setRoutineData }) => {
  const setData = routineData.list.find((item) => item.pt_idx === data.pt_idx);

  // 세트 추가
  const handleAddSet = () => {
    setRoutineData(prev =>
      updateSets(prev, data.pt_idx, routineSet => [
        ...routineSet,
        { id: Date.now(), set_kg: '', set_count: '' }
      ])
    );
  };

  // 세트 값 변경
  const handleSetChange = (setId, field, value) => {
    setRoutineData(prev =>
      updateSets(prev, data.pt_idx, routineSet =>
        routineSet.map(set =>
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
        list: prev.list.map(item =>
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
            updateSets(prev, data.pt_idx, routineSet =>
              routineSet.filter(set => set.id !== targetId)
            )
          );
        }}
      >
        삭제
      </SwipeAction>
    </TrailingActions>
  );

  // 최초 1세트 없으면 1개 추가
  React.useEffect(() => {
    if (setData && setData.routineSet.length === 0) {
      setRoutineData(prev =>
        updateSets(prev, data.pt_idx, () => [{ id: Date.now(), set_kg: '', set_count: '' }])
      );
    }
    // eslint-disable-next-line
  }, []);

  return (
    <WorkoutSetWrapper>
      <SetTop>
        <img src="" alt="" />
        <h4>{data.name}</h4>
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
        <div></div>
      </ListHeader>
      <ListBody>
        <SwipeableList actionDelay={0}>
          {setData.routineSet.map((set, index) => (
            <SwipeableListItem
              key={set.id}
              trailingActions={trailingActions(set.id)}
            >
              <div>{index + 1}</div>
              <input
                type="number"
                value={set.set_kg}
                onChange={e => handleSetChange(set.id, 'set_kg', e.target.value)}
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

export default WorkoutSet;
