import React from 'react';
import styled from 'styled-components';
import MenuIcon from '@mui/icons-material/Menu';

const HeaderWrapper = styled.div`
  display: flex;
  width : 100%;
  justify-content: space-between;
  padding:15px;
  align-items : center;
  box-shadow : 0 5px 5px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 999; 
  background:#fff;
`;

const Header = () => {

  return (
    <HeaderWrapper>
      <h1>로고</h1>
      <button>
        <MenuIcon fontSize="large"/>
      </button>
    </HeaderWrapper>
  );
};

export default Header;