import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../action/userAction';

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
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const [currentImage, setCurrentImage] = useState(profileImage);

  // profileImage prop이 변경될 때 currentImage 업데이트
  useEffect(() => {
    setCurrentImage(profileImage);
  }, [profileImage]);
  
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
        const newImageUrl = res.data.imageUrl || res.data;
        
        // 브라우저 캐시를 방지하기 위해 타임스탬프 추가
        const timestampedUrl = newImageUrl + (newImageUrl.includes('?') ? '&' : '?') + 't=' + Date.now();
        
        // 로컬 상태 즉시 업데이트
        setCurrentImage(timestampedUrl);
        
        // Redux store 업데이트 (로그인한 사용자인 경우)
        if (user && user.isLogin) {
          dispatch(setUser({
            ...user,
            member_image: timestampedUrl
          }));
        }
        
        alert('프로필 이미지가 변경되었습니다.');
        onSuccess(timestampedUrl); // 부모 컴포넌트에 알림
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
        src={currentImage || '/default-profile.png'} // 현재 이미지 상태 사용
        alt="프로필 이미지"
        key={currentImage} // 이미지가 바뀔 때 강제 리렌더링
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
