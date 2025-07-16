import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

const HeaderWrapper = styled.header`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  padding: 13px 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  z-index: 999;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);
  min-height: 56px;
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  
  button {
    
    color: var(--text-primary);
    font-size: 1.4rem;
    font-weight: 500;
    padding: 8px 16px;
    border: 1px solid var(--border-light);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  p {
    font-size: 1.8rem;
    font-weight: bold;
    color: var(--text-primary);
  }
`;

const HeaderCTA = styled.button`
  border-radius: 6px;
  background: var(--primary-blue);
  padding: 8px 16px;
  font-size: 1.4rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:disabled {
    background: var(--border-medium);
    color: var(--text-tertiary);
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const AlertBg = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  z-index: 999;
  display: none;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(4px);
`;

const AlertDiv = styled.div`
  width: 80%;
  max-width: 400px;
  height: auto;
  background: var(--bg-secondary);
  color: var(--text-primary);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-size: 1.6rem;
  z-index: 1000;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  padding: 24px;
  border-radius: 16px;
  border: 1px solid var(--border-light);
  gap: 16px;
  
  button {
    border: 1px solid var(--border-light);
    border-radius: 8px;
    padding: 12px 0;
    text-align: center;
    width: 100%;
    font-size: 1.6rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    background: var(--bg-tertiary);
    color: var(--text-primary);
    
    &:active {
      transform: scale(0.98);
    }
    
    &:first-of-type {
      background: var(--primary-blue);
      color: #ffffff;
      border-color: var(--primary-blue);
      
      &:active {
        background: var(--primary-blue-hover);
      }
    }
    
    &:last-of-type {
      background: transparent;
      color: var(--text-secondary);
      border-color: var(--border-medium);
      
      &:active {
        background: var(--bg-tertiary);
        color: var(--text-primary);
        border-color: var(--border-medium);
      }
    }
  }
`;

// 경고 문구
const WarrningText = styled.div`
  color: var(--text-secondary);
  margin-bottom: 16px;
  text-align: left;
  width: 100%;
  line-height: 1.2;

  p {
    margin: 0;
    padding: 4px 0;
    font-size: 1.8rem;
    color: var(--text-primary);
  }
  p:first-of-type {
    margin-top: 15px;
  }
`;

const H4 = styled.h4.withConfig({
    shouldForwardProp: (prop) => prop !== 'isWarring'
  })`
  font-size: 2.2rem;
  font-weight: bold;
  margin: 0;
  padding: 8px 0;
  text-align: center;
  width: 100%;
  border-bottom: 1px solid var(--border-light);
  color: ${(props) => (props.isWarring ? 'var(--warning)' : 'var(--text-primary)')};
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  margin-top: 8px;
`;

// 루틴 추가 버튼
const RoutineFooter = styled.div`
  position: fixed;
  bottom: 17px;
  left: 50%;
  transform: translateX(-50%);
  max-width: 700px;
  width: calc(100% - 32px);
`;
const RoutineAddCTA = styled.button`
  width: 100%;
  font-size: 1.6rem;
  padding: 16px 0;
  background: var(--primary-blue);
  color: #fff;
  border: none;
  font-weight: 500;
  border-radius: 5px;
`;

const RoutineNameInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  font-size: 1.6rem;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  margin-top: 8px;
  &::placeholder {
    color: var(--text-tertiary);
  }
