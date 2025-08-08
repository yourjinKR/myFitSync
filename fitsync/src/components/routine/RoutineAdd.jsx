import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import WorkoutList from './WorkoutList';
import WorkoutFilter from './WorkoutFilter';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';

const RoutineAddWrapper = styled.div`
  padding: 2rem;
  background: var(--bg-primary);
  min-height: 100vh;
`;

const SearchBox = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
  width: 100%;
  gap: 1rem;
  
  & > input {
    padding: 1.2rem 1.6rem;
    border: 2px solid var(--border-light);
    border-radius: 12px;
    width: calc(100% - 9rem);
    font-size: 1.6rem;
    background: var(--bg-secondary);
    color: var(--text-primary);
    transition: all 0.2s ease;
    
    &::placeholder {
      color: var(--text-tertiary);
    }
    
    &:focus {
      border-color: var(--primary-blue);
      box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
    }
  }
  
  & > button {
    border-radius: 12px;
    padding: 1.2rem 2rem;
    border: 2px solid var(--primary-blue);
    background: var(--primary-blue);
    color: var(--text-primary);
    font-size: 1.6rem;
    font-weight: 600;
    transition: all 0.2s ease;
    min-width: 8rem;
  }
`;

const FilterCTA = styled.button`
  border: 2px solid var(--border-light);
  border-radius: 12px;
  width: 100%;
  padding: 1.2rem 1.6rem;
  text-align: center;
  margin-bottom: 2rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1.6rem;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:active {
    transform: translateY(0);
  }
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
    const data = response.data.list.filter((workout) => workout.pt_hidden === 0);
    setInit(data);
    setList(data);
    const categories = Array.from(new Set(data.map((workout) => workout.pt_category)));
    setCategory(categories);
  };

  useEffect(() => {
    getWorkOut();
    
    if(!prev || !prev.includes('/routine/detail/custom')){
      if(prev === null) {
        setRoutineData({
          routine_name: '',
          member_idx: '',
          routines: [],
        });
      }
    } else {
      
      if (!routineData.routine_list_idx) {
        setRoutineData(prevData => ({
          ...prevData,
          routine_list_idx: 'custom',
          routine_name: prevData.routine_name || '자유 운동'
        }));
      }
    }
  }, []);

  const handleSearch = () => {
    setList(init.filter(item => 
      item.pt_name.toLowerCase().includes(document.querySelector('input').value.toLowerCase())
    ));
  };

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