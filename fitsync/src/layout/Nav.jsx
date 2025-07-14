import React from 'react';
import styled from 'styled-components';
import HomeIcon from '@mui/icons-material/Home';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import PersonIcon from '@mui/icons-material/Person';
import ChatIcon from '@mui/icons-material/Chat';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const NavWrapper = styled.nav`
  display: flex;
  width: 100%;
  max-width: 750px;
  max-height: 85px;
  margin: 0 auto;
  background: #232946;
  box-shadow: 0 -2px 12px rgba(44, 62, 80, 0.08);
  position: sticky;
  bottom: 0;
  z-index: 999;
  padding: 0 8px;
  height: 100%;

  @media (max-width: 750px) {
    padding: 0 2px;
  }
`;

const NavButton = styled.button`
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: #eebbc3;
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 15px 0;

  svg {
    margin-bottom: 2px;
    width: 2.5rem;
    height: 2.5rem;
    path {
      font-size: 5rem;
    }

  }
`;

const Divider = styled.div`
  width: 1px;
  background: #393e53;
  margin: 10px 0;
  align-self: stretch;
  opacity: 0.7;
`;

const Nav = () => {
  const nav = useNavigate();

  // 로그인 정보 가져오기
  const { user } = useSelector((state) => state.user);

  const isTrainer = user.member_type === 'trainer';
  const memberIdx = user.member_idx;
  
  const handleNav = (type) => {
    switch (type) {
      case 'home':
        isTrainer ? nav(`/trainer/${memberIdx}`) : nav('/');
        break;
      case 'routine':
        nav('/routine/view');
        break;
      case 'chat':
        nav('/chat');
        break;
      case 'mypage':
        isTrainer ? nav(`/trainer/view/${memberIdx}`) : nav('/mypage');
        break;
      default:
        nav('/');
    }
  };

  return (
    <NavWrapper>
      <NavButton onClick={() => handleNav('home')}>
        <HomeIcon />
        홈
      </NavButton>
      <Divider />
      <NavButton onClick={() => handleNav('routine')}>
        <FitnessCenterIcon />
        운동
      </NavButton>
      <Divider />
      <NavButton onClick={() => handleNav('chat')}>
        <ChatIcon />
        채팅
      </NavButton>
      <Divider />
      <NavButton onClick={() => handleNav('mypage')}>
        <PersonIcon />
        프로필
      </NavButton>
    </NavWrapper>
  );
};

export default Nav;
