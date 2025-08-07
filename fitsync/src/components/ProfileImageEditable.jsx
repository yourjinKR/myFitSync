import React, { useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';

// 스타일 컴포넌트
const Wrapper = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto;
  border-radius: 50%;
  overflow: hidden;
  cursor: ${({ $isEditable }) => $isEditable ? 'pointer' : 'default'};
  
  ${({ $isEditable }) => $isEditable && `
    &:hover {
      opacity: 0.8;
      transition: opacity 0.2s ease;
    }
    
    &::after {
      content: '✏️';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.7);
      color: white;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    
    &:hover::after {
      opacity: 1;
    }
  `}
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const HiddenInput = styled.input`
  display: none;
`;

const ProfileImageEditor = ({ profileImage, onSuccess = () => {}, isEditable = true }) => {
  const fileInputRef = useRef();
  
  const handleClick = () => {
    if (!isEditable || !fileInputRef.current) return;
    fileInputRef.current.click();
  };

  const handleChange = async (e) => {
    if (!isEditable) return;
    
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/member/update-profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.status === 200 && res.data) {
        alert('프로필 이미지가 변경되었습니다.');
        onSuccess(res.data); // res.data는 이미지 URL
      } else {
        alert('이미지 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('프로필 이미지 변경 오류:', error);
      if (error.response?.status === 401) {
        alert('로그인이 필요합니다.');
      } else {
        alert('서버 오류로 이미지 변경에 실패했습니다.');
      }
    }
  };

  return (
    <Wrapper onClick={handleClick} $isEditable={isEditable}>
      <Image
        src={profileImage || '/default-profile.png'} // fallback 이미지
        alt="프로필 이미지"
      />
      {isEditable && (
        <HiddenInput
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleChange}
        />
      )}
    </Wrapper>
  );
};

export default ProfileImageEditor;
