import React from 'react';
import styled from 'styled-components';
import RoutineList from './RoutineList';
import { Outlet, useNavigate, useOutletContext } from 'react-router-dom';
import Routine from './Routine';


const  RoutineWrapper = styled.div`
  padding: 15px;
  position:relative;
  & > button {
    text-align:center;
    border:1px solid #ccc;
    border-radius:5px;
    padding: 10px;
    width:100%;
    font-size: 2rem;
    line-height:1.2;
    font-weight:bold;
  }
  & > h3{
    margin:30px 0 15px;
    font-size:1.8rem;
  }
`;

const TempDataWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
`;


const RoutineView = () => {
  const {tempData, setTempData} = useOutletContext();
  const nav = useNavigate();
  const handleAddRoutine = (type) => {
    if (type === "custom") {
      nav('/routine/detail/custom');
    }else{
      nav('/routine/add');
    }
  }

  return (
    <RoutineWrapper>
      <button onClick={handleAddRoutine}>루틴 추가하기<br/> + </button>
      <button onClick={() => handleAddRoutine("custom")}>자유 운동<br/> + </button>
      
      <>
        <h3>미기록 운동</h3>
        <TempDataWrapper >
        {
          tempData.map((item, idx) => (
            <Routine key={idx} data={item} type="custom" setTempData={setTempData} />
          ))
        }
        </TempDataWrapper>
      </>

      <>
        <h3>내 루틴</h3>
        <RoutineList/>
      </>
    </RoutineWrapper>
  );
};

export default RoutineView;