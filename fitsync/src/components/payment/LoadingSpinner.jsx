import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
`;

const Spinner = styled.div`
  width: 4rem;
  height: 4rem;
  border: 4px solid var(--border-light);
  border-top: 4px solid var(--primary-blue);
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 2rem;
`;

const Message = styled.p`
  color: var(--text-secondary);
  font-size: 1.6rem;
  margin: 0;
`;

const LoadingSpinner = ({ message = "로딩 중..." }) => {
  return (
    <Container>
      <Spinner />
      <Message>{message}</Message>
    </Container>
  );
};

export default LoadingSpinner;
