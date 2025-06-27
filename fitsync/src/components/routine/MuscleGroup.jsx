import React from 'react';
import styled from 'styled-components';
import CheckIcon from '@mui/icons-material/Check';

const MuscleWrapper = styled.div`
  & > input{
    position:absolute;
    left:-9999px;
    height:0;
    overflow:hidden;
  }
`;
const MuscleInner = styled.label`
  display:flex;
  border-bottom:1px solid #ccc;
  padding:15px;
  gap:10px;
  align-items:center;
`;
const ImgBox = styled.div`
  border:1px solid #ccc;
  width:60px;
  height:60px;
`;
const InfoBox = styled.div`
  font-size:1.6rem;
  font-weight:bold;
  width:calc(100% - 112px);
`;

const MuscleGroup = ({data, muscle, setMuscle, idx}) => {

  const handleChangeInput = (e) => {
    setMuscle(e.target.value);
  }

  return (
    <MuscleWrapper>
      <input 
        type="radio" 
        onChange={handleChangeInput} 
        checked={parseInt(muscle) === parseInt(idx)} 
        value={idx} name='muscle' 
        id={`muscle${idx}`} data-name={data} />

      <MuscleInner htmlFor={`muscle${idx}`}>
        <ImgBox>
          <img src="" alt="" />
        </ImgBox>
        <InfoBox>
          {data}
        </InfoBox>
        {
          parseInt(muscle) === parseInt(idx) ?
          <CheckIcon style={{ color: 'green', fontSize: '32px' }} /> : 
          <></> 
        }
      </MuscleInner>
    </MuscleWrapper>
  );
};

export default MuscleGroup;