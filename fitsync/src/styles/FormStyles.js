import styled, { css } from 'styled-components';

export const FormGroup = styled.div`
  margin-bottom: 22px;
`;

export const Label = styled.label`
  display: block;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 7px;
  color: #222;
  span {
    font-size: 0.95rem;
    font-weight: 400;
    color: #7D93FF;
    margin-left: 4px;
  }
`;

const sharedInputStyles = css`
  width: 100%;
  height: 44px;
  padding: 0 12px;
  color: var(--text-black);
  border: 1.5px solid #e3e7f1;
  border-radius: 8px;
  font-size: 1rem;
  background: #f8faff;
  transition: border 0.2s;
  ${(props) =>
    props.$invalid &&
    css`
      border-color: #ff4d4f !important;
      background: #fff0f0;
    `}
  &:focus {
    border-color: ${(props) => (props.$invalid ? '#ff4d4f' : '#7D93FF')};
    outline: none;
    background: #fff;
  }
  @media (max-width: 600px) {
    height: 38px;
    font-size: 0.97rem;
    padding: 0 8px;
  }
`;

export const Input = styled.input`
  ${sharedInputStyles}
`;

export const Select = styled.select`
  ${sharedInputStyles}
  option {
    color: var(--text-black);
  }
`;

export const TextArea = styled.textarea`
  ${sharedInputStyles}
  height: 120px;
  overflow: auto;
  padding: 10px;
`;

export const TimeSelect = styled.select`
  ${sharedInputStyles}
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
`;

export const TimeInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  @media (max-width: 600px) {
    gap: 4px;
  }
`;

export const ButtonSubmit = styled.button`
  width: 100%;
  height: 48px;
  background: linear-gradient(90deg, #7D93FF 0%, #5e72e4 100%);
  font-size: 1.2rem;
  color: #fff;
  border: none;
  border-radius: 8px;
  margin-top: 18px;
  font-weight: 700;
  letter-spacing: 1px;
  cursor: pointer; 
  box-shadow: 0 2px 8px rgba(125,147,255,0.08);
  transition: background 0.2s;

  @media (max-width: 600px) {
    height: 40px;
    font-size: 1rem;
    margin-top: 12px;
  }
`;