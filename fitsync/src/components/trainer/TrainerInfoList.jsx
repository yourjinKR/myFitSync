import React from 'react';
import TrainerInfo from './TrainerInfo';
import styled from 'styled-components';

const InfoListWrapper = styled.div`
  border-top:1px solid #ccc;
`;

const TrainerInfoList = () => {

  return (
    <InfoListWrapper>
      {
        [...Array(5)].map((el,idx) => (
          <TrainerInfo idx={idx}/>
        ))
      }
    </InfoListWrapper>
  );
};

export default TrainerInfoList;