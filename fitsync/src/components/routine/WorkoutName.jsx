import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import CheckIcon from '@mui/icons-material/Check';

const WorkoutWrapper = styled.div`
  input {
    position: absolute;
    left: -9999px;
    overflow: hidden;
    height: 0;
  }
  label {
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--border-light);
    padding: 15px;
    gap: 10px;
    background: var(--bg-secondary);
    cursor: pointer;
    transition: background 0.2s;
    &:active {
      background: var(--bg-tertiary);
    }
    
    svg{
      width: 32px;
      height: 32px;
    }
  
  }
`;

const ImgBox = styled.div`
  border: 1px solid var(--border-light);
  background: var(--bg-primary);
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
    background: var(--bg-primary);
  }
`;

const InfoBox = styled.div`
  width: calc(100% - 112px);
  dl {
    margin: 0;
  }
  dt {
    font-size: 1.6rem;
    font-weight: bold;
    color: var(--text-primary);
  }
  dd {
    font-size: 1.4rem;
    color: var(--text-secondary);
    margin: 0;
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
    const selectedCategory = workoutRef.current.dataset['category'];

    if (chk) {
      // 이미 추가된 운동인지 확인 (더 정확한 비교)
      const exists = routineData.routines.some(item => 
        item.pt_idx === selectedValue || 
        (item.pt && item.pt.pt_idx === selectedValue)
      );
      if (!exists) {
        setRoutineData({
          ...routineData,
          routines: [
            ...routineData.routines,
            {
              pt : {pt_idx: selectedValue, pt_name: selectedName, pt_category: selectedCategory},
              pt_idx: selectedValue,
              routine_idx : null,
              routine_list_idx : routineData.routine_list_idx,
              routine_memo: null,
              sets: [{
                routins_idx: null,
                set_num: 1,
                set_volume: 0,
                set_count: 0,
                id: `${selectedValue}-0-${Date.now()}`
              }]
            }
          ]
        });
      }
    } else {
      // 체크 해제된 경우: 해당 운동 제거 (더 정확한 비교)
      setRoutineData({
        ...routineData,
        routines: routineData.routines.filter(item => 
          item.pt_idx !== selectedValue && 
          !(item.pt && item.pt.pt_idx === selectedValue)
        )
      });
    }

    // eslint-disable-next-line
  }, [chk]);

  // 체크박스의 checked 상태를 routineData.routines와 동기화
  useEffect(() => {
    const selectedValue = parseInt(data.pt_idx);
    const checked = routineData.routines.some(item => 
      item.pt_idx === selectedValue || 
      (item.pt && item.pt.pt_idx === selectedValue)
    );
    setChk(checked);
    if (workoutRef.current) {
      workoutRef.current.checked = checked;
    }
    // eslint-disable-next-line
  }, [routineData.routines, data.pt_idx]);

  return (
    <WorkoutWrapper>
      <input
        type="checkbox"
        onChange={handleWorkOut}
        ref={workoutRef}
        data-pt={data.pt_name}
        data-category={data.pt_category}
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
        {chk && <CheckIcon />}
      </label>
    </WorkoutWrapper>
  );
};

export default React.memo(WorkoutName);