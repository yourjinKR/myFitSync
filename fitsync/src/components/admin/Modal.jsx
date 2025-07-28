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
  max-width: 500px;
  width: 80%;

  h3 {
    color: var(--text-black);
    text-align: center;
    font-size: 3rem;
    font-weight:bold;
  }
  select {
    width: 100%;
    padding: 10px;
    font-size: 1.6rem;
    border: 1px solid var(--border-light);
    border-radius: 4px;
    background: var(--bg-white);
    color: var(--text-black);
    option {
      font-size: 1.6rem;
      color: var(--text-black);
    }
  }
  textarea {
    width: 100%;
    height: 100px;
    padding: 10px;
    font-size: 1.6rem;
    border: 1px solid var(--border-light);
    border-radius: 4px;
    resize: none;
    background: var(--bg-white);
    color: var(--text-black);
  }
  img {
    width: 100%;
    display: block;
  }
  ul {
    margin: 15px 0;
  }
  li {
    display: flex;
    align-items: center;
  }
  label{
    color: var(--text-black);
    font-size: 1.8rem;
  }
  input[type="radio"] {
    margin-right: 10px;
  }
  p {
    background: var(--bg-white);
    margin: 10px 0;
    border: 1px solid var(--border-light);
    border-radius: 5px;
    padding: 10px;
    text-align: center;
    color: var(--text-black);
    font-size: 2rem;
  }
  & > table > tbody > tr > th {
    display: flex;
    flex: 1 !important;
    justify-content: center;
    align-items: center;
    color: var(--text-black);
    padding: 0;
  }
  & > table > tbody > tr > td {
    display: flex;
    flex: 4 !important;
    justify-content: flex-start;
    align-items: center;

    input[type="text"] {
      width: 100%;
      padding: 8px 10px;
      font-size: 1.6rem;
      border: 1px solid var(--border-light);
      border-radius: 4px;
      background: var(--bg-white);
      color: var(--text-black);
    }
  
    img {
      border: 1px solid var(--border-light);
      width: 150px;
      cursor: pointer;
    }
    input[type="file"] {
      width: 0;
      height: 0;
      overflow: hidden;
      position: absolute;
      opacity: 0;
      z-index: -1;
    }
  }
  button {
    margin-top: 15px;
  }
`;

const Modal = ({ modalOpen, setModalOpen, modalData, setModalData }) => {

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