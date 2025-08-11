import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { MdReport } from 'react-icons/md';
import axios from 'axios';

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

// TrainerProfileHeader와 동일한 스타일의 신고 버튼
const IconButton = styled.button`
  background: var(--bg-tertiary);
  border: none;
  border-radius: 50%;
  width: 2.6rem;
  height: 2.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.45rem;
  color: var(--primary-blue);
  cursor: pointer;
  box-shadow: 0 0.05rem 0.2rem rgba(74,144,226,0.10);
  transition: background 0.18s, color 0.18s;
  margin-left: 8px;
  flex-shrink: 0;
  
  &:hover, &:focus {
    background: #ff4757;
    color: #fff;
    outline: none;
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

// 이름과 신고 버튼을 포함하는 컨테이너
const UserNameContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 0 16px 0;
`;

// 이름
const UserName = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.5px;
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

// 신고 모달 스타일 (기존 스타일 유지, z-index만 높임)
const ReportModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 25000;
  animation: ${fadeIn} 0.2s ease;
`;

const ReportModalContent = styled.div`
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  max-height: 80vh;
  overflow-y: auto;
`;

const ReportModalTitle = styled.h3`
  font-size: 1.8rem;
  color: var(--text-primary);
  margin-bottom: 16px;
  text-align: center;
`;

const ReportTextarea = styled.textarea`
  width: 100%;
  height: 120px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 12px;
  color: var(--text-primary);
  font-size: 1.4rem;
  resize: none;
  outline: none;
  margin-bottom: 16px;
  font-family: inherit;
  box-sizing: border-box;
  
  &::placeholder {
    color: var(--text-tertiary);
  }
  
  &:focus {
    border-color: var(--primary-blue);
  }
`;

const ReportModalButtons = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

const ReportButton = styled.button`
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 1.4rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &.cancel {
    background: var(--bg-tertiary);
    border: 1px solid var(--border-light);
    color: var(--text-primary);
    
    &:hover {
      background: var(--bg-primary);
    }
  }
  
  &.submit {
    background: #ff4757;
    border: none;
    color: white;
    
    &:hover {
      background: #ff3742;
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
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
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportContent, setReportContent] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  if (!isOpen || !userInfo) {
    return null;
  }

  // userInfo 객체 구조 확인 및 member_idx 추출
  const getTargetMemberIdx = () => {
    // 여러 가능한 필드명 체크
    const possibleFields = [
      'member_idx',
      'memberIdx', 
      'idx',
      'id',
      'user_idx',
      'sender_idx'
    ];
    
    for (const field of possibleFields) {
      if (userInfo[field] && typeof userInfo[field] === 'number') {
        return userInfo[field];
      }
    }
    
    // 모든 필드를 확인해도 없으면 로그 출력
    console.error('신고 대상자 member_idx를 찾을 수 없습니다. userInfo 객체:', userInfo);
    return null;
  };

  // 신고 모달 열기
  const handleReportClick = (e) => {
    e.stopPropagation();
    
    // 신고 대상자 member_idx 확인
    const targetMemberIdx = getTargetMemberIdx();
    if (!targetMemberIdx) {
      alert('신고할 수 없습니다. 사용자 정보가 올바르지 않습니다.');
      return;
    }
    
    setShowReportModal(true);
  };

  // 신고 제출
  const handleReportSubmit = async () => {
    if (!reportContent.trim()) {
      alert('신고 사유를 입력해주세요.');
      return;
    }

    if (isSubmittingReport) {
      return;
    }

    // 신고 대상자 member_idx 다시 확인
    const targetMemberIdx = getTargetMemberIdx();
    if (!targetMemberIdx) {
      alert('신고할 수 없습니다. 사용자 정보가 올바르지 않습니다.');
      return;
    }

    setIsSubmittingReport(true);

    try {
      // 새로운 UserProfileModal 전용 API 사용
      const reportData = {
        target_member_idx: targetMemberIdx,    // 신고 대상자의 member_idx
        report_content: reportContent.trim()   // 신고 사유
      };

      // 새로운 API 엔드포인트 사용
      const response = await axios.post('/member/report/user-profile', reportData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        alert('신고가 접수되었습니다.');
        setShowReportModal(false);
        setReportContent('');
        // 프로필 모달도 닫기
        onClose();
      } else {
        throw new Error('신고 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('신고 제출 오류:', error);
      
      if (error.response?.status === 401) {
        alert('로그인이 필요합니다.');
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data;
        
        if (typeof errorMessage === 'string') {
          // 한글 깨짐 문제 해결을 위해 기본 메시지 사용
          alert('신고 처리에 실패했습니다. 필수 정보가 누락되었습니다.');
        } else {
          alert('잘못된 요청입니다. 신고 데이터를 확인해주세요.');
        }
      } else if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('신고 처리 중 오류가 발생했습니다.');
      }
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // 신고 모달 닫기
  const handleReportCancel = () => {
    setShowReportModal(false);
    setReportContent('');
  };

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

  // 나이 계산
  const calculatedAge = calculateAge(userInfo.member_birth);

  return (
    <>
      <ModalOverlay onClick={onClose}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <CloseButton onClick={onClose} aria-label="모달 닫기">
            ✕
          </CloseButton>
          
          <ProfileImageContainer>
            {renderProfileImage()}
          </ProfileImageContainer>
          
          <InfoSection>
            <UserNameContainer>
              <UserName>{userInfo.member_name || '회원'}</UserName>
              <IconButton 
                onClick={handleReportClick}
                title="사용자 신고"
                aria-label="사용자 신고"
              >
                <MdReport />
              </IconButton>
            </UserNameContainer>
            
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

      {/* 신고 모달 */}
      {showReportModal && (
        <ReportModalOverlay onClick={handleReportCancel}>
          <ReportModalContent onClick={(e) => e.stopPropagation()}>
            <ReportModalTitle>사용자 신고</ReportModalTitle>
            <ReportTextarea
              value={reportContent}
              onChange={(e) => setReportContent(e.target.value)}
              placeholder="신고 사유를 입력해주세요..."
              maxLength={500}
              autoFocus
            />
            <ReportModalButtons>
              <ReportButton 
                className="cancel" 
                onClick={handleReportCancel}
                disabled={isSubmittingReport}
              >
                취소
              </ReportButton>
              <ReportButton 
                className="submit" 
                onClick={handleReportSubmit}
                disabled={!reportContent.trim() || isSubmittingReport}
              >
                {isSubmittingReport ? '처리 중...' : '신고'}
              </ReportButton>
            </ReportModalButtons>
          </ReportModalContent>
        </ReportModalOverlay>
      )}
    </>
  );
};

export default UserProfileModal;