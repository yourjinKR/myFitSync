import React, { useState } from 'react';
import styled from 'styled-components';
import RoutineList from './RoutineList';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import Routine from './Routine';


const RoutineWrapper = styled.div`
  padding: 2rem;
  position: relative;
  background: var(--bg-primary);
  min-height: 100vh;
  
  & > button {
    background: var(--primary-blue);
    color: var(--text-primary);
    border: 2px solid var(--primary-blue);
    border-radius: 12px;
    padding: 1.6rem 2rem;
    width: 100%;
    font-size: 1.6rem;
    font-weight: 600;
    transition: all 0.2s ease;
    
    &:active {
      transform: translateY(0);
    }
  }

  & > .section-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 3rem 0 1.5rem;
    padding: 0 0.5rem;

    h3 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    button {
      background: var(--bg-tertiary);
      color: var(--text-primary);
      border: 1px solid var(--border-light);
      border-radius: 8px;
      padding: 0.8rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      
      svg {
        width: 2.4rem;
        height: 2.4rem;
        color: white;
        background: var(--primary-blue);
        border-radius: 50%;
        padding: 0.4rem;
      }
    }
  }
`;

const TempDataWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-top: 2rem;
  
  @media (max-width: 650px) {
    gap: 1rem;
  }
`;

const MoreCTA = styled.button`
  width: 100%;
  padding: 0 10px;
  text-align: center;
  font-size: 1.8rem;

  svg {
    width: 35px;
    height: 35px;
  }
`;


const RoutineView = () => {
  const { tempData, setTempData } = useOutletContext();
  const [isView, setIsView] = useState(2); // 최대 노출 개수
  
  const location = useLocation();
  const { state } = location;
  const isTrainerView = state?.viewer === 'trainer';
  const targetMemberIdx = state?.targetMember;
  

  
  const nav = useNavigate();
  const handleAddRoutine = (type) => {
    if (type === "custom") {
      nav('/routine/detail/custom',{
        state: { targetMember: targetMemberIdx }
      });
      
    } else {
      nav('/routine/add',{
        state: { targetMember: targetMemberIdx }
      });
    }
  }

  return (
    <RoutineWrapper>
      <button onClick={() => handleAddRoutine("custom")}>빠른 기록&emsp;+ </button>
      {tempData && tempData.length > 0 ?
        <>
          <div className='section-top'>
            <h3>미기록 운동</h3>
          </div>
          <TempDataWrapper >
            {
              tempData.filter((item, idx) => idx < isView).map((item, idx) => (
                <Routine key={idx} data={item} type="custom" setTempData={setTempData} />
              ))
            }
            {
              isView < tempData.length ?
                <MoreCTA onClick={() => setIsView(tempData.length)}>
                  {/* 더보기 */}
                  <KeyboardDoubleArrowDownIcon />
                </MoreCTA>
              :<></>
            }
          </TempDataWrapper>
        </> : 
        <></>
      }

      <>
        <div className='section-top'>
          <h3>내 루틴</h3>
        </div>
        <RoutineList
          handleAddRoutine={handleAddRoutine}
          targetMemberIdx={isTrainerView ? targetMemberIdx : null}
        />
      </>

    </RoutineWrapper>
  );
};

export default RoutineView;