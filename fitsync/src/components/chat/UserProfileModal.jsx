import React from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

// 모달 배경
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 15000;
  animation: ${fadeIn} 0.2s ease;
  backdrop-filter: blur(4px);
`;

// 모달 컨테이너
const ModalContent = styled.div`
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 320px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-light);
  animation: ${fadeIn} 0.2s ease;
  position: relative;
`;

// 닫기 버튼
const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    color: var(--text-primary);
    background: var(--bg-tertiary);
  }
`;

// 프로필 이미지 컨테이너
const ProfileImageContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

// 프로필 이미지
const ProfileImage = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  
  border: ${props => {
    if (props.$gender === '남성') {
      return '3px solid #4A90E2';
    }
    if (props.$gender === '여성') {
      return '3px solid #FF69B4';
    }
    return '3px solid var(--border-medium)';
  }};
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  &.default-avatar {
    background: ${props => {
      if (props.$gender === '남성') {
        return 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)';
      }
      if (props.$gender === '여성') {
        return 'linear-gradient(135deg, #FF69B4 0%, #FF1493 100%)';
      }
      return 'linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-dark) 100%)';
    }};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 2.4rem;
  }
`;

// 정보 섹션
const InfoSection = styled.div`
  text-align: center;
`;

// 이름
const UserName = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px 0;
`;

// 정보 아이템
const InfoItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  margin-bottom: 8px;
  border: 1px solid var(--border-light);
`;

// 정보 라벨
const InfoLabel = styled.span`
  font-size: 1.4rem;
  color: var(--text-secondary);
  font-weight: 500;
`;

// 정보 값
const InfoValue = styled.span`
  font-size: 1.4rem;
  color: var(--text-primary);
  font-weight: 600;
`;

// 개선된 나이 계산 함수
const calculateAge = (birthDate) => {
  if (!birthDate) {
    return '정보 없음';
  }
  
  let birth;
  
  // 다양한 형식의 날짜 처리
  if (typeof birthDate === 'string') {
    // 문자열인 경우 (yyyy-MM-dd 형식 등)
    birth = new Date(birthDate);
  } else if (birthDate instanceof Date) {
    // 이미 Date 객체인 경우
    birth = birthDate;
  } else {
    // 숫자 또는 기타 형식인 경우
    birth = new Date(birthDate);
  }
  
  // 유효한 날짜인지 확인
  if (isNaN(birth.getTime())) {
    return '정보 없음';
  }
  
  const today = new Date();
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  // 나이가 음수이거나 비정상적으로 큰 경우 처리
  if (age < 0 || age > 150) {
    return '정보 없음';
  }
  
  return `${age}세`;
};

// 회원 프로필 모달 컴포넌트
const UserProfileModal = ({ isOpen, onClose, userInfo }) => {
  if (!isOpen || !userInfo) {
    return null;
  }

  // 프로필 이미지 렌더링
  const renderProfileImage = () => {
    const hasValidImage = userInfo.member_image && 
                         typeof userInfo.member_image === 'string' && 
                         userInfo.member_image.trim() !== '' &&
                         userInfo.member_image.startsWith('http');
    
    if (hasValidImage) {
      return (
        <ProfileImage $gender={userInfo.member_gender}>
          <img 
            src={userInfo.member_image} 
            alt={`${userInfo.member_name} 프로필`}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.classList.add('default-avatar');
              e.target.parentElement.textContent = userInfo.member_name?.charAt(0).toUpperCase() || '?';
            }}
          />
        </ProfileImage>
      );
    } else {
      return (
        <ProfileImage className="default-avatar" $gender={userInfo.member_gender}>
          {userInfo.member_name?.charAt(0).toUpperCase() || '?'}
        </ProfileImage>
      );
    }
  };

  // 나이 계산 및 디버깅
  const calculatedAge = calculateAge(userInfo.member_birth);

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose} aria-label="모달 닫기">
          ✕
        </CloseButton>
        
        <ProfileImageContainer>
          {renderProfileImage()}
        </ProfileImageContainer>
        
        <InfoSection>
          <UserName>{userInfo.member_name || '회원'}</UserName>
          
          <InfoItem>
            <InfoLabel>나이</InfoLabel>
            <InfoValue>{calculatedAge}</InfoValue>
          </InfoItem>
          
          <InfoItem>
            <InfoLabel>성별</InfoLabel>
            <InfoValue>
              {userInfo.member_gender === '남성' ? '👨 남성' : 
               userInfo.member_gender === '여성' ? '👩 여성' : '정보 없음'}
            </InfoValue>
          </InfoItem>
        </InfoSection>
      </ModalContent>
    </ModalOverlay>
  );
};

export default UserProfileModal;