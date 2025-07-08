import axios from 'axios';
import React, { use, useEffect, useRef, useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { SwipeableList, SwipeableListItem, SwipeAction, TrailingActions } from 'react-swipeable-list';
import styled from 'styled-components';
import { CheckInput, Checklabel } from '../../styles/commonStyle';

const WorkoutSetWrapper = styled.div`
  padding: 20px;
  background: var(--bg-primary);

  h3 {
    font-size: 2.4rem;
    color: var(--text-primary);
    border-bottom: 1px solid var(--border-light);
    padding-bottom: 12px;
    margin-bottom: 20px;
    font-weight: 600;
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
  border-bottom: 1px solid var(--border-light);
  
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
    flex: 1;
    font-size: 1.6rem;
    font-weight: 600;
    text-align: center;
    padding: 12px 0;
    color: var(--text-primary);
  }
`;
const ListBody = styled.div`
  background: var(--bg-secondary);
  
  .swipeable-list-item:nth-child(2n) {
    background: var(--bg-tertiary);
  }

  .swipeable-list-item.checked{
    background: var(--success);
    color: var(--text-primary);
  }
    
  .swipeable-list-item__content {
    width: 100%;
    display: flex;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid var(--border-light);
  }
  
  .swipeable-list-item__content > div {
    flex: 1;
    text-align: center;
    font-size: 1.8rem;
    color: var(--text-primary);
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
  } 
  
  .swipeable-list-item__content > div > input {
    width: 100%;
    padding: 8px 0;
    text-align: center;
    font-size: 1.8rem;
    background: transparent;
    color: var(--text-primary);
    border: none;
    outline: none;
    text-indent: 2rem;
    
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
    color: #ffffff;
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
  color: #ffffff;
  border: none;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:active {
    background: var(--primary-blue-hover);
    transform: scale(0.98);
  }
`;

const RoutineTop = styled.div`
  margin-bottom: 24px;
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: var(--bg-primary);
  font-size: 1.8rem;
  color: var(--text-secondary);
`;

const RoutineDetail = () => {
  const [init, setInit] = useState(null);
  const [data, setData] = useState(init);
  const [isLoading, setIsLoading] = useState(true);
  const { routine_list_idx } = useParams();
  const { setNewData } = useOutletContext();
  
  // checked 필드를 제거한 새로운 객체 반환
  const omitChecked = (obj) => {
    if (!obj || !obj.routines) return obj;
    return {
      ...obj,
      routines: obj.routines.map(routine => ({
        ...routine,
        sets: routine.sets.map(({ checked, ...setRest }) => setRest)
      }))
    };
  };

  useEffect(() => {
    setNewData({
      ...data,
      update: JSON.stringify(omitChecked(data)) !== JSON.stringify(omitChecked(init)),
    });
  }, [data]);
  
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
                  routins_idx : r.routine_idx,
                  set_num : r.sets.length + 1,
                  set_volume: 0, 
                  set_count: 0,
                  id: `${routinePtIdx}-${r.sets.length}-${Date.now()}`, 
                }
              ]
            }
          : r
      )
    }));
  };

  const checkedSetsRef = useRef({}); // { 'pt_idx-setIndex': true/false, ... }

  useEffect(() => {
    // data.routines가 바뀔 때마다 체크 상태 초기화
    if (data && data.routines) {
      const newChecked = {};
      data.routines.forEach(routine => {
        routine.sets.forEach((set, idx) => {
          const key = `${routine.pt_idx}-${idx}`;
          newChecked[key] = checkedSetsRef.current[key] || false;
        });
      });
      checkedSetsRef.current = newChecked;
    }
  }, [data]);

  const handleSetCheck = (routinePtIdx, setIndex) => (e) => {
    const key = `${routinePtIdx}-${setIndex}`;
    checkedSetsRef.current[key] = e.target.checked;
    setData(
      prev => ({ 
        ...prev,
        routines: prev.routines.map(r =>
          r.pt_idx === routinePtIdx
            ? {
                ...r,
                sets: r.sets.map((set, idx) =>
                  idx === setIndex ? { ...set, checked: e.target.checked } : set
                )
              }
            : r
        )
      })
    );
  };

  // 로딩 처리
  if (isLoading || !data) {
    return (
      <LoadingWrapper>
        로딩중...
      </LoadingWrapper>
    );
  }

  return (
    <WorkoutSetWrapper>
      <RoutineTop>
        <h3>{data.routine_name}</h3>
      </RoutineTop>
      {data.routines && data.routines.map((routine) => (
        <ExerciseSection key={routine.pt_idx}>
          <SetTop>
            <img src={routine.imageUrl} alt={routine.pt.pt_name} />
            <h4>{routine.pt.pt_name}</h4>
          </SetTop>
          <MemoInput
            name="memo"
            type="text"
            placeholder="루틴에 대한 메모를 작성해주세요."
            value={routine.routine_memo || ""}
            onChange={e => {
              const value = e.target.value;
              setData(prev => ({
                ...prev,
                routines: prev.routines.map(r =>
                  r.pt_idx === routine.pt_idx
                    ? { ...r, routine_memo: value }
                    : r
                )
              }));
            }}
          />
          <ListHeader>
            <div>번호</div>
            <div>KG</div>
            <div>횟수</div>
            <div>완료</div>
          </ListHeader>
          <ListBody>
            <SwipeableList actionDelay={0}>
              {routine.sets && routine.sets.map((set, index) => {
                const key = `${routine.pt_idx}-${index}`;
                return (
                  <SwipeableListItem className={checkedSetsRef.current[key] ? 'checked' : ''}
                    key={`${routine.pt_idx}-${index}-${set.id}`}
                    trailingActions={trailingActions(routine.pt_idx, index)}
                  >
                    <div>{index + 1}</div>
                    <div>
                      <input
                        type="number"
                        value={set.set_volume || ''}
                        placeholder="0"
                        onChange={e =>
                          handleSetValueChange(routine.pt_idx, index, 'set_volume', e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={set.set_count || ''}
                        placeholder="0"
                        onChange={e =>
                          handleSetValueChange(routine.pt_idx, index, 'set_count', e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <CheckInput
                        type="checkbox"
                        id={`set-check-${routine.pt_idx}-${index}`}
                        checked={checkedSetsRef.current[key] || false}
                        onChange={handleSetCheck(routine.pt_idx, index)}
                      />
                      <Checklabel htmlFor={`set-check-${routine.pt_idx}-${index}`}>
                        <span className="visually-hidden">세트 완료 체크</span>
                      </Checklabel>
                    </div>
                  </SwipeableListItem>
                );
              })}
            </SwipeableList>
            <SetAddCTA type="button" onClick={() => handleAddSet(routine.pt_idx)}>
              세트 추가 +
            </SetAddCTA>
          </ListBody>
        </ExerciseSection>
      ))}
    </WorkoutSetWrapper>
  );
};

export default RoutineDetail;