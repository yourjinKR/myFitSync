import React, { useEffect } from 'react';
import styled from 'styled-components';
import Routine from './Routine';
import axios from 'axios';

const EmptyData = styled.div`
  font-weight:bold;
  color:#d9d9d9;
  font-size:2rem;
  border:1px solid #ccc;
  border-radius:5px;
  padding: 50px 0;
  text-align:center;
  margin-top:5px;
`;



const RoutineList = () => {

  const handleRoutineResponse = async () => {
    const response = await axios.get("/routine/getList" , { withCredentials: true });
    const data = response.data;
    console.log(" data ", data);
  }

  useEffect(()=>{
    handleRoutineResponse();
  },[])

  const List = [1];
  return (
    <div>
      {
        List.length > 0 ? 
        <>
          <Routine idx={1} name={'A루틴'}/>
          <Routine idx={2} name={'B루틴'}/>
          <Routine idx={3} name={'C루틴'}/>
          <Routine idx={4} name={'D루틴'}/>
          <Routine idx={5} name={'E루틴'}/>
          <Routine idx={6} name={'F루틴'}/>
          <Routine idx={7} name={'G루틴'}/>
          <Routine idx={8} name={'H루틴'}/>
        </>
        :
        <EmptyData>
          데이터가 없습니다.
        </EmptyData>
      }
    </div>
  );
};

export default RoutineList;