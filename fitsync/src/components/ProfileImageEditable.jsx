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
  cursor: pointer;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const HiddenInput = styled.input`
  display: none;
`;

// 리팩토링된 컴포넌트
const ProfileImageEditor = ({ imageUrl, onSuccess = () => {} }) => {
  const fileInputRef = useRef();

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = async (e) => {
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
    <Wrapper onClick={handleClick}>
      <Image
        src={imageUrl || '/default-profile.png'} // fallback 이미지
        alt="프로필 이미지"
      />
      <HiddenInput
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleChange}
      />
    </Wrapper>
  );
};

export default ProfileImageEditor;
