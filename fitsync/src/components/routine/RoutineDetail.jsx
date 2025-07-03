import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SwipeableList, SwipeableListItem, SwipeAction, TrailingActions } from 'react-swipeable-list';
import styled from 'styled-components';

const WorkoutSetWrapper = styled.div`
  padding: 15px;
  h3{
    font-size: 3rem;
    border-bottom: 1px solid #ccc;
    padding-bottom: 10px;
    margin-bottom: 10px;
  }
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
  width:100%;
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
    font-size: 1.8rem;
  } 
  .swipeable-list-item__content > input {
    flex:3;
    width:100%;
    padding: 5px 0;
    text-indent: 15px;
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

const RoutineTop = styled.div`
`;



const RoutineDetail = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { routine_list_idx } = useParams();
 
  useEffect(() => {
    console.log(" data", data)
  },[data]);
  
  useEffect(() => {
    const handleRoutineData = async () => {
      try {
        const response = await axios.get(`/routine/${routine_list_idx}`, {
          withCredentials: true
        });
        const routineData = response.data;
        if (routineData.success) {
          setData(routineData.vo);
        } else {
          alert(routineData.message);
        }
      } catch (e) {
        alert("루틴 정보를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    handleRoutineData();
  }, [routine_list_idx]);


  // 세트 값 변경 공통 함수
  const handleSetValueChange = (routinePtIdx, index, field, value) => {
    setData(prev => ({
      ...prev,
      routines: prev.routines.map(r =>
        r.pt_idx === routinePtIdx ? {
          ...r,
          sets: r.sets.map((s, i) =>
            i === index ? { ...s, [field]: value } : s
          )
        }
          : r
      )
    }));
  };

  // 세트 삭제
  const handleDeleteSet = (routinePtIdx, setId) => {
    setData(prev => ({
      ...prev,
      routines: prev.routines.map(r =>
        r.pt_idx === routinePtIdx
          ? {
              ...r,
              sets: r.sets.filter(set => set.id !== setId)
            }
          : r
      )
    }));
  };

  // trailingActions에서 삭제 시 handleDeleteSet 호출
  const trailingActions = (routinePtIdx, setId) => (
    <TrailingActions>
      <SwipeAction
        destructive={true}
        onClick={() => handleDeleteSet(routinePtIdx, setId)}
      >
        삭제
      </SwipeAction>
    </TrailingActions>
  );

  // 세트 추가 함수 (특정 routine에 세트 추가)
  const handleAddSet = (routinePtIdx) => {
    setData(prev => ({
      ...prev,
      routines: prev.routines.map(r =>
        r.pt_idx === routinePtIdx
          ? {
              ...r,
              sets: [
                ...r.sets,
                { id: Date.now(), set_volume: '', set_count: '' }
              ]
            }
          : r
      )
    }));
  };

  // 로딩 처리
  if (isLoading || !data) return <div>로딩중...</div>;

  return (
    <WorkoutSetWrapper>
      <RoutineTop>
        <h3>{data.routine_name}</h3>
      </RoutineTop>
      {data.routines && data.routines.map((routine) => (
        <div key={routine.pt_idx} >
          <SetTop>
            <img src={routine.imageUrl} alt="" />
            <h4>{routine.pt.pt_name}</h4>
          </SetTop>
          <MemoInput
            name="memo"
            type="text"
            placeholder="루틴에 대한 메모를 적성해주세요."
            value={routine.routine_memo || ""}
            readOnly
          />
          <ListHeader>
            <div>번호</div>
            <div>KG</div>
            <div>횟수</div>
            <div>완료</div>
          </ListHeader>
          <ListBody>
            <SwipeableList actionDelay={0}>
              {routine.sets && routine.sets.map((set, index) => (
                <SwipeableListItem
                  key={set.id}
                  trailingActions={trailingActions(routine.pt_idx, set.id)}
                >
                  <div>{index + 1}</div>
                  <input
                    type="number"
                    value={set.set_volume}
                    onChange={e =>
                      handleSetValueChange(routine.pt_idx, index, 'set_volume', e.target.value)
                    }
                  />
                  <input
                    type="number"
                    value={set.set_count}
                    onChange={e =>
                      handleSetValueChange(routine.pt_idx, index, 'set_count', e.target.value)
                    }
                  />
                  <div>
                    <input type="checkbox" name="" id="" />
                  </div>
                </SwipeableListItem>
              ))}
            </SwipeableList>
            <SetAddCTA type="button" onClick={() => handleAddSet(routine.pt_idx)}>
              세트 추가 +
            </SetAddCTA>
          </ListBody>
        </div>
      ))}
    </WorkoutSetWrapper>
  );
};

export default RoutineDetail;