`;

const RoutineMain = () => {
  const nav = useNavigate();
  const { routine_list_idx } = useParams();
  
  // 이전 페이지 정보
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const prev = query.get("prev");
  const targetDate = query.get("date");
  

  // 헤더 변경 여부
  const changeHeader = 
  location.pathname !== `/routine/detail/${routine_list_idx}` && 
  location.pathname !== '/routine/add' && 
  location.pathname !== '/routine/set';

  const routineInit = {
    routine_name: '',
    member_idx : '',
    routines: [],
  };
  const [routineData, setRoutineData] = useState(routineInit);
  const [newData, setNewData] = useState(null);
  const [isUpdate, setIsUpdate] = useState(false);
  const [unfinished, setUnfinished] = useState([]);
  const [isSave, setIsSave] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [tempData, setTempData] = useState(localStorage.getItem('routineData') ? JSON.parse(localStorage.getItem('routineData')) : []);
  const [pendingNav, setPendingNav] = useState(false);  // 상태 반영 후 이동 예약

  
  useEffect(() => {
    if (routineData === null) return;
    if(routine_list_idx !== 'custom' ) {
      if(isSave && (prev === null || prev === undefined)) {
        nav("/routine/view");
        setIsSave(false);
      }
    }else{
      const localData = tempData.find(item => item.saveDate === targetDate);
      if(localData != null && localData.routine_name !== "") {
        setIsSave(true);
      }
    }
  },[routineData, unfinished, isSave , nav]);
  useEffect(() => {
    if(prev !== null && routineData === routineInit) {
      nav(prev);
    }
  },[])
  
  useEffect(() => {
    if(location.pathname === '/routine/view'){
      setRoutineData(routineInit);
      closeAlert();
    } 

    if(isEdit){
      setIsEdit(false);
    }
  },[location.pathname])

  useEffect(() => {
    if(newData === null) return;
    if(routine_list_idx !== 'custom' && newData.update){
      setIsUpdate(true);
    }else{
      setIsUpdate(false);
    }
  },[newData])

  useEffect(() => {
    if(tempData === null || tempData.length === 0) return;
    localStorage.setItem('routineData', JSON.stringify(tempData));
  },[tempData]);

  // 루틴 추가
  const handleRoutineResponse = async () => {
    if(!routineData.routine_name || routineData.routine_name === "") {
      alert("루틴명을 작성해주세요.");
      return;
    }
    
    try {
      const response = await axios.post(
        "/routine/add",
        routineData,
        { withCredentials: true }
      );
      const result = response.data;
      if(result.success) {
        alert(result.msg);
        setIsSave(true);
        setTempData(prev => 
          prev.map(item => 
            item.saveDate === routineData.saveDate 
              ? { ...item, save: true }
              : item
          )
        );
        if(routine_list_idx !== 'custom'){
          nav("/routine/view");
        } 
        setRoutineData(routineInit);
      }
    } catch (error) {
      console.error("루틴 등록 오류:", error);
    }
  }
  
  const handleDataSubmit = () => {
    handleRoutineResponse();
  }

  const alertRef = useRef();

  // 루틴 기록
  const handleRocordSubmit = () => {
    alertRef.current.style.display = "flex";

    const dataFilter = newData.routines;
    dataFilter.map((routine) => {
      const sets = routine.sets;
      const filter = sets.filter((set) => set.checked === undefined || set.checked === false); 
      filter.map((set,idx) => {
        setUnfinished(prev => [
          ...prev, 
          `${routine.pt.pt_name} ${filter[idx].set_num}세트`
        ]);
      })
    });
  }

  
  // 운동 기록
  const handleRoutineRecord = async () => {
    let postData = newData;

    if(postData.routines.length === 0) {
      alert("완료된 운동이 없습니다.");
      const saveCheck = tempData.find(item => item.saveDate === newData.saveDate).save;
      if(saveCheck === undefined || saveCheck === false) {
        setIsSave(false);
      }
      closeAlert();
      return;
    }
    
    try {
      const response = await axios.post(
        `/routine/record`,
        postData,
        { withCredentials: true }
      );
      const result = response.data;
      alertRef.current.style.display = "none";
      setIsUpdate(false);
      if(result.success) {

        alert(result.msg);
        if(routine_list_idx === 'custom') {
          const newLocalData = tempData.filter(item => item.routine_name !== postData.routine_name);
          setTempData(newLocalData);
        }

        nav("/routine/view");
      } else {
        alert(result.msg);
        const saveCheck = tempData.find(item => item.saveDate === newData.saveDate).save;
        if(saveCheck === undefined || saveCheck === false) {
          setIsSave(false);
        }
      }
    } catch (error) {
      alert("루틴 기록에 실패했습니다.");
      closeAlert();
    }
  }
  
  // 저장하기
  const handleRecordData = (isRecord) => {
    if(isRecord) {
      handleRoutineRecord();
    } else {
      const saveCheck = tempData.find(item => item.saveDate === newData.saveDate).save;
      if(saveCheck === undefined || saveCheck === false) {
        setIsSave(false);
      }
      closeAlert();
    }
  }

  useEffect(() => {
    if(newData === null) return;
  },[isEdit]);

  const handleUpdateData = (type) => {
    if(type) {
      const putData = async () => {
        try {
          const response = await axios.put(
            `/routine/update/${routine_list_idx}`,
            newData,
            { withCredentials: true }
          );
          const result = response.data;
          if(result.success) {
            alert(result.msg);
            setIsUpdate(false);
            nav("/routine/view");
          } else {
            alert(result.msg);
          }
        } catch (error) {
          alert("루틴 업데이트에 실패했습니다.");
        }
      }

      if(isEdit && newData.update) {
        if(window.confirm("루틴을 업데이트 하시겠습니까?")){
          putData();
        }
      }

      setIsEdit(!isEdit);
      
    }else{
      setNewData(prev => ({
        ...prev,
        update: type
      }));
    }
   
  }   
  
  const handleTempSave = (type) => {
    if(type) {
      handleRoutineResponse();
    }else{
      // closeAlert();
      setIsSave(true);
    }
  };


  const closeAlert = () => {
    alertRef.current.style.display = "none";
    setUnfinished([]);
    setIsUpdate(false);
  }


  useEffect(() => {
    if (pendingNav) {
      const path = prev !== null ? prev : 
          location.pathname === '/routine/set' ?
          '/routine/add?prev=/routine/set' :
          "/routine/set";
      nav(path);
      setPendingNav(false);
    }
    // eslint-disable-next-line
  }, [pendingNav, nav]);

  // 루틴 운동 등록
  const handleButton = () => {


    if(routineData.routines.length > 0){
      setPendingNav(true); // 상태 반영 후 이동 예약
    }else{
      alert("하나 이상의 운동을 선택해주세요.");
    }
  }

  const handleAddWorkOut = () => {
    nav("/routine/add?prev=/routine/detail/" + routine_list_idx);
  }
  
  return (
    <>
      {/* 루틴 헤더 */}
      {!changeHeader ? 
          <HeaderWrapper>
            <button type="button" onClick={()=> nav("/routine/view")}>취소</button>
            <p>루틴 생성하기</p>
            {
              location.pathname !== `/routine/detail/${routine_list_idx}` ? 
              <HeaderCTA disabled={location.pathname !== '/routine/set' ? true : false} onClick={handleDataSubmit}>저장</HeaderCTA>
              :
              <HeaderCTA disabled={isEdit} onClick={handleRocordSubmit}>마치기</HeaderCTA>
            }
          </HeaderWrapper> : <></>}
      {
        location.pathname !== `/routine/detail/${routine_list_idx}` ? 
        <Outlet context={{ routineData, setRoutineData, isSave,  handleButton, prev, tempData, setTempData}} /> :
        <Outlet context={{ routineData, setRoutineData, newData, setNewData, routineInit, isEdit, setIsEdit, handleUpdateData, tempData, setTempData}}/>
      }

      {/* 루틴 하단 버튼 */}
      {
        <RoutineFooter>
          <RoutineAddCTA onClick={
            location.pathname !== `/routine/detail/${routine_list_idx}` ? handleButton :
            handleAddWorkOut
          }>운동 추가하기</RoutineAddCTA>
        </RoutineFooter>  
      }

      {/* 알림 모달 */} 
      <AlertBg ref={alertRef}>
        {
          isUpdate ?
          <AlertDiv>
            <H4>루틴 변경 내용이 있습니다</H4>
            <ButtonGroup>
              <button onClick={() => handleUpdateData(true)}>업데이트</button>
              <button onClick={() => handleUpdateData(false)}>유지하기</button>
            </ButtonGroup>
          </AlertDiv>
        :
          !isSave && 
          tempData.find(item => item.saveDate === routineData.saveDate)?.save !== true &&
          routine_list_idx !== undefined &&
          routine_list_idx !== null &&
          routine_list_idx === 'custom' ?
          <AlertDiv>
            <H4>루틴에 등록하시겠습니까?</H4>
            <RoutineNameInput
              placeholder="루틴 이름을 입력하세요"
              type="text"
              value={routineData.routine_name}
              onChange={e => {
                const value = e.target.value;
                setRoutineData(prev => ({
                  ...prev,
                  routine_name: value
                }));
              }}
            />
            <ButtonGroup>
              <button onClick={() => handleTempSave(true)}>등록</button>
              <button onClick={() => handleTempSave(false)}>취소</button>
            </ButtonGroup>
          </AlertDiv>
          :
          <AlertDiv>
            <WarrningText>
              {
                unfinished.length === 0 ? <></> :
                <div>
                  <H4 isWarring={true}>완료되지 않은 운동 목록</H4>
                  <div style={{ width: '100%', overflowY: 'auto', maxHeight: '200px' }}>
                    {unfinished.map((item, idx) => (
                      <p key={idx}>
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              }
            </WarrningText>
            <H4>운동정보를 기록하시겠습니까?</H4>
            <ButtonGroup>
              <button onClick={() => handleRecordData(true)}>예</button>
              <button onClick={() => handleRecordData(false)}>아니오</button>
            </ButtonGroup>
          </AlertDiv>
        }
      </AlertBg>
    </>
  );
};

export default RoutineMain;