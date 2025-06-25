import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import MemberRegister from './MemberRegister';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const RegisterWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  height: 100%;
  padding: 0 5%
`;
const TypeButton = styled.button`
  width: 100%;
  border-radius: 5px;
  padding: 50px 10px;
  font-size: 1.6rem;
  border: 1px solid #ccc;
  border-radius: 5px;
`;


const Register = () => {
  const [isType, setIsType] = new useState('');
  const { user } = useSelector(state => state.user);
  const nav = useNavigate();

  useEffect(()=>{
    if(user.isInfo){
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
    <>
      {
        isType === '' ? 
          <RegisterWrapper>
            <TypeButton onClick={() => handleRegister('trainer')} data-type="trainer">트레이너</TypeButton>
            <TypeButton onClick={() => handleRegister('member')} data-type="member">회원</TypeButton>
          </RegisterWrapper>
        : isType === 'trainer' ?
          <>
            <div>트레이너 등록 페이지</div>
          </>
        :
        <MemberRegister/>
      }
    </>
    
  );
};

export default Register;