import React, { useState } from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ImgBox = styled.div`
  width: 380px;
  height: 380px;
  max-width: 80vw;
  max-height: 80vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  @media (max-width: 500px) {
    width: 90vw;
    height: 90vw;
    max-width: 95vw;
    max-height: 95vw;
  }
`;

const Img = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
  background: var(--bg-tertiary);
`;

const CloseButton = styled.button`
  position: absolute;
  top: -10px;
  right: -10px;
  background: #fff;
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-weight: bold;
  z-index: 2;
`;

const NavButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.4);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 38px;
  height: 38px;
  font-size: 1.7rem;
  cursor: pointer;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background: var(--primary-blue);
    color: #fff;
  }
`;

const LeftNav = styled(NavButton)`
  left: -48px;
  @media (max-width: 500px) {
    left: 2px;
  }
`;

const RightNav = styled(NavButton)`
  right: -48px;
  @media (max-width: 500px) {
    right: 2px;
  }
`;

/**
 * images: [{url, ...}] 또는 string[] (url)
 * index: 현재 보여줄 이미지 인덱스
 * onClose: 모달 닫기 함수
 */
const ImageModal = ({ images, index = 0, alt, onClose }) => {
  const [current, setCurrent] = useState(index);

  const imgList = Array.isArray(images) ? images : [images];
  const total = imgList.length;

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrent((prev) => (prev - 1 + total) % total);
  };
  const handleNext = (e) => {
    e.stopPropagation();
    setCurrent((prev) => (prev + 1) % total);
  };

  const imgSrc = typeof imgList[current] === 'string'
    ? imgList[current]
    : imgList[current]?.url || '';

  return (
    <Overlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        {total > 1 && (
          <LeftNav onClick={handlePrev} aria-label="이전 이미지">
            &#60;
          </LeftNav>
        )}
        <ImgBox>
          <Img src={imgSrc} alt={alt} />
          <CloseButton onClick={onClose} aria-label="닫기">&times;</CloseButton>
        </ImgBox>
        {total > 1 && (
          <RightNav onClick={handleNext} aria-label="다음 이미지">
            &#62;
          </RightNav>
        )}
      </ModalContent>
    </Overlay>
  );
};

export default ImageModal;
