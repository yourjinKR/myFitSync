import styled, { css } from 'styled-components';

export const FormGroup = styled.div`
  margin-bottom: 22px;
`;

export const Label = styled.label`
  display: block;
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 7px;
  color: #222;
  span {
    font-size: 1.4rem;
    font-weight: 400;
    color: #7D93FF;
    margin-left: 4px;
  }
`;

const sharedInputStyles = css`
  width: 100%;
  height: 45px;
  padding: 0 12px;
  color: var(--text-black);
  border: 1.5px solid #e3e7f1;
  border-radius: 8px;
  font-size: 1.4rem;
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
    padding: 0 8px;
  }
`;

export const Input = styled.input`
  ${sharedInputStyles}
  &::placeholder {
    color: var(--text-tertiary);
    font-size: 1.8rem;
  }
`;

export const Select = styled.select`
  ${sharedInputStyles}
  option {
    color: var(--text-black);
    font-size: 1.8rem;
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
  option {
    color: var(--text-black);
    font-size: 1.4rem;
  }
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
  height: 50px;
  background: ${props => props.$invalid ? `${props.$invalid}` :  "var(--primary-blue)"};
  font-size: 2.2rem;
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
    margin-top: 12px;
  }
`;