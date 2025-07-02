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

const Textarea = styled.textarea`
  width: 100%;
  font-size: 1.1rem;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
  line-height: 1.6;
  resize: vertical;
  min-height: 100px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  margin-bottom: 6px;
  font-size: 1rem;
  border-radius: 6px;
  border: 1px solid #ccc;
`;

const TrainerIntroduce = ({ images, description, isEdit, onChange }) => {
  return (
    <>
      {isEdit ? (
        <>
          <div style={{ marginBottom: '10px' }}>
            {images.map((img, i) => (
              <Input
                key={i}
                value={img}
                onChange={(e) => {
                  const updated = [...images];
                  updated[i] = e.target.value;
                  onChange('images', updated);
                }}
              />
            ))}
          </div>
          <Textarea
            value={description}
            onChange={(e) => onChange('description', e.target.value)}
          />
        </>
      ) : (
        <>
          <ImageGrid>
            {images.map((img, i) => (
              <ImageBox key={i}>{img}</ImageBox>
            ))}
          </ImageGrid>
          <Description>{description}</Description>
        </>
      )}
    </>
  );
};

export default TrainerIntroduce;
