import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useOutletContext, useParams } from 'react-router-dom';
import { SwipeableList, SwipeableListItem, SwipeAction, TrailingActions } from 'react-swipeable-list';
import styled from 'styled-components';
import { CheckInput, Checklabel } from '../../styles/commonStyle';
import AlarmIcon from '@mui/icons-material/Alarm';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOn';
import Timer from '../Timer';
import dateFormat from '../../utils/dateFormat';
const { formatDate, getTimeDifference } = dateFormat;

const WorkoutSetWrapper = styled.div`
  padding: 20px;
  background: var(--bg-primary);
  height: 100%;

  h3 {
    font-size: 2.4rem;
    color: var(--text-primary);
    font-weight: 600;
    height: 30px;
    line-height: 30px;
    width: calc(100% - 100px);
  }
  .imgBox{
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 80%;
    img {
      width: 50%;
    }
  }
`;
const ExerciseSection = styled.div`
  position: relative;
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
  &:last-child {
    margin-bottom: 0;
  }
  
  & > button > svg { 
    width: 24px;
    height: 24px;
    background: var(--border-dark);
    border-radius: 50%;
    path { 
      color : var(--bg-secondary);
    };
  }


  @keyframes editing {
    0%, 50%, 100% {
      transform: rotate(0deg);
    }
    25%{
      transform: rotate(0.3deg);
    }
    75% {
      transform: rotate(-0.3deg);
    }
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

    svg {
      width: 24px;
      height: 24px;
      color: var(--text-secondary);
    }
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

const DeleteCTA = styled.button`
  position: absolute;
  width: 30px;
  height: 30px;
  top: 10px;
  right: 10px;
`;

const RoutineTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-light);
  input {
    font-size: 2.4rem;
    color: var(--text-primary);
    font-weight: 600;
    height: 30px;
    line-height: 1.5;
    width: calc(100% - 100px);
    padding: 0;
  }
`;

const EditCTA = styled.button`
  display: flex;
  align-items: center;
  font-size: 1.4rem;
  color : var(--text-primary);
  padding: 5px 15px;
  border-radius: 5px;
  height: 30px;
  line-height: 1.5;

  &.edit {
    background: var(--primary-blue);
    color: var(--text-white);
  }

  svg {
    width: 20px;
    height: 20px;
  }

  path {
    font-size: 2rem;
    color: var(--text-primary);
  }
`;

const RoutineTitle = styled.input`
  font-size: 2.4rem;
  border: none;
  background: transparent;
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

const TimerBox = styled.div`
  display:flex;
  justify-content: flex-end;
  align-items: center;
  padding: 5px 10px;
  width: 100%;
  margin:10px 0;
  min-height: 34px;
  
  svg {
    width: 24px;
    height: 24px;
  }
  path {
    color: var(--primary-blue-light);
    font-weight:bold;
  }
`;

const TimerCTA = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--primary-blue-light);
  font-size: 2rem;
  font-weight: bold;
`;


