import React from 'react';
import styled from 'styled-components';

const ProfileWrapper = styled.div`
  display:flex;
  justify-content:center;
  align-items:center;
  flex-direction: column; 
  gap:10px;
`;
const ImgBox = styled.div`
  width:50px;
  height:50px;
  border-radius:50%;
  overflow:hidden;
  border:1px solid #ccc;
`;

const TrainerProfile = ({idx}) => {
  return (
    <ProfileWrapper>
      <ImgBox>
        <img src="" alt="" />
      </ImgBox>
      <p>트레이너 {idx}</p>
    </ProfileWrapper>
  );
};

export default TrainerProfile;