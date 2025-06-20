import React from 'react';
import styled from 'styled-components';
import MoneyFormatter from '../../util/MoneyFormatter';

const InfoWrapper = styled.div`
  display:flex;
  border-bottom:1px solid #ccc;
  padding:10px;
  gap:10px;
  align-items:center;
`;

const InfoBox = styled.div`
  width: calc(100% - 155px);
`;

const ImgBox = styled.div`
  width: 75px;
  height: 75px;
  border: 1px solid #ccc;
`;
const ChatCTA = styled.button`
  border-radius:5px;
  padding: 5px 10px;
  border:1px solid #ccc;
`;

const TrainerInfo = ({idx}) => {

  return (
    <InfoWrapper>
      <ImgBox>
        <img src="" alt="" />
      </ImgBox>
      <InfoBox>
        <h3>트레이너 {idx}</h3>
        <p>트레이너 설명</p>
        <p>가격 : <MoneyFormatter amount={100000}/>원</p>
      </InfoBox>
      <ChatCTA>1:1 상담</ChatCTA>
    </InfoWrapper>
  );
};

export default TrainerInfo;