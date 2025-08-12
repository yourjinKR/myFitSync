import React, { useState } from 'react';
import styled from 'styled-components';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../action/userAction';
import axios from 'axios';
import { persistor } from '../reducers/store';
import { useWebSocket } from '../hooks/UseWebSocket';

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
  width: 100px;

  img {
    display: block;
    width: 100%;
  }

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

  // 로그인된 사용자만 WebSocket 훅 사용
  const isLoggedIn = user && user.isLogin;
  const { disconnect: disconnectWebSocket, connected } = useWebSocket(isLoggedIn);

  const navigator = async (path) => {
    if (path === "/logout") {
      if (window.confirm("로그아웃 하시겠습니까?")) {
        try {
          // 로그아웃 전 WebSocket 연결 상태 확인 후 해제
          if (disconnectWebSocket) {
            disconnectWebSocket();
          }

          // 세션 스토리지 정리 (채팅 관련) - WebSocket 해제 후 즉시 처리
          sessionStorage.removeItem('chat_member_idx');

          // 약간의 지연을 두어 WebSocket 정리가 완료
          await new Promise(resolve => setTimeout(resolve, 100));

          // 백엔드 로그아웃 처리
          const res = await axios.get("/member/logout", { 
            withCredentials: true,
            timeout: 5000 // 5초 타임아웃 설정
          });
          
          // Redux 상태 정리
          dispatch(logoutUser());
          
          // 영구 저장소 정리
          persistor.purge();
          // 성공 메시지는 유지 (사용자가 의도한 로그아웃이므로)
          nav("/");
          
        } catch (error) {
          console.error('로그아웃 처리 중 오류:', error);
          
          // 오류가 발생해도 강제 로그아웃 처리
          if (disconnectWebSocket) {
            disconnectWebSocket();
          }
          
          dispatch(logoutUser());
          persistor.purge();
          sessionStorage.removeItem('chat_member_idx');
          
          // 에러 상황별 메시지
          if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            alert('로그아웃 요청 시간이 초과되었지만 로그아웃되었습니다.');
          } else if (error.response?.status === 401) {
            // 이미 로그아웃된 상태 처리
          }
          
          nav("/");
        }
      }
    } else {
      nav(path);
    }
  };

  return (
    <HeaderWrapper>
      <MenuButton onClick={()=>setIsOpen(true)}>
        <MenuIcon/>
      </MenuButton>
      <Logo onClick={() => navigator(user.member_type === 'trainer' ? `/trainer/${user.member_idx}` : '/')}>
        <img src="https://res.cloudinary.com/dhupmoprk/image/upload/v1754536756/fitsync/chat_1754536757453.png" alt="로고" />
      </Logo>
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