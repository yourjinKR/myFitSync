import React from 'react';
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
`;

const Img = styled.img`
  max-width: 100%;
  max-height: 100%;
  border-radius: 8px;
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
`;

const ImageModal = ({ src, alt, onClose }) => {
  return (
    <Overlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <Img src={src} alt={alt} />
        <CloseButton onClick={onClose} aria-label="닫기">&times;</CloseButton>
      </ModalContent>
    </Overlay>
  );
};

export default ImageModal;
