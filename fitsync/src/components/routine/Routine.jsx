import React from 'react';
import styled from 'styled-components';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


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

const Routine = ({ data, onDelete }) => {
  
  const nav = useNavigate();

  const handleGoRoutine = (e) => {
    if(e.target.tagName !== 'path' && e.target.tagName !== 'svg' && e.target.tagName !== 'button' && e.target.tagName !== 'BUTTON'){
      nav(`/routine/detail/${data.routine_list_idx}`);
    }
  }
  const handleRoutineEdit = (e) => {
    e.target.closest(RoutineWrapper).classList.add("on");
  }

  const handleRoutineDelete = async (e) => {
    if (window.confirm("정말로 루틴을 삭제하시겠습니까?")) {
      try {
        const response = await axios.delete(`/routine/delete/${data.routine_list_idx}`, {
          withCredentials: true
        });
        const result = response.data;
        if (result.success) {
          alert(result.msg);
          if (onDelete) onDelete(); // 삭제 후 목록 갱신
        } else {
          alert(result.msg);
        }
      } catch (error) {
        console.error("루틴 삭제 중 오류 발생:", error);
      }
    }
  }
  return (
    <RoutineWrapper onClick={handleGoRoutine}>
      <Inner>
        <h3>{data.routine_name}</h3>
        <button onClick={handleRoutineEdit}>
          <MoreHorizIcon fontSize='large'/>
        </button>
      </Inner>
      <p>운동하러가기</p>
      <ControlBox>
        <button>루틴편집</button>
        <button onClick={handleRoutineDelete}>루틴삭제</button>
      </ControlBox>
    </RoutineWrapper>
  );
};

export default Routine;