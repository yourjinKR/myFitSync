import styled from "styled-components";

// checkbox 스타일링
export const Checklabel = styled.label`
  position: relative;
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-light);
  border-radius: 4px;

  span{
    text-indent: -9999px; 
    display: block;
    width: 0; 
    height: 0; 
    overflow: hidden;
  }
`;

export const CheckInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + ${Checklabel} {
    background-color: var(--check-green);
    border-color: var(--check-green);
  }

  &:checked + ${Checklabel}:before {
    content: "";
    position: absolute;
    left: 6px;
    top: 2px;
    width: 6px;
    height: 12px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
`;