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
import WorkoutView from './WorkoutView';
const { getTimeDifference, formatDate } = dateFormat;

const WorkoutSetWrapper = styled.div`
  padding: 16px;
  background: var(--bg-primary);
  height: calc(100vh - 150px);
  overflow-y: auto;

  h3 {
    font-size: 2rem;
    color: var(--text-primary);
    font-weight: 600;
    height: auto;
    line-height: 1.4;
    width: calc(100% - 80px);
    margin: 0;
  }
  
  .imgBox{
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 60vh;
    img {
      width: 60%;
      
      opacity: 0.6;
    }
  }
`;
const ExerciseSection = styled.div`
  position: relative;
  margin-bottom: 16px;
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
    width: 2.2rem;
    height: 2.2rem;
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
  gap: 12px;
  padding: 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);
  
  img {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    border: 2px solid var(--border-medium);
    object-fit: cover;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      border-color: var(--primary-blue);
      transform: scale(1.05);
    }
  }
  
  .exercise-info {
    flex: 1;
    min-width: 0;
    
    h4 {
      font-size: 1.4rem;
      color: var(--text-primary);
      font-weight: 600;
      margin: 0 0 4px 0;
      line-height: 1.3;
    }
    
    .exercise-category {
      font-size: 1rem;
      color: var(--text-secondary);
      opacity: 0.8;
    }
  }
`;
const MemoInput = styled.input`
  padding: 12px 16px;
  font-size: 1.3rem;
  width: 100%;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: none;
  border-bottom: 1px solid var(--border-light);
  
  &::placeholder {
    color: var(--text-tertiary);
    font-size: 1.2rem;
  }
  
  &:focus {
    background: var(--bg-primary);
    outline: none;
    border-bottom-color: var(--primary-blue);
  }
`;
const ListHeader = styled.div`
  display: flex;
  width: 100%;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-light);
  
  div { 
    flex: 1;
    font-size: 1.3rem;
    font-weight: 600;
    text-align: center;
    padding: 10px 0;
    color: var(--text-primary);
    
    &:first-child {
      flex: 0.6;
    }
    
    &:last-child {
      flex: 0.8;
    }
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
    padding: 6px 0;
    border-bottom: 1px solid var(--border-light);
    min-height: 44px;

    svg {
      width: 2.2rem;
      height: 2.2rem;
      color: white;
      background: var(--error);
      border-radius: 50%;
      padding: 3px;
    }
  }

  .swipeable-list-item__content > div {
    flex: 1;
    text-align: center;
    font-size: 1.4rem;
    color: var(--text-primary);
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:first-child {
      flex: 0.6;
      font-size: 1.3rem;
    }
    
    &:last-child {
      flex: 0.8;
    }
  } 
  
  .swipeable-list-item__content > div > input {
    width: 80%;
    padding: 6px 4px;
    text-align: center;
    font-size: 1.4rem;
    background: transparent;
    color: var(--text-primary);
    border: none;
    outline: none;
    border-radius: 4px;
    
    &:focus {
      background: var(--bg-primary);
      border: 1px solid var(--primary-blue);
    }
    
    &::placeholder {
      color: var(--text-tertiary);
      font-size: 1.2rem;
    }
  } 
  
  .swipe-action__trailing {
    background: var(--error);
    color: #ffffff;
    font-weight: 600;
    font-size: 1.2rem;
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
    max-width: 70px;
  }
`;
const SetAddCTA = styled.button`
  width: 100%; 
  font-size: 1.4rem;
  padding: 12px 0;
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
  width: 28px;
  height: 28px;
  top: 8px;
  right: 8px;
  z-index: 10;
  
  svg {
    width: 2rem;
    height: 2rem;
  }
`;

const RoutineTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border-light);
  
  input {
    font-size: 2rem;
    color: var(--text-primary);
    font-weight: 600;
    height: auto;
    line-height: 1.4;
    width: calc(100% - 80px);
    padding: 0;
  }
`;

const EditCTA = styled.button`
  display: flex;
  align-items: center;
  font-size: 1.2rem;
  color: var(--text-primary);
  padding: 4px 12px;
  border-radius: 6px;
  height: 32px;
  line-height: 1.4;

  &.edit {
    background: var(--primary-blue);
    color: var(--text-white);
  }

  svg {
    width: 2.4rem;
    height: 2.4rem;
    border-radius: 50%;
    padding: 4px;
    color: white;
  }

  path {
    font-size: 1.8rem;
    color: var(--text-primary);
  }
