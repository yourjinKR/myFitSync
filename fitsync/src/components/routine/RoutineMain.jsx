import axios from 'axios';
import React, { use, useEffect, useState } from 'react';
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
  
  useEffect(() => {
  },[routineData])

  const nav = useNavigate();

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
  const handleUpdateSubmit = () => {
    
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
              <HeaderCTA onClick={handleUpdateSubmit}>마치기</HeaderCTA>
            }
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