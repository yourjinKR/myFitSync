import axios from 'axios';
import React, { use, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

const HeaderWrapper = styled.header`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  padding: 15px 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  position: sticky;
  top: 0;
  z-index: 999;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);
  min-height: 56px;
  
  button {
    background: transparent;
    color: var(--text-secondary);
    font-size: 1.4rem;
    font-weight: 500;
    padding: 8px 16px;
    border: 1px solid var(--border-light);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:active {
      background: var(--bg-tertiary);
      color: var(--text-primary);
      border-color: var(--border-medium);
      transform: scale(0.98);
    }
  }
  
  p {
    font-size: 2.2rem;
    font-weight: bold;
    color: var(--text-primary);
  }
`;

const HeaderCTA = styled.button`
  border-radius: 6px;
  color: #ffffff;
  background: var(--primary-blue);
  padding: 8px 16px;
  font-size: 1.4rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:active:not(:disabled) {
    background: var(--primary-blue-hover);
    transform: scale(0.98);
  }
  
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

  h4 {
    font-size: 1.8rem;
    font-weight: 600;
    color: var(--text-primary);
    text-align: center;
    margin-bottom: 8px;
  }
  
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

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  margin-top: 8px;
`;

const RoutineMain = () => {
  const location = useLocation();
  const { routine_list_idx } = useParams();
  const changeHeader = 
  location.pathname !== `/routine/detail/${routine_list_idx}` && 
  location.pathname !== '/routine/add' && 
  location.pathname !== '/routine/set';

  const init = {
    routine_name: '',
    member_idx : '',
    list: [],
  };
  const [routineData, setRoutineData] = useState(init);
  const [newData, setNewData] = useState(null);
  const [isUpdate, setIsUpdate] = useState(false);
  
  useEffect(() => {
  },[routineData])

  const nav = useNavigate();

  // 루틴 추가
  const handleRoutineResponse = async () => {
    try {
      const response = await axios.post(
        "/routine/add",
        routineData,
        { withCredentials: true }
      );
      const result = response.data;
      if(result.success) {
        alert(result.msg);
        nav("/routine/view");
        setRoutineData(init);
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
    console.log(" alertRef.current", alertRef)
  }

  
  // 운동 기록
  const handleRoutineRecord = async () => {
    try {
      const response = await axios.post(
        `/routine/record/${routine_list_idx}`,
        newData,
        { withCredentials: true }
      );
      const result = response.data;
      if(result.success) {
        alert(result.msg);
        nav("/routine/view");
      }
    } catch (error) {
      alert("루틴 기록에 실패했습니다.");
    }
  }
  
  // 저장하기
  const handleRecordData = (isRecord) => {
    if(isRecord) {
      if(newData) {
        setIsUpdate(true);
      }else{
        handleRoutineRecord();
      }
    } else {
      alertRef.current.style.display = "none";
    }
  }

  const handleUpdateData = (type) => {
    setNewData({
      ...newData,
      update : type
    })

    handleRoutineRecord();
  }    

  return (
    <>
      {
        !changeHeader ? 
          <HeaderWrapper>
            <button type="button" onClick={()=> nav("/routine/view")}>취소</button>
            <p>루틴 생성하기</p>
            {
              location.pathname !== `/routine/detail/${routine_list_idx}` ? 
              <HeaderCTA disabled={location.pathname !== '/routine/set' ? true : false} onClick={handleDataSubmit}>저장</HeaderCTA>
              :
              <HeaderCTA onClick={handleRocordSubmit}>마치기</HeaderCTA>
            }
          </HeaderWrapper>
        :
        <>
        </>
      }
      {
        location.pathname !== `/routine/detail/${routine_list_idx}` ? 
        <Outlet context={{ routineData, setRoutineData }} /> :
        <Outlet context={{setNewData}}/>
      }
      <AlertBg ref={alertRef}>
        {
          isUpdate ?
          <AlertDiv>
            <h4>루틴 변경 내용이 있습니다</h4>
            <ButtonGroup>
              <button onClick={() => handleUpdateData(true)}>업데이트</button>
              <button onClick={() => handleUpdateData(false)}>유지하기</button>
            </ButtonGroup>
          </AlertDiv>
        :
          <AlertDiv>
            <h4>저장하시겠습니까?</h4>
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