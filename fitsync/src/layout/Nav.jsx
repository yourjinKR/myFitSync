import React from 'react';
import styled from 'styled-components';
import HomeIcon from '@mui/icons-material/Home';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';

const NavWrapper = styled.div`
  display:flex;
  position:fixed;
  bottom: 0;
  left:50%;
  width:100%;
  max-width:750px;
  transform: translateX(-50%);
  box-shadow:0 -5px 5px rgba(0,0,0,0.05);
  background: gray;
  
  & > button {
    width: 33.3333%;
    display: flex;
    flex-direction: column;
    justify-content:center;
    align-items:center;
    padding:10px;
    border-left:1px solid #fff;
    color:#fff;
  }
`;

const Nav = () => {
  
  const nav = useNavigate();
  const handleNav = (type) => {
    if(type === 'home'){
      nav('/');
    }else if(type === 'routine'){
      nav('/routine');
    }else{
      nav('/mypage');
    }
  }

  return (
    <NavWrapper>
      <button onClick={() => handleNav('home')}>
        <HomeIcon/>
        홈
      </button>
      <button onClick={() => handleNav('routine')}>
        <FitnessCenterIcon/>
        운동
      </button>
      <button onClick={() => handleNav()}>
        <PersonIcon/>
        프로필
      </button>
    </NavWrapper>
  );
};

export default Nav;