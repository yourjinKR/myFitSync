import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import ImageModal from './ImageModal';

// 기존 Section 스타일과 동기화된 입력/이미지 스타일
const Container = styled.div`
  padding-left: 20px;
  padding-right: 20px;
  @media (max-width: 500px) {
    padding-left: 8px;
    padding-right: 8px;
  }
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 16px;
`;

const ImageBox = styled.div`
  position: relative;
  background-color: var(--bg-tertiary);
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  font-size: 1.3rem;
  border-radius: 8px;
  overflow: hidden;
  border: 1.5px solid var(--border-light);
  transition: border 0.18s, background 0.18s;
  cursor: pointer;

  img {
    max-width: 100%;
    max-height: 100%;
    border-radius: 8px;
    object-fit: cover;
    background: var(--bg-tertiary);
  }

  &:hover {
    border: 1.5px solid var(--primary-blue);
    background: var(--bg-secondary);
  }
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0,0,0,0.7);
  border: none;
  color: #fff;
  font-weight: bold;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  cursor: pointer;
  line-height: 18px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  z-index: 2;
  transition: background 0.18s;
  &:hover {
    background: var(--warning);
  }
`;

const Description = styled.p`
  font-size: 1.13rem;
  color: var(--text-secondary);
  line-height: 1.7;
  white-space: pre-line;
  margin-top: 8px;
`;

const EditTextarea = styled.textarea`
  width: 100%;
  font-size: 1.09rem;
  color: var(--text-primary);
  background: var(--bg-tertiary);
  border: 1.5px solid var(--border-medium);
  border-radius: 8px;
  padding: 12px;
  margin-top: 8px;
  margin-bottom: 8px;
  line-height: 1.7;
  resize: vertical;
  min-height: 100px;
  transition: border 0.18s, background 0.18s;
  &:focus {
    border: 1.5px solid var(--primary-blue);
    background: var(--bg-secondary);
  }
  &::placeholder {
    color: var(--text-tertiary);
    opacity: 1;
  }
`;

const TrainerIntroduce = ({ images = [], description, isEdit, onChange, onImageUpload }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImgIndex, setModalImgIndex] = useState(0);
  const [resolvedImages, setResolvedImages] = useState(images);
  const inputRefs = useRef([]);

  useEffect(() => {
    setResolvedImages(images);
  }, [images]);

  const handleImageClick = (img, idx) => {
    if (!isEdit && img?.url) {
      setModalImgIndex(idx);
      setModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalImgIndex(0);
  };

  const handleFileChange = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await onImageUpload(formData);
      const { attach_idx, url } = res;

      if (attach_idx && url) {
        const updated = [...images];
        updated[index] = { id: attach_idx, url };
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

  const handleRemove = async (index) => {
    const attachIdToDelete = images[index]?.id;
    if (!attachIdToDelete) return;

    try {
      await axios.delete(`/trainer/upload/${attachIdToDelete}`, { withCredentials: true });
      const updated = [...images];
      updated.splice(index, 1);
      onChange('images', updated);
    } catch (err) {
      console.error('이미지 삭제 실패', err);
      alert('이미지 삭제 실패');
    }
  };

  return (
    <Container>
      {isEdit ? (
        <>
          <ImageGrid>
            {[...Array(6)].map((_, i) => (
              <ImageBox key={i} onClick={() => handleClick(i)}>
                {images[i]?.url ? (
                  <>
                    <img src={images[i].url} alt={`img-${i}`} />
                    <RemoveButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(i);
                      }}
                      aria-label="이미지 삭제"
                      type="button"
                    >
                      ×
                    </RemoveButton>
                  </>
                ) : (
                  <span style={{ fontSize: '2.2rem', color: 'var(--text-tertiary)' }}>+</span>
                )}
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
          <EditTextarea
            value={description}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder="선생님 소개를 입력해 주세요."
          />
        </>
      ) : (
        <>
          <ImageGrid>
            {resolvedImages.map((img, i) => (
              <ImageBox
                key={i}
                onClick={() => handleImageClick(img, i)}
                style={{ cursor: img?.url ? 'pointer' : 'default' }}
              >
                {img?.url ? <img src={img.url} alt={`trainer-img-${i}`} /> : null}
              </ImageBox>
            ))}
          </ImageGrid>
          <Description>{description}</Description>
          {modalOpen && (
            <ImageModal
              images={resolvedImages}
              index={modalImgIndex}
              alt="확대 이미지"
              onClose={handleCloseModal}
            />
          )}
        </>
      )}
    </Container>
  );
};

export default TrainerIntroduce;