`;

const RoutineTitle = styled.input`
  font-size: 2rem;
  border: none;
  background: transparent;
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: var(--bg-primary);
  font-size: 1.4rem;
  color: var(--text-secondary);
`;

const TimerBox = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 4px 8px;
  width: 100%;
  margin: 8px 0 16px 0;
  min-height: 32px;
  
  svg {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
  }
  path {
    color: var(--primary-blue-light);
    font-weight: bold;
  }
`;

const TimerCTA = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--primary-blue-light);
  font-size: 1.6rem;
  font-weight: bold;
`;



const RoutineDetail = () => {
  const { routineData, setRoutineData, isEdit, setIsEdit, setInit, handleUpdateData, tempData, setTempData } = useOutletContext();
  const { routine_list_idx } = useParams();


  const [time, setTime] = useState({
    minutes: 0,
    seconds: 0,
  });
  const [data, setData] = useState(null); // init 대신 null로 초기화
  const [isLoading, setIsLoading] = useState(true); // 항상 true로 시작
  const [isTimerShow, setIsTimerShow] = useState(false);
  const [localInit, setLocalInit] = useState(null); // 로컬 init 상태 추가
  const { setNewData } = useOutletContext();
  const location = useLocation();
  const param = new URLSearchParams(location.search);
  const targetDate = param.get('date');
  const [modalPtId, setModalPtId] = useState(null);

  const checkedSetsRef = useRef({});

  const handleOpenWorkoutModal = (e) => {
    const { idx } = e.target.dataset;
    setModalPtId(idx);
  };

  const handleCloseWorkoutModal = () => {
    setModalPtId(null);
  };

  const targetIdx = location.state?.targetMember;

  // 한국 시간 생성 함수
  const getKoreaTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // localStorage 정리 함수
  const cleanupLocalStorage = () => {
    const storedData = localStorage.getItem('routineData');
    if (!storedData) return;
    
    try {
      const tempDataArray = JSON.parse(storedData);
      const uniqueData = [];
      const seenKeys = new Set();
      
      tempDataArray.forEach(item => {
        // ISO 형식 saveDate를 한국 시간 형식으로 변환
        if (item.saveDate && item.saveDate.includes('T')) {
          const isoDate = new Date(item.saveDate);
          const year = isoDate.getFullYear();
          const month = String(isoDate.getMonth() + 1).padStart(2, '0');
          const day = String(isoDate.getDate()).padStart(2, '0');
          const hours = String(isoDate.getHours()).padStart(2, '0');
          const minutes = String(isoDate.getMinutes()).padStart(2, '0');
          const seconds = String(isoDate.getSeconds()).padStart(2, '0');
          item.saveDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }
        
        const key = `${item.saveDate}-${item.routine_name}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          uniqueData.push(item);
        }
      });
      
      if (uniqueData.length !== tempDataArray.length) {
        localStorage.setItem('routineData', JSON.stringify(uniqueData));
      }
    } catch (error) {
      console.error("localStorage 정리 에러:", error);
    }
  };

  // tempData 업데이트 공통 함수 - localStorage와 tempData 동기화
  const updateTempData = (updatedData) => {
    if (routine_list_idx === 'custom') {
      setTempData(prev => {
        
        // 식별자 생성 (날짜 + 루틴명)
        const targetKey = `${updatedData.saveDate}-${updatedData.routine_name}`;
        
        // 같은 키를 가진 데이터를 모두 제거하고 새 데이터 추가
        const filteredData = prev.filter(item => {
          const itemKey = `${item.saveDate}-${item.routine_name}`;
          const shouldKeep = itemKey !== targetKey;
          return shouldKeep;
        });
        
        // 새 데이터 추가
        const finalData = [...filteredData, updatedData];
        
        return finalData;
      });
    } else {
      // 일반 루틴인 경우 - 동일한 루틴 idx와 날짜(년월일)가 같으면 교체, 다르면 따로 저장
      setTempData(prev => {
        const existingIndex = prev.findIndex(item => {
          // 날짜 부분만 추출해서 비교 (년-월-일)
          const itemDateOnly = item.saveDate ? item.saveDate.split(' ')[0] : '';
          const updatedDateOnly = updatedData.saveDate ? updatedData.saveDate.split(' ')[0] : '';
          
          return item.routine_list_idx === updatedData.routine_list_idx && 
                 itemDateOnly === updatedDateOnly;
        });
        
        if (existingIndex !== -1) {
          // 같은 루틴 idx이고 같은 날짜(년월일)면 교체
          const newTempData = [...prev];
          newTempData[existingIndex] = updatedData;
          return newTempData;
        } else {
          // 다른 날짜이거나 새로운 루틴이면 따로 저장
          return [...prev, updatedData];
        }
      });
    }
  };

  // checked 필드와 saveDate, set_num을 제거한 새로운 객체 반환 (비교용)
  const omitCheckedAndSaveDate = (obj) => {
    if (!obj || !obj.routines) {
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

  // 세트 값 변경 핸들러
  const handleSetValueChange = (routinePtIdx, index, field, value) => {
    const updatedData = {
      ...data,
      routines: data.routines.map(r => {
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

    // saveDate가 없으면 자동 설정
    if (!updatedData.saveDate) {
      updatedData.saveDate = targetDate || getKoreaTime();
    }
    
    setData(updatedData);
    
    // tempData 업데이트
    updateTempData(updatedData);
  };

  // 세트 체크 핸들러
  const handleSetCheck = (routinePtIdx, setIndex) => (e) => {
    const key = `${routinePtIdx}-${setIndex}`;
    checkedSetsRef.current[key] = e.target.checked;
    
    const updatedData = {
      ...data,
      routines: data.routines.map(r =>
        r.pt_idx === routinePtIdx
          ? {
            ...r,
            sets: r.sets.map((set, idx) =>
              idx === setIndex ? { ...set, checked: e.target.checked } : set
            )
          }
          : r
      )
    };

    // saveDate가 없으면 자동 설정
    if (!updatedData.saveDate) {
      updatedData.saveDate = targetDate || getKoreaTime();
    }
    
    setData(updatedData);
    
    // tempData 업데이트
    if(routine_list_idx !== 'custom') {
      updateTempData(updatedData);
    }
  };

  // 세트 추가 핸들러
  const handleAddSet = (routinePtIdx) => {
    const updatedData = {
      ...data,
      routines: data.routines.map(r =>
        r.pt_idx === routinePtIdx
          ? {
            ...r,
            sets: [
              ...r.sets,
              {
                routine_list_idx: 0,
                routine_idx: r.routine_idx,
                set_num: r.sets.length + 1,
                set_volume: 0,
                set_count: 0,
                id: `${routinePtIdx}-${r.sets.length}-${Date.now()}`,
              }
            ]
          }
          : r
      )
    };

    // saveDate가 없으면 자동 설정
    if (!updatedData.saveDate) {
      updatedData.saveDate = targetDate || getKoreaTime();
    }
    
    setData(updatedData);
    
    // tempData 업데이트
    updateTempData(updatedData);
  };

  // 세트 삭제 핸들러
  const handleDeleteSet = (routinePtIdx, setIndex, routine_idx) => {
    const target = data.routines.find((item) => item.routine_idx === routine_idx);
    if (target.sets.length === 1) return alert("최소 하나의 세트는 남겨야 합니다.");
    
    const updatedData = {
      ...data,
      routines: data.routines.map(r =>
        r.pt_idx === routinePtIdx
          ? {
            ...r,
            sets: r.sets
              .filter((set, index) => index !== setIndex)
              .map((set, index) => ({
                ...set,
                set_num: index + 1
              }))
          }
          : r
      )
    };

    // saveDate가 없으면 자동 설정
    if (!updatedData.saveDate) {
      updatedData.saveDate = targetDate || getKoreaTime();
    }
    
    setData(updatedData);
    
    // tempData 업데이트
    updateTempData(updatedData);
  };

  // 루틴 삭제 핸들러
  const handleRoutineDelete = (idx) => {
    if (window.confirm("이 루틴을 삭제하시겠습니까?")) {
      const updatedData = {
        ...data,
        routines: data.routines.filter(item => item.pt_idx !== idx)
      };

      // saveDate가 없으면 자동 설정
      if (!updatedData.saveDate) {
        updatedData.saveDate = targetDate || getKoreaTime();
      }
      
      setData(updatedData);
      
      // tempData 업데이트
      updateTempData(updatedData);
    }
  };

  const handleTimerToggle = () => {
    setIsTimerShow(true);
  };

  // 취소 핸들러 추가
  const handleCancel = () => {
    if (localInit) {
      setData(localInit);
      setIsEdit(false);
    }
  };

  // trailingActions
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

  // useEffect - data 수정 (간소화) - 무한루프 방지
  useEffect(() => {
    if (data === null || localInit === null) {
      return;
    }

    const omitData = omitCheckedAndSaveDate(data);
    const omitInit = omitCheckedAndSaveDate(localInit);
    const isEqual = JSON.stringify(omitData) === JSON.stringify(omitInit);

    if (routine_list_idx !== 'custom') {
      setNewData({
        ...data,
        update: !isEqual,
      });
    } else {
      setNewData({
        ...data,
        update: false,
      });
    }

    // setRoutineData 호출 제거하여 무한루프 방지
    // if (location.pathname.includes('/routine/detail/')) {
    //   setRoutineData(data);
    // }
  }, [data, routine_list_idx, localInit, setNewData]); // setNewData 의존성 추가

  // 자유 운동 저장 로직 - 간소화하여 무한루프 방지
  useEffect(() => {
    if (routine_list_idx !== 'custom' || !data) return;

    // 빠간기록용 기본 saveDate 설정 - saveDate가 없거나 null이면 설정
    if (!data.saveDate || data.saveDate === null) {
      const currentDate = targetDate || getKoreaTime();
      setData(prev => {
        const newData = {
          ...prev,
          saveDate: currentDate
        };
        return newData;
      });
    }
  }, [routine_list_idx, targetDate, tempData, data]); // eslint-disable-line react-hooks/exhaustive-deps

  // 일반 루틴의 체크된 세트 처리 - 간소화하여 무한루프 방지
  useEffect(() => {
    if (!data || !data.routines || routine_list_idx === 'custom') return;

    // 체크된 세트가 있는지만 확인하고 tempData 업데이트는 별도로 처리
    const hasCheckedSets = data.routines.some(routine => 
      routine.sets.some(set => set.checked === true)
    );

    if (hasCheckedSets && !data.saveDate) {
      const findData = tempData.find(item => item.routine_list_idx === data.routine_list_idx);
      const diffDate = findData?.saveDate ? getTimeDifference(findData.saveDate).days : 0;
      
      if (diffDate > 0 || !findData) {
        setData(prev => ({
          ...prev,
          saveDate: getKoreaTime(),
        }));
      } else if (findData) {
        setData(prev => ({
          ...prev,
          saveDate: findData.saveDate,
        }));
      }
    }
  }, [routine_list_idx]); // eslint-disable-line react-hooks/exhaustive-deps

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      // RoutineDetail에서 나갈 때 모든 상태 초기화
      setRoutineData({
        routine_name: '',
        member_idx: '',
        routines: [],
      });
      setIsEdit(false);
      // 추가로 전역 상태도 초기화
      if (typeof setInit === 'function') {
        setInit(null);
      }
    };
  }, [setRoutineData, setIsEdit, setInit]);

  // 데이터 로드 useEffect - 간소화로 무한 루프 방지
  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        setIsLoading(true);

        const url = targetIdx
          ? `/routine/trainer/${routine_list_idx}/${targetIdx}`
          : `/routine/${routine_list_idx}`;

        const response = await axios.get(url, { withCredentials: true });
        const result = response.data;

        if (result.success) {
          const newData = {
            ...result.vo,
            routines: result.vo.routines.map(routine => ({
              ...routine,
              sets: routine.sets.map((set, idx) => ({
                ...set,
                id: set.id || `${routine.pt_idx}-${idx}-${Date.now()}`
              }))
            }))
          };

          setData(newData);
          setInit(result.vo);
          setLocalInit(result.vo); // 로컬 init도 설정
          setRoutineData(result.vo);
        } else {
          alert(result.msg);
        }
      } catch (err) {
        alert("루틴 정보를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    if (routine_list_idx === 'custom') {
      // localStorage 정리 먼저 실행
      cleanupLocalStorage();
      
      // 현재 날짜 생성
      const currentDate = targetDate || getKoreaTime();
      
      // localStorage에서 해당 날짜의 데이터 찾기
      const storedTempData = localStorage.getItem('routineData');
      let existingData = null;
      
      if (storedTempData && targetDate) {
        try {
          const parsedTempData = JSON.parse(storedTempData);
          
          // 같은 날짜의 데이터 찾기 (루틴명 고려)
          const sameDateData = parsedTempData.filter(item => {
            const itemDateOnly = item.saveDate ? item.saveDate.split(' ')[0] : '';
            const targetDateOnly = targetDate.split(' ')[0];
            return itemDateOnly === targetDateOnly;
          });
          
          if (sameDateData.length > 0) {
            // 루틴명이 있는 데이터를 우선적으로 선택, 없으면 가장 최근 것
            existingData = sameDateData.find(item => item.routine_name && item.routine_name !== '자유 운동') 
                          || sameDateData[sameDateData.length - 1];
          }
          
          // 중복된 데이터가 있다면 정리 (같은 날짜, 같은 이름)
          if (sameDateData.length > 1) {
            const uniqueData = [];
            const seenKeys = new Set();
            
            parsedTempData.forEach(item => {
              const key = `${item.saveDate}-${item.routine_name}`;
              if (!seenKeys.has(key)) {
                seenKeys.add(key);
                uniqueData.push(item);
              } else {
                // 중복된 경우 운동 데이터가 더 많은 것을 선택
                const existingItem = uniqueData.find(u => `${u.saveDate}-${u.routine_name}` === key);
                if (existingItem && item.routines.length > existingItem.routines.length) {
                  const index = uniqueData.findIndex(u => `${u.saveDate}-${u.routine_name}` === key);
                  uniqueData[index] = item;
                }
              }
            });
            
            // 중복이 정리된 데이터로 localStorage 업데이트
            if (uniqueData.length !== parsedTempData.length) {
              localStorage.setItem('routineData', JSON.stringify(uniqueData));
            }
          }
        } catch (error) {
          console.error("localStorage 파싱 에러:", error);
        }
      }
      
      const customData = {
        routine_list_idx: 'custom',
        routine_name: formatDate(currentDate, "none"),
        routines: existingData?.routines || routineData?.routines || [],
        saveDate: currentDate // 강제로 currentDate만 사용
      };
      setData(customData);
      setInit(customData);
      setLocalInit(customData); // 로컬 init도 설정
      setIsLoading(false);
      return;
    }

    if (routine_list_idx && routine_list_idx !== 'custom') {
      fetchRoutine();
    } else {
      setIsLoading(false);
    }

  }, [routine_list_idx, targetIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  // 체크 상태 관리
  useEffect(() => {
    if (data && data.routines) {
      const newChecked = {};
      data.routines.forEach(routine => {
        routine.sets.forEach((set, idx) => {
          const key = `${routine.pt_idx}-${idx}`;
          newChecked[key] = checkedSetsRef.current[key] ?? false;
        });
      });
      checkedSetsRef.current = newChecked;
    }
  }, [data]);

  // 로딩 처리
  if (isLoading) {
    return (
      <LoadingWrapper>
        로딩중...
      </LoadingWrapper>
    );
  }

  if (routine_list_idx === 'custom' && (!data || data.routines === undefined)) {
    return (
      <WorkoutSetWrapper>
        <TimerBox>
          <TimerCTA onClick={handleTimerToggle}>
            <AlarmIcon />
            휴식 타이머
          </TimerCTA>
        </TimerBox>
        <div className="imgBox">
          <img src="https://res.cloudinary.com/dhupmoprk/image/upload/v1752545383/nodata.png" alt="" />
        </div>
        {isTimerShow ? <Timer time={time} setTime={setTime} setIsTimerShow={setIsTimerShow} /> : null}
      </WorkoutSetWrapper>
    );
  }

  if (!data) {
    return (
      <LoadingWrapper>
        로딩중...
      </LoadingWrapper>
    );
  }

  // 입력 핸들러 함수 추가
  const handleInputFocus = (e) => {
    if (e.target.value === '0') {
      e.target.value = '';
    }
  };

  const handleInputBlur = (e, routinePtIdx, index, field) => {
    if (e.target.value === '') {
      handleSetValueChange(routinePtIdx, index, field, '0');
    }
  };

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

          <div style={{ display: 'flex', gap: '8px' }}>
            <EditCTA className={isEdit ? "edit" : ""} onClick={isEdit ? handleUpdateData : () => setIsEdit(!isEdit)}>
              {isEdit ? "업데이트" : <SettingsIcon />}
            </EditCTA>
          </div>
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

      {data.routines.length === 0 ?
        <div className="imgBox">
          <img src="https://res.cloudinary.com/dhupmoprk/image/upload/v1752545383/nodata.png" alt="" />
        </div> :
        data.routines && data.routines.map((routine) => (
          <ExerciseSection key={routine.pt_idx} className={isEdit ? 'edit' : ''}>
            <DeleteCTA onClick={() => handleRoutineDelete(routine.pt_idx)}><DoNotDisturbOnIcon /></DeleteCTA>
            <SetTop>
              <img 
                src={routine.pt?.pt_image ? routine.pt.pt_image.split(",").filter((item) => item.includes(".png"))[0] || "https://res.cloudinary.com/dhupmoprk/image/upload/v1752545383/nodata.png" : "https://res.cloudinary.com/dhupmoprk/image/upload/v1752545383/nodata.png"} 
                alt={routine.pt?.pt_name || "운동"} 
                data-idx={routine.pt?.pt_idx} 
                onClick={handleOpenWorkoutModal} 
              />
              <div className="exercise-info">
                <h4>{routine.pt?.pt_name || "운동명 없음"}</h4>
                <div className="exercise-category">{routine.pt?.pt_category || '전신 운동'}</div>
              </div>
            </SetTop>
            <MemoInput
              name="memo"
              type="text"
              placeholder="루틴에 대한 메모를 작성해주세요."
              value={routine.routine_memo || ""}
              onChange={e => {
                const value = e.target.value;
                const updatedData = {
                  ...data,
                  routines: data.routines.map(r =>
                    r.pt_idx === routine.pt_idx
                      ? { ...r, routine_memo: value }
                      : r
                  )
                };
                
                setData(updatedData);
                
                // tempData 업데이트
                updateTempData(updatedData);
              }}
            />
            <ListHeader>
              <div>세트</div>
              <div>중량(kg)</div>
              <div>횟수</div>
              <div>{isEdit ? '삭제' : '완료'}</div>
            </ListHeader>
            <ListBody>
              <SwipeableList actionDelay={0}>
                {routine.sets && routine.sets.map((set, index) => {
                  const key = `${routine.pt_idx}-${index}`;
                  return (
                    <SwipeableListItem 
                      className={set.checked || checkedSetsRef.current[key] ? 'checked' : ''}
                      key={`${routine.pt_idx}-${index}-${set.id}`}
                      trailingActions={trailingActions(routine.pt_idx, index, routine.routine_idx)}
                    >
                      <div>{index + 1}</div>
                      <div>
                        <input
                          type="number"
                          value={set.set_volume || 0}
                          placeholder="0"
                          onFocus={handleInputFocus}
                          onChange={e => {
                            handleSetValueChange(routine.pt_idx, index, 'set_volume', e.target.value);
                          }}
                          onBlur={e => handleInputBlur(e, routine.pt_idx, index, 'set_volume')}
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          value={set.set_count || 0}
                          placeholder="0"
                          onFocus={handleInputFocus}
                          onChange={e => {
                            handleSetValueChange(routine.pt_idx, index, 'set_count', e.target.value);
                          }}
                          onBlur={e => handleInputBlur(e, routine.pt_idx, index, 'set_count')}
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

      {isTimerShow ? <Timer time={time} setTime={setTime} setIsTimerShow={setIsTimerShow} /> : null}
      
      {modalPtId && (
        <WorkoutView
          ptId={modalPtId}
          isModal= {true}
          onClose={handleCloseWorkoutModal}
        />
      )}
    </WorkoutSetWrapper>
  );
};

export default RoutineDetail;