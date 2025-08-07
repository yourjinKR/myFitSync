import React from 'react';
import styled from 'styled-components';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
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
  height: 85px;
  margin: 0 auto;
  background: var(--bg-secondary);
  backdrop-filter: blur(20px);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.2), 
              0 -1px 0 var(--border-light);
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999;
  border-top: 1px solid var(--border-light);

  @media (max-width: 750px) {
    width: 100vw;
    left: 0;
    transform: none;
    padding-bottom: env(safe-area-inset-bottom);
  }
`;

const NavButton = styled.button`
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--text-secondary);
  font-size: 1.6rem;
  font-weight: 500;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 12px 8px;
  border-radius: 16px;
  margin: 0 2px;
  position: relative;
  transition: all 0.2s ease;

  svg {
    margin-bottom: 4px;
    width: 24px;
    height: 24px;
    transition: all 0.2s ease;
  }

  @media (max-width: 750px) {
    font-weight: 600;
    padding: 12px 6px;
    
    svg {
      width: 26px;
      height: 26px;
      margin-bottom: 4px;
    }
  }
`;

const Divider = styled.div`
  width: 1px;
  background: linear-gradient(to bottom, 
    transparent 20%, 
    var(--border-light) 50%, 
    transparent 80%
  );
  margin: 16px 0;
  align-self: stretch;
  
  @media (max-width: 750px) {
    margin: 12px 0;
  }
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
      case 'matching' :
        nav('/trainer/search');
        break;
      default:
        nav('/');
    }
  };

  return (
    <NavWrapper>
      <NavButton onClick={() => handleNav('routine')}>
        <FitnessCenterIcon />
        운동
      </NavButton>
      {!isTrainer && (
        <NavButton onClick={() => handleNav('matching')}>
          <PersonSearchIcon />
          매칭
        </NavButton>
      )}
      <Divider />
      <NavButton onClick={() => handleNav('home')}>
        <HomeIcon />
        홈
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
