import React from 'react';
import styled from 'styled-components';
import ReviewList from './review/ReviewList';
import { useNavigate } from 'react-router-dom';

const MainWrapper = styled.div`
  position:relative;
  padding: 15px;
`;
const Slogan = styled.h3`
  font-size:2.4rem;
  word-break:keep-all;
`;

const FindTrainerCTA = styled.button`
  border-radius:10px;
  box-shadow:0 0 5px rgba(0,0,0,0.1);
  width:100%;
  padding: 30px;
  font-size:3rem;
  margin:15px 0;
  border:1px solid #ccc;
`;

const Main = () => {

  const nav = useNavigate();
  const handleCTA = () => {
    nav('/trainer/search');
  }

  return (
    <>
      <MainWrapper>
        <Slogan>나에게 꼭 맞는 트레이너,<br/>지금 바로 찾아보세요!</Slogan>
        <FindTrainerCTA onClick={handleCTA}>
          PT찾기
        </FindTrainerCTA>
      </MainWrapper>
      <ReviewList/>
    </>
  );
};

export default Main;