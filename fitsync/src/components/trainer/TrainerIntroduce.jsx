import React, { useRef } from 'react';
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

const TrainerIntroduce = ({ images, description, isEdit, onChange, onImageUpload }) => {
  const inputRefs = useRef([]);

  const handleFileChange = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await onImageUpload(formData); // ✅ 너가 말한 위치!
      const url = res?.url;

      if (url) {
        const updated = [...images];
        updated[index] = url;
        onChange('images', updated);
      }
    } catch (err) {
      console.error('업로드 실패:', err);
      alert('이미지 업로드 실패');
    }
  };

  const handleClick = (index) => {
    inputRefs.current[index]?.click();
  };

  return (
    <>
      {isEdit ? (
        <>
          <ImageGrid>
            {[...Array(6)].map((_, i) => (
              <ImageBox key={i} onClick={() => handleClick(i)} style={{ cursor: 'pointer' }}>
                {images[i] ? images[i] : '+'}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  ref={(el) => (inputRefs.current[i] = el)}
                  onChange={(e) => handleFileChange(e, i)}
                />
              </ImageBox>
            ))}
          </ImageGrid>
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
