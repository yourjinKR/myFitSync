import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import CheckIcon from '@mui/icons-material/Check';

const WorkoutWrapper = styled.div`
  & {
    input {
      position:absolute;
      left:-9999px;
      overflow:hidden;
      height:0;
    }
    label{
      display:flex;
      align-items:center;
      border-bottom:1px solid #ccc;
      padding:15px;
      gap:10px;
    }
  }
`;
const ImgBox = styled.div`
  border:1px solid #ccc;
  width:60px;
  height:60px;
`;
const InfoBox = styled.div`
  width:calc(100% - 112px);
  dt {
    font-size:1.6rem;
    font-weight:bold;
  }
  dd {
      font-size:1.4rem;
  }
`;

const WorkoutName = ({ idx, routineData, setRoutineData }) => {
  const isChecked = false;
  const [chk, setChk] = useState(isChecked);
  const workoutRef = useRef();
  
  
  const handleWorkOut = () => {
    setChk(workoutRef.current.checked);
  }
  useEffect(() => {
    const selectedValue = parseInt(workoutRef.current.value);
    
    if (chk) {
      // 배열에 값이 없으면 추가
      if (!routineData.exercises.includes(selectedValue)) {
        setRoutineData({
          ...routineData,
          exercises: [...routineData.exercises, selectedValue],
        });
      }
    } else {
      // 체크 해제된 경우: 해당 값 제거
      setRoutineData({
        ...routineData,
        exercises: routineData.exercises.filter(val => val !== selectedValue),
      });
    }
  }, [chk])

  return (
    <WorkoutWrapper>
      <input type="checkbox" onChange={handleWorkOut} ref={workoutRef} name='workout[]' value={idx} id={`workout${idx}`} />
      <label htmlFor={`workout${idx}`}>
        <ImgBox>
          <img src="" alt="" />
        </ImgBox>
        <InfoBox>
          <dl>
            <dt>운동명</dt>
            <dd>운동 부위</dd>
          </dl>
        </InfoBox>
        {
          chk ?
            <CheckIcon style={{ color: 'green', fontSize: '32px' }} /> :
            <></>
        }
      </label>
    </WorkoutWrapper>
  );
};

export default WorkoutName;