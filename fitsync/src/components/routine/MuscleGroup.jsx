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
  padding: 1.8rem 1.5rem;
  gap: 1.5rem;
  background: var(--bg-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  &:active {
    background: var(--bg-tertiary);
    transform: translateX(2px);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const ImgBox = styled.div`
  border: 2px solid var(--border-light);
  background: var(--bg-primary);
  width: 8rem;
  height: 8rem;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 10px;
    background: var(--bg-primary);
  }
`;

const InfoBox = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  width: calc(100% - 10rem);
  color: var(--text-primary);
  line-height: 1.4;
`;

const CheckIconWrapper = styled.div`
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 50%;
  background: var(--primary-blue);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  
  svg {
    width: 1.6rem;
    height: 1.6rem;
    color: white;
  }
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
          <CheckIconWrapper>
            <CheckIcon/>
          </CheckIconWrapper>
        ) : null}
      </MuscleInner>
    </MuscleWrapper>
  );
};

export default MuscleGroup;