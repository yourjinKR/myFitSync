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

const WorkoutName = ({ data, routineData, setRoutineData }) => {
  const [chk, setChk] = useState(false);
  const workoutRef = useRef();

  const handleWorkOut = () => {
    setChk(workoutRef.current.checked);
  };

  useEffect(() => {
    const selectedValue = parseInt(workoutRef.current.value);
    const selectedName = workoutRef.current.dataset['pt'];

    if (chk) {
      // 이미 추가된 운동인지 확인
      const exists = routineData.list.some(item => item.exercise === selectedValue);
      if (!exists) {
        setRoutineData({
          ...routineData,
          list: [
            ...routineData.list,
            {
              exercise: selectedValue,
              name: selectedName,
              sets: []
            }
          ]
        });
      }
    } else {
      // 체크 해제된 경우: 해당 운동 제거
      setRoutineData({
        ...routineData,
        list: routineData.list.filter(item => item.exercise !== selectedValue)
      });
    }
    // eslint-disable-next-line
  }, [chk]);

  // 체크박스의 checked 상태를 routineData.list와 동기화
  useEffect(() => {
    const selectedValue = parseInt(data.pt_idx);
    const checked = routineData.list.some(item => item.exercise === selectedValue);
    setChk(checked);
    // eslint-disable-next-line
  }, [routineData.list]);

  return (
    <WorkoutWrapper>
      <input
        type="checkbox"
        onChange={handleWorkOut}
        ref={workoutRef}
        data-pt={data.pt_name}
        name='workout[]'
        value={data.pt_idx}
        id={`workout${data.pt_idx}`}
        checked={chk}
        readOnly
      />
      <label htmlFor={`workout${data.pt_idx}`}>
        <ImgBox>
          <img src={data.pt_image} alt={data.pt_name} />
        </ImgBox>
        <InfoBox>
          <dl>
            <dt>{data.pt_name}</dt>
            <dd>{data.pt_category}</dd>
          </dl>
        </InfoBox>
        {chk && <CheckIcon style={{ color: 'green', fontSize: '32px' }} />}
      </label>
    </WorkoutWrapper>
  );
};

export default React.memo(WorkoutName);