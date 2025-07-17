import React from 'react';
import styled from 'styled-components';
import RoutineList from './RoutineList';
import { useNavigate, useOutletContext } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import Routine from './Routine';


const RoutineWrapper = styled.div`
  padding: 15px;
  position:relative;
  & > button {
    text-align:center;
    border:1px solid #ccc;
    border-radius:5px;
    padding: 10px;
    width:100%;
    font-size: 2rem;
    line-height:1.2;
    font-weight:bold;
  }

  & > .section-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 20px 0 10px;

    h3{
      font-size:1.8rem;
    }

    button {
      font-size: 3rem;
      color: var(--text-white);
      display: flex;
      align-items: center;
      justify-content: center;
      
      svg {
        width: 30px;
        height: 30px;
      }
    }
  }
`;

const TempDataWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
`;


const RoutineView = () => {
  const { tempData, setTempData } = useOutletContext();
  const nav = useNavigate();
  const handleAddRoutine = (type) => {
    if (type === "custom") {
      nav('/routine/detail/custom');
    } else {
      nav('/routine/add');
    }
  }

  return (
    <RoutineWrapper>
      <button onClick={() => handleAddRoutine("custom")}>빠른 기록&emsp;+ </button>
      {/* 최대 두개 노출 이후 더보기 */}
      {tempData.length > 0 ?
        <>
          <div className='section-top'>
            <h3>미기록 운동</h3>
          </div>
          <TempDataWrapper >
            {
              tempData.map((item, idx) => (
                <Routine key={idx} data={item} type="custom" setTempData={setTempData} />
              ))
            }
          </TempDataWrapper>
        </> : <></>
      }

      <>
        <div className='section-top'>
          <h3>내 루틴</h3>
          <button onClick={handleAddRoutine}><AddIcon/></button>
        </div>
        <RoutineList />
      </>

    </RoutineWrapper>
  );
};

export default RoutineView;