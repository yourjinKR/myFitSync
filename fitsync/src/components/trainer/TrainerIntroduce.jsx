// src/components/trainer/TrainerInfoImage.jsx

import React from 'react';
import styled from 'styled-components';

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 16px;
`;

const ImageBox = styled.div`
  background-color: #e2e2e2;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
  font-size: 1rem;
  border-radius: 6px;
`;

const Description = styled.p`
  font-size: 1.15rem;
  color: #444;
  line-height: 1.7;
  white-space: pre-line;
`;

const TrainerIntroduce = ({ images, description }) => {
  return (
    <>
      <ImageGrid>
        {images.map((img, i) => (
          <ImageBox key={i}>{img}</ImageBox>
        ))}
      </ImageGrid>
      <Description>{description}</Description>
    </>
  );
};

export default TrainerIntroduce;
