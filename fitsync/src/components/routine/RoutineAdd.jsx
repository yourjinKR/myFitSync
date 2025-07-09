import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled from 'styled-components';
import WorkoutList from './WorkoutList';
import WorkoutFilter from './WorkoutFilter';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { useDebounce } from 'use-debounce';

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



const RoutineAdd = () => {
  const { routineData, setRoutineData, prev } = useOutletContext();
  const filterRef = useRef();

  // 운동리스트 정보 
  const [init, setInit] = useState([]);
  const [list, setList] = useState([]);
  const [category, setCategory] = useState([]);
  
  // 운동 데이터 가져오기
  const getWorkOut = async () => {
    const response = await axios.get("/routine/workout");
    setInit(response.data.list);
    setList(response.data.list);
    const categories = Array.from(new Set(response.data.list.map((workout) => workout.pt_category)));
    setCategory(categories);
  };

  useEffect(() => {
    getWorkOut();
    if(prev === null){
      setRoutineData({
        routine_name: '',
        member_idx: '',
        routines: [],
      });
    }
  }, []);

  const handleSearch = () => {};

  // 카테고리 열기
  const handleFilter = () => {
    const target = filterRef.current;
    target.classList.toggle("on");
  };


  
  return (
    <RoutineAddWrapper>
      <SearchBox>
        <input type="text" placeholder='운동 검색'/>
        <button onClick={handleSearch} type="button">검색</button>
      </SearchBox>
      <FilterCTA onClick={handleFilter}>부위 선택</FilterCTA>
      <WorkoutFilter init={init} setList={setList} filterRef={filterRef} category={category}/>
      <WorkoutList routineData={routineData} setRoutineData={setRoutineData} list={list}/>  
    </RoutineAddWrapper>
  );
};

export default RoutineAdd;