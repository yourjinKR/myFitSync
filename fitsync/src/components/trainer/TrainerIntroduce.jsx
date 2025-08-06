import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import ImageModal from './ImageModal';

// 기존 Section 스타일과 동기화된 입력/이미지 스타일
const Container = styled.div`
  padding-left: 25px;
  padding-right: 25px;
  @media (max-width: 500px) {
    padding-left: 12px;
    padding-right: 12px;
  }
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 20px;
  
  /* 이미지가 4장 이상일 때 더보기 상태에서는 2행으로 표시 */
  &.expanded {
    grid-template-rows: repeat(2, 1fr);
  }
`;

const ImageBox = styled.div`
  position: relative;
  background-color: var(--bg-tertiary);
  width: 100%;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  font-size: 1.6rem;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid var(--border-light);
  transition: border 0.18s, background 0.18s;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    border-radius: 10px;
    object-fit: cover;
    background: var(--bg-tertiary);
  }

  &:hover {
    border: 2px solid var(--primary-blue);
    background: var(--bg-secondary);
  }
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 6px;
  right: 6px;
  background: rgba(0,0,0,0.7);
  border: none;
  color: #fff;
  font-weight: bold;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  cursor: pointer;
  line-height: 20px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  z-index: 2;
  transition: background 0.18s;
  &:hover {
    background: var(--warning);
  }
`;

const MoreOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.4rem;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.3s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
`;

const MoreText = styled.div`
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 4px;
`;

const MoreCount = styled.div`
  font-size: 1.3rem;
  opacity: 0.9;
`;

const Description = styled.p`
  font-size: 1.5rem;
  color: var(--text-primary);
  line-height: 1.7;
  white-space: pre-line;
  margin-top: 12px;
`;

const EditTextarea = styled.textarea`
  width: 100%;
  font-size: 1.5rem;
  color: var(--text-primary);
  background: var(--bg-tertiary);
  border: 2px solid var(--border-medium);
  border-radius: 10px;
  padding: 15px;
  margin-top: 12px;
  margin-bottom: 12px;
  line-height: 1.7;
  resize: none;
  min-height: 140px;
  max-height: 350px;
  height: auto;
  overflow-y: auto;
  transition: border 0.18s, background 0.18s;
  &:focus {
    border: 2px solid var(--primary-blue);
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
  const [showAllImages, setShowAllImages] = useState(false);
  const inputRefs = useRef([]);
  const textareaRef = useRef(null);

  useEffect(() => {
    setResolvedImages(images);
    setShowAllImages(false); // 이미지가 변경될 때마다 더보기 상태 초기화
  }, [images]);

  // 텍스트 영역 자동 높이 조절
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = '140px'; // 최소 높이로 초기화
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, 140), 350);
      textarea.style.height = newHeight + 'px';
    }
  };

  // description이 변경될 때마다 높이 조절
  useEffect(() => {
    if (isEdit && textareaRef.current) {
      setTimeout(adjustTextareaHeight, 0); // 다음 렌더링 사이클에서 실행
    }
  }, [description, isEdit]);

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

  const handleShowMore = () => {
    setShowAllImages(true);
  };

  const hasMoreImages = resolvedImages.length > 3;
  const displayImages = showAllImages ? resolvedImages : resolvedImages.slice(0, 3);

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
                  <span style={{ fontSize: '2.8rem', color: 'var(--text-tertiary)' }}>+</span>
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
            ref={textareaRef}
            value={description || ''}
            onChange={(e) => {
              onChange('description', e.target.value);
              setTimeout(adjustTextareaHeight, 0);
            }}
            onInput={adjustTextareaHeight}
            onFocus={adjustTextareaHeight}
            placeholder="선생님 소개를 입력해 주세요."
          />
        </>
      ) : (
        <>
          <ImageGrid className={showAllImages && hasMoreImages ? 'expanded' : ''}>
            {displayImages.map((img, i) => (
              <ImageBox
                key={i}
                onClick={() => handleImageClick(img, i)}
                style={{ cursor: img?.url ? 'pointer' : 'default', position: 'relative' }}
              >
                {img?.url ? (
                  <>
                    <img src={img.url} alt={`trainer-img-${i}`} />
                    {/* 3번째 이미지이고 더 많은 이미지가 있을 때 더보기 오버레이 표시 */}
                    {i === 2 && hasMoreImages && !showAllImages && (
                      <MoreOverlay onClick={(e) => {
                        e.stopPropagation();
                        handleShowMore();
                      }}>
                        <MoreText>더보기</MoreText>
                        <MoreCount>+{resolvedImages.length - 3}장</MoreCount>
                      </MoreOverlay>
                    )}
                  </>
                ) : null}
              </ImageBox>
            ))}
          </ImageGrid>
          <Description>{description || '아직 소개글이 작성되지 않았습니다.'}</Description>
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
