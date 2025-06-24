import React from 'react';
import styled from 'styled-components';
import HomeIcon from '@mui/icons-material/Home';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';

const NavWrapper = styled.nav`
  display: flex;
  width: 100%;
  max-width: 750px;
  margin: 0 auto;
  background: #232946;
  box-shadow: 0 -2px 12px rgba(44, 62, 80, 0.08);
  position: sticky;
  bottom: 0;
  z-index: 999;
  padding: 0 8px;

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
  font-size: 1.05rem;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 15px 0;

  svg {
    margin-bottom: 2px;
    font-size: 1.7rem;
  }

`;

// 버튼 사이 구분선
const Divider = styled.div`
  width: 1px;
  background: #393e53;
  margin: 10px 0;
  align-self: stretch;
  opacity: 0.7;
`;

const Nav = () => {
  const nav = useNavigate();
  const handleNav = (type) => {
    if (type === 'home') {
      nav('/');
    } else if (type === 'routine') {
      nav('/routine/view');
    } else {
      nav('/mypage');
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
      <NavButton onClick={() => handleNav()}>
        <PersonIcon />
        프로필
      </NavButton>
    </NavWrapper>
  );
};

export default Nav;