const RoutineDetail = () => {
  const { routineData, setRoutineData, routineInit, isEdit, setIsEdit, init, setInit, handleUpdateData, tempData, setTempData } = useOutletContext();

  const [time, setTime] = useState({
    minutes: 0,
    seconds: 0,
  });
  const [data, setData] = useState(init);
  const [isLoading, setIsLoading] = useState(true);
  const [isTimerShow, setIsTimerShow] = useState(false);
  const { routine_list_idx } = useParams();
  const { setNewData } = useOutletContext();
  const location = useLocation();
  const param = new URLSearchParams(location.search);
  const targetDate = param.get('date');


  // checked 필드와 saveDate, set_num을 제거한 새로운 객체 반환 (비교용)
  const omitCheckedAndSaveDate = (obj) => {
    if (!obj || !obj.routines) {
      console.log("⚠️ omitCheckedAndSaveDate: 객체가 null/undefined 또는 routines가 없음", obj);
      return obj;
    }
    
    const { saveDate, checked, id, update, ...cleanObj } = obj;
    
    return {
      ...cleanObj,
      routines: obj.routines.map(routine => ({
        ...routine,
        sets: routine.sets.map(({ checked, id, set_num, update, ...setRest }) => setRest)
      }))
    };
  };

  // checked 필드를 제거한 새로운 객체 반환
  const omitChecked = (obj) => {
    if (!obj || !obj.routines) return obj;
    return {
      ...obj,
      routines: obj.routines.map(routine => ({
        ...routine,
        sets: routine.sets.map(({ checked, id, set_num, ...setRest }) => setRest)
      }))
    };
  };

  // useEffect - data
  useEffect(() => {
    if (data === null || init === undefined) {
      console.log("⚠️ data 또는 init이 null/undefined:", { data, init });
      return;
    }
    
    // 비교 전 데이터 구조 확인
    const omitData = omitCheckedAndSaveDate(data);
    console.log("🚀 omitData:", omitData);
    console.log("🚀 omitData JSON:", JSON.stringify(omitData));
    
    const omitInit = omitCheckedAndSaveDate(init);
    console.log("🚀 omitInit:", omitInit);
    console.log("🚀 omitInit JSON:", JSON.stringify(omitInit));
    
    const isEqual = JSON.stringify(omitData) === JSON.stringify(omitInit);
    console.log("🚀 isEqual:", isEqual);
    console.log("🚀 JSON 비교:");
    console.log("  data JSON length:", JSON.stringify(omitData)?.length);
    console.log("  init JSON length:", JSON.stringify(omitInit)?.length);
    console.log("====================================================================");
    
    setNewData({
      ...data,
      update: routine_list_idx === 'custom' || !isEqual,
    });

    setRoutineData(data);

    // 자유 운동 저장
    if (routine_list_idx !== null && routine_list_idx === 'custom') {
      const currentDate = data.saveDate === undefined ? formatDate() : data.saveDate;
      
      if (data.routines.length === 0 && (data.saveDate === null || data.saveDate === undefined || data.saveDate === "")) {
        setData(prev => ({
          ...prev,
          saveDate: currentDate
        }));
      }

      // targetDate 파라미터가 있고 데이터가 비어있을 때 기존 데이터 로드
      if (targetDate !== null && data.routines.length === 0 && data.saveDate !== "") {
        const existingData = tempData.find(item => item.saveDate === targetDate);
        if (existingData) {
          setData(existingData);
          return;
        }
      }

      // routine_name이 있고 routines가 있을 때만 저장
      if (data.routines.length !== 0 && data.saveDate !== null && data.saveDate !== "") {
        if(data.routine_name === null || data.routine_name === undefined || data.routine_name === "") {
          setTempData(prev => {
            const existingIndex = prev.findIndex(item => item.saveDate === data.saveDate);
  
            if (existingIndex !== -1) {
              return prev.map((item, index) =>
                index === existingIndex ? data : item
              );
            } else {
              return [...prev, data];
            }
          });
        }
      }
    } else {
      // 일반 루틴에서 체크된 세트 확인
      if (data && data.routines) {
        data.routines.forEach(routine => {
          const checkedSets = routine.sets.filter(set => set.checked === true);
          if (checkedSets.length > 0) {
            // const findData = tempData.find(item => item.routine_list_idx === data.routine_list_idx);
            // const diffDate = getTimeDifference(findData.saveDate);
        
            if(data.saveDate === null || data.saveDate === undefined || data.saveDate === "") {
              setData(prev => ({
                ...prev,
                saveDate : formatDate(),
              }));
            }
            
            
            setTempData(prev => {
              const existingIndex = prev.findIndex(item => item.routine_list_idx === data.routine_list_idx);
              
              // if (diffDate.days > 0 || existingIndex !== -1) {
              if (existingIndex !== -1) {
                return prev.map((item, index) =>
                  index === existingIndex ? data : item
                );
              } else {
                return [...prev, data];
              }
            });
          }
        });
      }
    }
  }, [data, init]); // init도 의존성에 추가
  
  // 데이터 로드 시 고유 ID 생성
  useEffect(() => {
    if (routineData === null) return;
    
    if (routine_list_idx !== 'custom' && JSON.stringify(omitChecked(routineData)) === JSON.stringify(omitChecked(routineInit))) {
      const handleRoutineData = async () => {
        try {
          const response = await axios.get(`/routine/${routine_list_idx}`, {
            withCredentials: true
          });
          const result = response.data;
          if (result.success) {
            // 각 세트에 고유 ID 추가

            const dataWithIds = {
              ...result.vo,
              routines: result.vo.routines.map(routine => ({
                ...routine,
                sets: routine.sets.map((set, index) => ({
                  ...set,
                  id: set.id || `${routine.pt_idx}-${index}-${Date.now()}`
                }))
              }))
            };
            setData(dataWithIds);
            setInit(dataWithIds);
            setRoutineData(dataWithIds);
          } else {
            alert(result.message);
          }
        } catch (e) {
          alert("루틴 정보를 불러오지 못했습니다.");
        } finally {
          setIsLoading(false);
        }
      };
      handleRoutineData();
    } else {
      setData(routineData);
      setIsLoading(false);
    }
  }, [routine_list_idx]);

  // 세트 값 변경 공통 함수
  const handleSetValueChange = (routinePtIdx, index, field, value) => {

    setData(prev => {
      const newData = {
        ...prev,
        routines: prev.routines.map(r => {
          return r.pt_idx === routinePtIdx ? {
            ...r,
            sets: r.sets.map((s, i) => {
              if (i === index) {
                return { ...s, [field]: value };
              }
              return s;
            })
          } : r;
        })
      };
      return newData;
    });
    
  };

  // 세트 삭제 - setId 대신 setIndex 사용
  const handleDeleteSet = (routinePtIdx, setIndex, routine_idx) => {
    const target = data.routines.find((item) => item.routine_idx === routine_idx);
    if (target.sets.length === 1) return alert("최소 하나의 세트는 남겨야 합니다.");
    setData(prev => ({
      ...prev,
      routines: prev.routines.map(r =>
        r.pt_idx === routinePtIdx
          ? {
            ...r,
            sets: r.sets
              .filter((set, index) => index !== setIndex)
              .map((set, index) => ({
                ...set,
                set_num: index + 1  // set_num 재계산
              }))
          }
          : r
      )
    }));
  };

  // trailingActions - 세트가 1개일 때는 비활성화
  const trailingActions = (routinePtIdx, setIndex, routine_idx) => {
    const routine = data.routines.find(r => r.pt_idx === routinePtIdx);
    const hasOnlyOneSet = routine && routine.sets.length <= 1;

    return (
      <TrailingActions>
        <SwipeAction
          destructive={!hasOnlyOneSet}
          onClick={() => {
            if (!hasOnlyOneSet) {
              handleDeleteSet(routinePtIdx, setIndex, routine_idx);
            } else {
              alert("최소 하나의 세트는 남겨야 합니다.");
            }
          }}
          style={{
            background: hasOnlyOneSet ? 'var(--text-tertiary)' : 'var(--error)',
            opacity: hasOnlyOneSet ? 0.5 : 1
          }}
        >
          {hasOnlyOneSet ? '불가' : '삭제'}
        </SwipeAction>
      </TrailingActions>
    );
  };

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
                routine_list_idx: 0,
                routine_idx: r.routine_idx,
                set_num: r.sets.length + 1,  // 현재 세트 개수 + 1
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

  const checkedSetsRef = useRef({});

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
  }, [data, routineData]);

  useEffect(() => {
    if (routineData === null) return;
  }, [routineData]);

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

  const handleRoutineDelete = (idx) => {
    if (window.confirm("이 루틴을 삭제하시겠습니까?")) {
      setData(prev => ({
        ...prev,
        routines: prev.routines.filter(item => item.pt_idx !== idx)
      }));
    }
  }


  const handleTimerToggle = () => {
    setIsTimerShow(true);
  }

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
      {routine_list_idx !== 'custom' ?
        <RoutineTop>
          {isEdit ?
            <RoutineTitle
              type="text"
              value={data.routine_name}
              onChange={e => {
                const value = e.target.value;
                setData(prev => ({
                  ...prev,
                  routine_name: value
                }));
              }}
            /> : <h3>{data.routine_name}</h3>}

          <EditCTA className={isEdit ? "edit" : ""} onClick={isEdit ? handleUpdateData : () => setIsEdit(!isEdit)}>
            {isEdit ? "업데이트" : <SettingsIcon />}
          </EditCTA>
        </RoutineTop>
        : <></>}

      <TimerBox>
        {isEdit ? <></> :
          <TimerCTA onClick={handleTimerToggle}>
            <AlarmIcon />
            휴식 타이머
          </TimerCTA>
        }

      </TimerBox>
      {
        data.routines.length === 0 ?
          <div className="imgBox">
            <img src="https://res.cloudinary.com/dhupmoprk/image/upload/v1752545383/nodata.png" alt="" />
          </div> :
          data.routines && data.routines.map((routine) => (
            <ExerciseSection key={routine.pt_idx} className={isEdit ? 'edit' : ''}>
              <DeleteCTA onClick={() => handleRoutineDelete(routine.pt_idx)}><DoNotDisturbOnIcon /></DeleteCTA>
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
                <div>{isEdit ? '삭제' : '완료'}</div>
              </ListHeader>
              <ListBody>
                <SwipeableList actionDelay={0}>
                  {routine.sets && routine.sets.map((set, index) => {
                    const key = `${routine.pt_idx}-${index}`;
                    return (
                      <SwipeableListItem className={set.checked || checkedSetsRef.current[key] ? 'checked' : ''}
                        key={`${routine.pt_idx}-${index}-${set.id}`}
                        trailingActions={trailingActions(routine.pt_idx, index, routine.routine_idx)}
                      >
                        <div>{index + 1}</div>
                        <div>
                          <input
                            type="number"
                            value={set.set_volume || 0}
                            placeholder="0"
                            onChange={e => {
                              handleSetValueChange(routine.pt_idx, index, 'set_volume', e.target.value);
                            }}
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            value={set.set_count || 0}
                            placeholder="0"
                            onChange={e => {
                              handleSetValueChange(routine.pt_idx, index, 'set_count', e.target.value);
                            }}
                          />
                        </div>
                        <div>
                          {isEdit ?
                            <DeleteIcon onClick={() => handleDeleteSet(routine.pt_idx, index, routine.routine_idx)} />
                            :
                            <>
                              <CheckInput
                                type="checkbox"
                                id={`set-check-${routine.pt_idx}-${index}`}
                                checked={set.checked || checkedSetsRef.current[key] || false}
                                onChange={handleSetCheck(routine.pt_idx, index)}
                              />
                              <Checklabel htmlFor={`set-check-${routine.pt_idx}-${index}`}>
                                <span className="visually-hidden">세트 완료 체크</span>
                              </Checklabel>
                            </>
                          }
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

      {
        isTimerShow ? <Timer time={time} setTime={setTime} setIsTimerShow={setIsTimerShow} /> : <></>
      }
    </WorkoutSetWrapper>
  );
};

export default RoutineDetail;