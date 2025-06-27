import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import WorkoutList from './WorkoutList';
import WorkoutFilter from './WorkoutFilter';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RoutineAddWrapper = styled.div`
  padding:15px;
`;

const SearchBox = styled.div`
  display: flex;
  margin-bottom:5px;
  width:100%;
  gap:5px;
  & > input {
    padding: 5px 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    width:calc(100% - 45px);
    font-size:1.4rem;
  }
  & > button {
    border-radius: 5px;
    padding: 5px 10px;
    border:1px solid #ccc;
  }
`;

const FilterCTA = styled.button`
  border: 1px solid #ccc;
  border-radius:5px;
  width:100%;
  padding: 5px 10px;
  text-align:center;
  margin-bottom:10px;
`;

const RoutineTitleInput = styled.input`
  border-bottom: 1px solid #ccc;
  width:100%;
  padding: 5px 10px;
  font-size:1.8rem;
  margin-bottom:10px;
`;

const RoutineAddCTA = styled.button`
  position:fixed;
  bottom:30px;
  width:80%;
  left:50%;
  transform:translateX(-50%);
  z-index:1000;
  background:#9292ff;
  font-size:2rem;
  padding:5px;
  border-radius:5px;
  color:#fff;
`;



const RoutineAdd = ({routineData, setRoutineData}) => {
  const filterRef = useRef();

  // 운동리스트 정보 
  const [init, setInit] = useState([]);
  const [list, setList] = useState([]);
  const [category, setCategory] = useState([]);
  
  const getWorkOut = async () => {
    const response = await axios.get("/routine/workout");
    setInit(response.data.list);
    setList(response.data.list);
    const categories = Array.from(new Set(response.data.list.map((workout) => workout.pt_category)));
    setCategory(categories);
  }
  
  useEffect(() => {
    getWorkOut();
  },[])
  
  useEffect(() => {
  },[init, list]);


  const handleSearch = () => {
    
  }
  const handleFilter = () => {
    const target = filterRef.current;
    target.classList.toggle("on")
  }

  const nav = useNavigate();
  const handleButton = () => {
    console.log(routineData);
    // nav('/routine/set');
  }

  return (
    <RoutineAddWrapper>
      <RoutineTitleInput type="text" placeholder='루틴명 입력'/>
      <SearchBox>
        <input type="text" placeholder='운동 검색'/>
        <button onClick={handleSearch} type="button">검색</button>
      </SearchBox>
      
      {/*부위 선택*/}
      <FilterCTA onClick={handleFilter}>부위 선택</FilterCTA>
      <WorkoutFilter init={init} setList={setList} filterRef={filterRef} category={category}/>

      {/*운동 목록*/}
      <WorkoutList context={{ routineData, setRoutineData }} list={list}/>  

      {/* 루틴 추가 버튼 */}
      <RoutineAddCTA onClick={handleButton}>루틴 추가</RoutineAddCTA>
    </RoutineAddWrapper>
  );
};

export default RoutineAdd;