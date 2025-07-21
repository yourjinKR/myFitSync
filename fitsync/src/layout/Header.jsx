import React, { useState } from 'react';
import styled from 'styled-components';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../action/userAction';
import axios from 'axios';
import { persistor } from '../reducers/store';

const HeaderWrapper = styled.header`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  padding: 13px 24px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  position: sticky;
  top: 0;
  z-index: 999;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);
  min-height: 56px;
  height: 100%;
  max-height: 65px;
`;

const Logo = styled.h1`
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: 1px;
  margin: 0;
  cursor: pointer;
  transition: all 0.2s;

  &:active {
    color: var(--primary-blue);
    transform: scale(0.98);
  }
`;

const MenuButton = styled.button`
  background: var(--bg-tertiary);
  border: none;
  outline: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s;

  &:active {
    background: var(--bg-primary);
    transform: scale(0.98);
  }

  svg {
    color: var(--text-secondary);
    font-size: 2rem;
  }

  @media (max-width: 600px) {
    svg {
      font-size: 1.5rem;
    }
  }
`;

const LoginButton = styled.button`
  background: var(--primary-blue);
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 1.4rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  &:active {
    background: var(--primary-blue-hover);
    transform: scale(0.98);
  }
  @media (max-width: 600px) {
    font-size: 1.2rem;
    padding: 6px 12px;
  }
`;

const Header = ({setIsOpen}) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);
  const nav = useNavigate();

  const navigator = async (path) => {
    if (path === "/logout") {
      if (window.confirm("로그아웃 하시겠습니까?")) {
        const res = await axios.get("/member/logout", { withCredentials: true });
        dispatch(logoutUser());
        persistor.purge();
        alert(res.data.message);
        nav("/");
      }
    } else {
      nav(path);
    }
  };

  return (
    <HeaderWrapper>
      <MenuButton onClick={()=>setIsOpen(true)}>
        <MenuIcon handleActiveNav/>
      </MenuButton>
      <Logo onClick={() => navigator('/')}>로고</Logo>
      {
        user == null || !user.isLogin ?
          <LoginButton onClick={() => navigator('/login')}>
            로그인
          </LoginButton>
        :
          <LoginButton onClick={() => navigator('/logout')}>
            로그아웃
          </LoginButton>
      }
    </HeaderWrapper>
  );
};

export default Header;