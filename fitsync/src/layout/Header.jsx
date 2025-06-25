import React from 'react';
import styled from 'styled-components';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../action/userAction';
import axios from 'axios'; // axios import 추가
import { persistor } from '../reducers/store';

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

const LoginButton = styled.button`

`;

const Header = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);
  const nav = useNavigate();

  const navigator = async (path) => {
    if (path === "/logout") {
      // eslint-disable-next-line no-restricted-globals
      if(confirm("로그아웃 하시겠습니까?")){
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
      <MenuButton>
        <MenuIcon />
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