import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
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
    flex: 4;
    font-size: 1.8rem;
    font-weight:bold;
    text-align:center;
  }
  div:first-child{
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
    flex:4;
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
  const [init, setInit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { routine_list_idx } = useParams();
  const { setNewData } = useOutletContext();
  
  useEffect(() => {
    if(init !== data){
      setNewData(data);
    }
  },[data]);
  
  // 데이터 로드 시 고유 ID 생성
  useEffect(() => {
    const handleRoutineData = async () => {
      try {
        const response = await axios.get(`/routine/${routine_list_idx}`, {
          withCredentials: true
        });
        const routineData = response.data;
        if (routineData.success) {
          // 각 세트에 고유 ID 추가
          const dataWithIds = {
            ...routineData.vo,
            routines: routineData.vo.routines.map(routine => ({
              ...routine,
              sets: routine.sets.map((set, index) => ({
                ...set,
                id: set.id || `${routine.pt_idx}-${index}-${Date.now()}`
              }))
            }))
          };
          setData(dataWithIds);
          setInit(dataWithIds);
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

  // 세트 삭제 - setId 대신 setIndex 사용
  const handleDeleteSet = (routinePtIdx, setIndex) => {
    console.log('삭제 요청:', { routinePtIdx, setIndex });
    
    setData(prev => ({
      ...prev,
      routines: prev.routines.map(r =>
        r.pt_idx === routinePtIdx
          ? {
              ...r,
              sets: r.sets.filter((set, index) => index !== setIndex)
            }
          : r
      )
    }));
  };

  // trailingActions - setIndex 전달
  const trailingActions = (routinePtIdx, setIndex) => (
    <TrailingActions>
      <SwipeAction
        destructive={true}
        onClick={() => handleDeleteSet(routinePtIdx, setIndex)}
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
                { 
                  id: `${routinePtIdx}-${r.sets.length}-${Date.now()}`, 
                  set_volume: '', 
                  set_count: '' 
                }
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
          </ListHeader>
          <ListBody>
            <SwipeableList actionDelay={0}>
              {routine.sets && routine.sets.map((set, index) => (
                <SwipeableListItem
                  key={`${routine.pt_idx}-${index}-${set.id}`} // 더 안정적인 key
                  trailingActions={trailingActions(routine.pt_idx, index)}
                >
                  <div>{index + 1}</div> {/* 이 부분이 자동으로 업데이트됨 */}
                  <input
                    type="number"
                    value={set.set_volume || ''}
                    onChange={e =>
                      handleSetValueChange(routine.pt_idx, index, 'set_volume', e.target.value)
                    }
                  />
                  <input
                    type="number"
                    value={set.set_count || ''}
                    onChange={e =>
                      handleSetValueChange(routine.pt_idx, index, 'set_count', e.target.value)
                    }
                  />
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