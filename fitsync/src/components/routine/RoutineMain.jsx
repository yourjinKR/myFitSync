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
  box-shadow: 0 4px 16px rgba(44, 62, 80, 0.08);
  position: sticky;
  top: 0;
  z-index: 999;
  background: #fff;
  min-height: 56px;
  p{
    font-size:2.2rem;
    font-weight:bold;
  }
`;

const HeaderCTA = styled.button`
  border-radius:5px;
  color:#fff;
  background:#9292ff;
  padding:5px 15px;
  font-size:1.4rem;
  &:disabled {
    background: #ccc; 
  }
`;

const AlertBg = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: none;
  justify-content: center;
  align-items: center;
`;
const AlertDiv = styled.div`
  width: 80%;
  height: auto;
  background: #fff;
  color: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-size: 1.6rem;
  z-index: 1000;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  padding:20px;
  border-radius: 10px;

  & > h4{
    font-size: 1.8rem;
  }
    
  & > button {
    border:1px solid #ccc;
    border-radius: 30px;
    padding: 10px 0;
    text-align: center;
    width:100%;
    margin-top: 10px;
    font-size: 1.6rem;
  }
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
            <h4>루틴 변경 내용이있습니다</h4>
            <button onClick={() => handleUpdateData(true)}>업데이트</button>
            <button onClick={() => handleUpdateData(false)}>유지하기</button>
          </AlertDiv>
        :
          <AlertDiv>
            <h4>저장하시겠습니까?</h4>
            <button onClick={() => handleRecordData(true)}>예</button>
            <button onClick={() => handleRecordData(false)}>아니오</button>
          </AlertDiv>
        }
      </AlertBg>
    </>
  );
};

export default RoutineMain;