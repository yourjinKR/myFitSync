import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
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
`;

const RoutineMain = () => {
  const location = useLocation();
  const changeHeader = 
  location.pathname !== '/routine/add' && 
  location.pathname !== '/routine/set';
  const [routineData, setRoutineData] = useState({
    routine_name: '',
    member_idx : '',
    list: [],
  });
  
  useEffect(() => {
  },[routineData])

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
      }
    } catch (error) {
      console.error("루틴 등록 오류:", error);
    }
  }

  const handleDataSubmit = () => {
    handleRoutineResponse();
  }

  return (
    <>
      {
        !changeHeader ? 
          <HeaderWrapper>
            <button type="button">취소</button>
            <p>루틴 생성하기</p>
            <HeaderCTA onClick={handleDataSubmit}>저장</HeaderCTA>
          </HeaderWrapper>
        :
        <>
        </>
      }
      <Outlet
        context={{ routineData, setRoutineData }}
      />
    </>
  );
};

export default RoutineMain;