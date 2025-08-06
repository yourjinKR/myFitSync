import React, { useState } from 'react';
import styled from 'styled-components';
import RoutineList from './RoutineList';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import Routine from './Routine';
import { BsStars } from "react-icons/bs";
import { PiStarFourFill } from "react-icons/pi";
import { useSubscription } from '../../hooks/useSubscription';
import GradientButton from '../ai/GradientButton';

const RoutineWrapper = styled.div`
  padding: 2rem;
  position: relative;
  background: var(--bg-primary);
  min-height: calc(100vh - 150px);

  /* 더 이상 button 스타일 지정 X */

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

    /* section-top 내부의 버튼만 별도 유지 */
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

const BaseButton = styled.button`
  font-size: 1.6rem;
  font-weight: 600;
  padding: 1.6rem 2rem;
  border-radius: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 0;

  &:active {
    transform: translateY(1px);
  }

  @media (max-width: 480px) {
    font-size: 1.4rem;
    padding: 1.2rem 1.6rem;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1.2rem;
  width: 100%;
  margin-bottom: 2rem;

  @media (max-width: 480px) {
    gap: 1rem;
  }
`;

export const PrimaryButton = styled(BaseButton)`
  background: var(--primary-blue);
  color: var(--text-primary);
  border: 2px solid var(--primary-blue);
  
  &:hover {
    background: var(--primary-blue-hover);
    border-color: var(--primary-blue-hover);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
  }
`;

// 플로팅 버튼 스타일
const FloatingButton = styled.div`
  position: fixed;
  bottom: 100px;
  right: 50%;
  z-index: 1000;
  margin-right : -350px;
  
  @media (max-width: 750px) {
    right: 5%;
    margin-right : 0;
  }
`;

const RoutineView = () => {
  const { tempData, setTempData } = useOutletContext();
  const [isView, setIsView] = useState(2); // 최대 노출 개수
  
  const location = useLocation();
  const { state } = location;
  const isTrainerView = state?.viewer === 'trainer';
  const targetMemberIdx = state?.targetMember;
  
  const { 
    isSubscriber, 
  } = useSubscription();
  
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
      <ButtonContainer>
        <PrimaryButton onClick={() => handleAddRoutine("custom")}>
          빠른 기록&emsp;+
        </PrimaryButton>
        {isSubscriber && (
          <GradientButton flex={true} onClick={() => nav('/ai/routine')}>
            AI 추천&emsp;
            <BsStars style={{ fontSize: "1.7rem", position: "relative", zIndex: 2}}/>
          </GradientButton>
        )}
      </ButtonContainer>

      {/* 구독자가 아닐 때 플로팅 버튼 표시 */}
      {!isSubscriber && (
        <FloatingButton>
          <GradientButton 
            circular={true} 
            size="large" 
            onClick={() => nav('/subscription')}
          >
            <BsStars style={{ fontSize: "2.2rem" }} />
          </GradientButton>
        </FloatingButton>
      )}
      
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