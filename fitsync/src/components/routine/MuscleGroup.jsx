import React from 'react';
import styled from 'styled-components';
import CheckIcon from '@mui/icons-material/Check';

const MuscleWrapper = styled.div`
  & > input {
    position: absolute;
    left: -9999px;
    height: 0;
    overflow: hidden;
  }
`;

const MuscleInner = styled.label`
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
  font-size: 1.6rem;
  font-weight: bold;
  width: calc(100% - 112px);
  color: var(--text-primary);
`;

const MuscleGroup = ({ data, muscle, setMuscle, idx }) => {
  const handleChangeInput = (e) => {
    setMuscle(e.target.value);
  };

  return (
    <MuscleWrapper>
      <input
        type="radio"
        onChange={handleChangeInput}
        checked={parseInt(muscle) === parseInt(idx)}
        value={idx}
        name="muscle"
        id={`muscle${idx}`}
        data-name={data}
      />

      <MuscleInner htmlFor={`muscle${idx}`}>
        <ImgBox>
          <img src="" alt="" />
        </ImgBox>
        <InfoBox>
          {data}
        </InfoBox>
        {parseInt(muscle) === parseInt(idx) ? (
          <CheckIcon/>
        ) : null}
      </MuscleInner>
    </MuscleWrapper>
  );
};

export default MuscleGroup;