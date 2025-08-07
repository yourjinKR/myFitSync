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
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 80vw;
  height: 80vh;
  
  @media (max-width: 768px) {
    width: 85vw;
    height: 70vh;
  }
  
  @media (max-width: 500px) {
    width: 90vw;
    height: 60vh;
  }
`;

const Img = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
`;

const CloseButton = styled.button`
  position: fixed;
  top: 30px;
  right: 30px;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  border-radius: 50%;
  font-size: 2rem;
  width: 40px;
  height: 40px;
  cursor: pointer;
  font-weight: bold;
  z-index: 1001;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: scale(1.1);
  }
  
  @media (max-width: 500px) {
    top: 20px;
    right: 20px;
    width: 35px;
    height: 35px;
    font-size: 1.8rem;
  }
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
  left: calc(10vw - 60px);
  @media (max-width: 768px) {
    left: calc(7.5vw - 50px);
  }
  @media (max-width: 500px) {
    left: calc(5vw - 40px);
  }
`;

const RightNav = styled(NavButton)`
  right: calc(10vw - 60px);
  @media (max-width: 768px) {
    right: calc(7.5vw - 50px);
  }
  @media (max-width: 500px) {
    right: calc(5vw - 40px);
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
      <CloseButton onClick={onClose} aria-label="닫기">&times;</CloseButton>
      <ModalContent onClick={e => e.stopPropagation()}>
        {total > 1 && (
          <LeftNav onClick={handlePrev} aria-label="이전 이미지">
            &#60;
          </LeftNav>
        )}
        <ImgBox>
          <Img src={imgSrc} alt={alt} />
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
