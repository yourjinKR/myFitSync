import React from 'react';
import styled from 'styled-components';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useNavigate } from 'react-router-dom';


const RoutineWrapper = styled.div`
  border:1px solid #ccc;
  margin-top:15px;
  padding: 15px 15px 30px;
  position:relative;
  & > p {
    width:100%;
    text-align:center;
    font-size:1.8rem;
    padding-top: 20px;
  }
`;
const Inner = styled.div`
  display:flex;
  justify-content: space-between;
  & > h3{
    font-size:1.6rem;
  }
`;

const ControlBox = styled.div`
  position:absolute;
  right:10px;
  top:40px;
  display:flex;
  flex-direction: column;
  border:1px solid #ccc;
  border-radius:5px;
  display:none;
  .on & {
    display: flex;
  }
  & > button {
    padding: 5px;
    border-bottom:1px solid #ccc;
    &:last-child {
      border-bottom:0;
    }
  }
`;

const Routine = ({idx, name}) => {
  
  const nav = useNavigate();

  const handleGoRoutine = (e) => {
    if(e.target.tagName !== 'path' && e.target.tagName !== 'svg' && e.target.tagName !== 'button' && e.target.tagName !== 'BUTTON'){
      nav(`/routine/${idx}`);
    }
  }
  const handleRoutineEdit = (e) => {
    e.target.closest(RoutineWrapper).classList.add("on");
  }

  return (
    <RoutineWrapper onClick={handleGoRoutine}>
      <Inner>
        <h3>{name}</h3>
        <button onClick={handleRoutineEdit}>
          <MoreHorizIcon fontSize='large'/>
        </button>
      </Inner>
      <p>운동하러가기</p>
      <ControlBox>
        <button>루틴편집</button>
        <button>루틴삭제</button>
      </ControlBox>
    </RoutineWrapper>
  );
};

export default Routine;