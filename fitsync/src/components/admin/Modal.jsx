import React, { useEffect } from 'react';
import styled from 'styled-components';

const DetailModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: var(--bg-white);
  padding: 20px;
  border-radius: 5px;
  max-width: 600px;
  width: 80%;

  h3 {
    color: var(--text-black);
    text-align: center;
    font-size: 3rem;
    font-weight:bold;
  }
  textarea {
    width: 100%;
    height: 100px;
    padding: 10px;
    font-size: 1.6rem;
    border: 1px solid var(--border-light);
    border-radius: 4px;
    resize: none;
    margin: 10px 0;
    background: var(--bg-white);
    color: var(--text-black);
  }
  img {
    width: 100%;
    display: block;
  }
`;

const Modal = ({modalOpen, setModalOpen, modalData, setModalData}) => {
  useEffect(() => {
    if (!modalOpen) {
      if(modalData !== null) {
        setModalData(null);
      }
    }
  }, [modalOpen]);

  return (
    <>
      {modalOpen && (
          <DetailModal onClick={() => setModalOpen(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              {modalData}
            </ModalContent>
          </DetailModal>
        )}
    </>
  );
};

export default Modal;