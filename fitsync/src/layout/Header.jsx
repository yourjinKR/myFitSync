import React from 'react';
import styled from 'styled-components';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';

const HeaderWrapper = styled.header`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  padding: 15px 24px;
  box-shadow: 0 4px 16px rgba(44, 62, 80, 0.08);
  position: sticky;
  top: 0;
  z-index: 999;
  background: #fff;
  min-height: 56px;

  @media (max-width: 600px) {
    padding: 12px 10px;
    min-height: 48px;
  }
`;

const Logo = styled.h1`
  font-size: 1.5rem;
  font-weight: 800;
  color: #232946;
  letter-spacing: 1px;
  margin: 0;

  @media (max-width: 600px) {
    font-size: 1.15rem;
  }
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  outline: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: background 0.15s;

  &:hover, &:focus {
    background: #f1f1f1;
  }

  svg {
    color: #232946;
    font-size: 2rem;
  }

  @media (max-width: 600px) {
    svg {
      font-size: 1.5rem;
    }
  }
`;

const Header = () => {

  const nav = useNavigate();
  const navigator = (path) => {
    nav(path);
  };

  return (
    <HeaderWrapper>
      <Logo onClick={()=>navigator('/')}>로고</Logo>
      <MenuButton>
        <MenuIcon />
      </MenuButton>
    </HeaderWrapper>
  );
};

export default Header;