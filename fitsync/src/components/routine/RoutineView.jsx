import React from 'react';
import styled from 'styled-components';
import RoutineList from './RoutineList';


const  RoutineWrapper = styled.div`
  padding: 15px;
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
    margin-top:30px;
    font-size:1.8rem;
  }
`;


const RoutineView = () => {
  return (
    <RoutineWrapper>
      <button>루틴 추가하기<br/> + </button>
      <h3>내 루틴</h3>
      <RoutineList/>
    </RoutineWrapper>
  );
};

export default RoutineView;