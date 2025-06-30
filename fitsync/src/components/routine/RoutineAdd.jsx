import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import WorkoutList from './WorkoutList';
import WorkoutFilter from './WorkoutFilter';
import { useNavigate, useOutletContext } from 'react-router-dom';
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
  padding:15px 5px;
  border-radius:5px;
  color:#fff;
`;

// 루틴명 입력창을 별도 컴포넌트로 분리
const RoutineTitleInputBox = React.memo(({ value, onChange }) => (
  <RoutineTitleInput
    type="text"
    value={value}
    onChange={onChange}
    placeholder="루틴명 입력"
    autoComplete="off"
  />
));

const RoutineAdd = () => {
  const { routineData, setRoutineData } = useOutletContext();
  const filterRef = useRef();

  // 운동리스트 정보 
  const [init, setInit] = useState([]);
  const [list, setList] = useState([]);
  const [routineTitle, setRoutineTitle] = useState("");
  const [category, setCategory] = useState([]);
  const [pendingNav, setPendingNav] = useState(false);

  const getWorkOut = async () => {
    const response = await axios.get("/routine/workout");
    setInit(response.data.list);
    setList(response.data.list);
    const categories = Array.from(new Set(response.data.list.map((workout) => workout.pt_category)));
    setCategory(categories);
  };

  useEffect(() => {
    getWorkOut();
  }, []);

  const handleSearch = () => {};

  // 카테고리 열기
  const handleFilter = () => {
    const target = filterRef.current;
    target.classList.toggle("on");
  };

  const nav = useNavigate();

  // 루틴 추가 버튼 클릭
  const handleButton = () => {
    if(routineTitle === ""){
      alert("루틴명을 작성해주세요.");
      return;
    }
    if(routineData.list.length > 0){
      setRoutineData({
        ...routineData,
        name: routineTitle
      });
      setPendingNav(true); // 상태 반영 후 이동 예약
    }else{
      alert("하나 이상의 운동을 선택해주세요.");
    }
  };

  // routineData.name이 변경된 후에만 이동
  useEffect(() => {
    if (pendingNav && routineData.name === routineTitle) {
      nav('/routine/set');
      setPendingNav(false);
    }
    // eslint-disable-next-line
  }, [pendingNav, routineData.name, routineTitle, nav]);

  const handleRoutineTitle = (e) => {
    setRoutineTitle(e.target.value);
  };

  return (
    <RoutineAddWrapper>
      <RoutineTitleInputBox value={routineTitle} onChange={handleRoutineTitle} />
      <SearchBox>
        <input type="text" placeholder='운동 검색'/>
        <button onClick={handleSearch} type="button">검색</button>
      </SearchBox>
      <FilterCTA onClick={handleFilter}>부위 선택</FilterCTA>
      <WorkoutFilter init={init} setList={setList} filterRef={filterRef} category={category}/>
      <WorkoutList routineData={routineData} setRoutineData={setRoutineData} list={list}/>  
      <RoutineAddCTA onClick={handleButton}>루틴 추가</RoutineAddCTA>
    </RoutineAddWrapper>
  );
};

export default RoutineAdd;