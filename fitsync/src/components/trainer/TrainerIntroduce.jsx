import axios from 'axios';
import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import ImageModal from './ImageModal';

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 16px;
`;

const ImageBox = styled.div`
  position: relative;   /* X 버튼 위치 위해 필요 */
  background-color: #e2e2e2;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
  font-size: 1rem;
  border-radius: 6px;
  overflow: hidden;

  img {
    max-width: 100%;
    max-height: 100%;
  }
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 2px;
  right: 2px;
  background: rgba(0,0,0,0.6);
  border: none;
  color: white;
  font-weight: bold;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
  line-height: 16px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Description = styled.p`
  font-size: 1.15rem;
  color: var(--text-secondary);
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

const TrainerIntroduce = ({ images = [], description, isEdit, onChange, onImageUpload }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImgSrc, setModalImgSrc] = useState(null);
  const inputRefs = React.useRef([]);

    // 이미지 클릭 시 모달 열기
  const handleImageClick = (img) => {
    if (!isEdit && img?.url) {
      setModalImgSrc(img.url);
      setModalOpen(true);
    }
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setModalOpen(false);
    setModalImgSrc(null);
  };

  const handleFileChange = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await onImageUpload(formData);
      const { attach_idx, url } = res;

      console.log('[업로드 결과]', res);              // { attach_idx, url }
      console.log('[수정 전 images]', images);        // 이전 이미지 배열
      console.log('[새로 들어갈 위치]', index);       // 어디에 들어가는지
      console.log('[추가될 항목]', { id: attach_idx, url });

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

  // 삭제 핸들러
  const handleRemove = async (index) => {
    const attachIdToDelete = images[index]?.id;
    if (!attachIdToDelete) return;

    try {
      await axios.delete(`/trainer/upload/${attachIdToDelete}`, { withCredentials: true });
      // 삭제 성공 시 state 갱신
      const updated = [...images];
      updated.splice(index, 1);
      onChange('images', updated);
    } catch (err) {
      console.error('이미지 삭제 실패', err);
      alert('이미지 삭제 실패');
    }
  };

  return (
    <>
      {isEdit ? (
        <>
          <ImageGrid>
            {[...Array(6)].map((_, i) => (
              <ImageBox key={i} onClick={() => handleClick(i)} style={{ cursor: 'pointer' }}>
                {images[i]?.url ? (
                  <>
                    <img src={images[i].url} alt={`img-${i}`} />
                    <RemoveButton
                      onClick={(e) => {
                        e.stopPropagation(); // 클릭 이벤트 버블링 막기 (파일 업로드 클릭 방지)
                        handleRemove(i);
                      }}
                      aria-label="이미지 삭제"
                      type="button"
                    >
                      ×
                    </RemoveButton>
                  </>
                ) : (
                  '+'
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
          <Textarea
            value={description}
            onChange={(e) => onChange('description', e.target.value)}
          />
        </>
      ) : (
        <>
          <ImageGrid>
            {images.map((img, i) => (
              <ImageBox key={i} onClick={() => handleImageClick(img)} style={{ cursor: img?.url ? 'pointer' : 'default' }}>
                {img?.url ? <img src={img.url} alt={`trainer-img-${i}`} style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '6px' }} /> : null}
              </ImageBox>
            ))}
          </ImageGrid>
          <Description>{description}</Description>
          {modalOpen && <ImageModal src={modalImgSrc} alt="확대 이미지" onClose={handleCloseModal} />}
        </>
      )}
    </>
  );
};

export default TrainerIntroduce;
