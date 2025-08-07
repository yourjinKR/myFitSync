import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import MemberRegister from './MemberRegister';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import TrainerRegister from './TrainerRegister';
import { FaUserTie, FaUser } from 'react-icons/fa';


const PageBackground = styled.div`
  min-height: calc(100vh - 150px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
`;

const RegisterWrapper = styled.div`
  width : 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 2rem;
  margin: -20% 2rem 2rem;
  position: relative;
  z-index: 1;
  
`;

const Title = styled.h2`
  font-size: 2.4rem;
  font-weight: 800;
  color: var(--primary-blue);
  margin-bottom: 10px;
  letter-spacing: 1.5px;
`;

const SubText = styled.p`
  font-size: 1.6rem;
  color: var(--text-secondary);
  text-align: center;
`;

const TypeButton = styled.button`
  height: 90px;
  width: 50%;
  min-width: 200px;
  border-radius: 8px;
  padding: 0;
  font-size: 2rem;
  font-weight: 700;
  border: none;
  background: var(--primary-blue);
  color: var(--bg-white);
  box-shadow: 0 4px 16px rgba(74,144,226,0.13);
  cursor: pointer;
  transition: all 0.18s cubic-bezier(.4,2,.3,1);
  margin: 0 6px;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  position: relative;
  overflow: hidden;
  letter-spacing: 0.01em;
  &:hover {
    background: var(--primary-blue-hover);
    color: var(--primary-blue-light);
    box-shadow: 0 8px 24px rgba(74,144,226,0.18);
    filter: brightness(1.07);
  }
`;


const Register = () => {
  const [isType, setIsType] = new useState('');
  const { user } = useSelector(state => state.user);
  const nav = useNavigate();

  useEffect(()=>{
    if(user.isLogin === true || user.member_email === '' ){
      alert("잘못된 접근입니다.");
      nav("/");
    }
  },[]);
  
  useEffect(() => { 
  }, [isType]);

  const handleRegister = (type) => {
    if (type === 'trainer') {
      // 트레이너 등록 로직
      setIsType('trainer');
    }else{
      setIsType('member');
    }
  };


  return (
    <PageBackground>
      {
        isType === '' ? (
          <RegisterWrapper>
            <Title>회원 유형을 선택하세요</Title>
            <SubText>서비스를 이용할 회원 유형을 선택해 주세요.<br/>트레이너는 운동 코칭, 회원은 일반 이용자입니다.</SubText>
            <div style={{display: 'flex', gap: '5px', width: '100%'}}>
              <TypeButton onClick={() => handleRegister('trainer')} data-type="trainer">
                <FaUserTie style={{fontSize:'2.2em', marginRight:'10px'}} /> 트레이너
              </TypeButton>
              <TypeButton onClick={() => handleRegister('member')} data-type="member">
                <FaUser style={{fontSize:'2.2em', marginRight:'10px'}} /> 회원
              </TypeButton>
            </div>
          </RegisterWrapper>
        ) : isType === 'trainer' ? (
          <TrainerRegister/>
        ) : (
          <MemberRegister/>
        )
      }
    </PageBackground>
  );
};

export default Register;