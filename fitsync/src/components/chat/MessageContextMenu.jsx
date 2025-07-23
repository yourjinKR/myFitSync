import React, { useState, useRef, useEffect } from 'react';
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

// 🔥 가로스크롤 방지 + 위치 계산 정확도 개선
const MenuContainer = styled.div`
  position: fixed; /* absolute 대신 fixed 사용 */
  z-index: 10000; /* 더 높은 z-index */
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  padding: 4px 0;
  min-width: 140px;
  max-width: 200px; /* 최대 너비 제한 */
  animation: ${fadeIn} 0.15s ease-out;
  
  /* 🔥 가로스크롤 방지 핵심 CSS */
  width: auto;
  white-space: nowrap;
  overflow: hidden;
  
  /* 🔥 화면 경계를 넘지 않도록 강제 제한 */
  max-height: 300px;
  overflow-y: auto;
  
  /* 🔥 정확한 위치 계산 */
  ${props => props.$position && `
    left: ${Math.max(10, Math.min(props.$position.x, window.innerWidth - 160))}px;
    top: ${Math.max(10, Math.min(props.$position.y, window.innerHeight - 250))}px;
  `}
`;

const MenuButton = styled.button`
  width: 100%;
  padding: 10px 16px;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 1.4rem;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap; /* 텍스트 줄바꿈 방지 */
  
  &:hover {
    background: var(--bg-tertiary);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &.danger {
    color: #ff4757;
    
    &:hover {
      background: rgba(255, 71, 87, 0.1);
    }
  }
`;

const MenuIcon = styled.span`
  font-size: 1.2rem;
  width: 16px;
  text-align: center;
  flex-shrink: 0; /* 아이콘 크기 고정 */
`;

// 신고 모달 관련 스타일들은 기존과 동일
const ReportModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20000; /* 메뉴보다 높은 z-index */
  animation: ${fadeIn} 0.2s ease;
`;

const ReportModalContent = styled.div`
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  max-height: 80vh; /* 화면 높이 제한 */
  overflow-y: auto; /* 내용이 길면 스크롤 */
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
  box-sizing: border-box; /* 패딩 포함한 크기 계산 */
  
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

const MessageContextMenu = ({ 
  isVisible, 
  position, 
  message, 
  isCurrentUser, 
  onClose, 
  onCopy, 
  onReply, 
  onDelete, 
  onReport 
}) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportContent, setReportContent] = useState('');
  const menuRef = useRef(null);

  // 🔥 정확한 위치 계산 함수
  const calculatePosition = (rawPosition) => {
    if (!rawPosition || typeof rawPosition.x !== 'number' || typeof rawPosition.y !== 'number') {
      console.warn('⚠️ 잘못된 위치 데이터:', rawPosition);
      return { x: 100, y: 100 }; // 기본 위치
    }

    const menuWidth = 160; // 메뉴 예상 너비
    const menuHeight = 200; // 메뉴 예상 높이
    const padding = 10; // 화면 가장자리 여백
    
    // 🔥 뷰포트 크기
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // 🔥 앱의 최대 너비 (Display.jsx와 동일)
    const maxAppWidth = 750;
    const isDesktop = viewportWidth > maxAppWidth;
    
    let x = rawPosition.x;
    let y = rawPosition.y;
    
    // 🔥 데스크톱에서 중앙 정렬된 컨테이너 보정
    if (isDesktop) {
      const containerLeft = (viewportWidth - maxAppWidth) / 2;
      const containerRight = containerLeft + maxAppWidth;
      
      // 터치/클릭 위치가 앱 컨테이너 내부인지 확인
      if (x >= containerLeft && x <= containerRight) {
        // 메뉴가 컨테이너 밖으로 나가지 않도록 조정
        if (x + menuWidth > containerRight) {
          x = containerRight - menuWidth - padding;
        }
      }
    } else {
      // 🔥 모바일에서는 화면 경계 체크
      if (x + menuWidth > viewportWidth - padding) {
        x = viewportWidth - menuWidth - padding;
      }
    }
    
    // 🔥 좌측 경계 체크
    if (x < padding) {
      x = padding;
    }
    
    // 🔥 하단 경계 체크 (Nav 높이 고려)
    const navHeight = 85;
    const maxY = viewportHeight - navHeight - menuHeight - padding;
    
    if (y + menuHeight > maxY) {
      y = maxY;
    }
    
    // 🔥 상단 경계 체크
    if (y < padding) {
      y = padding;
    }
    
    console.log('🎯 위치 계산 완료:', {
      원본: rawPosition,
      최종: { x, y },
      뷰포트: { viewportWidth, viewportHeight },
      데스크톱: isDesktop
    });
    
    return { x, y };
  };

  // 🔥 계산된 위치 사용
  const calculatedPosition = isVisible ? calculatePosition(position) : { x: 0, y: 0 };

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside); // 모바일 지원
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }
  }, [isVisible, onClose]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        if (showReportModal) {
          setShowReportModal(false);
          setReportContent('');
        } else {
          onClose();
        }
      }
    };

    if (isVisible || showReportModal) {
      document.addEventListener('keydown', handleEscKey);
      return () => document.removeEventListener('keydown', handleEscKey);
    }
  }, [isVisible, showReportModal, onClose]);

  // 🔥 스크롤 시 메뉴 닫기 (위치 오류 방지)
  useEffect(() => {
    const handleScroll = () => {
      if (isVisible) {
        console.log('📜 스크롤 감지 - 메뉴 닫기');
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('scroll', handleScroll, true); // 모든 스크롤 이벤트 캐치
      return () => document.removeEventListener('scroll', handleScroll, true);
    }
  }, [isVisible, onClose]);

  // 복사 가능 여부 확인
  const canCopy = () => {
    if (!message) return false;
    
    if (message.message_type === 'image') {
      return message.message_content && 
             message.message_content.trim() !== '' && 
             message.message_content !== '[이미지]';
    }
    
    return message.message_content && message.message_content.trim() !== '';
  };

  // 삭제 가능 여부 확인
  const canDelete = () => {
    if (!message || !isCurrentUser) return false;
    
    if (!message.message_readdate) return true;
    
    const readTime = new Date(message.message_readdate);
    const now = new Date();
    const diffInMinutes = (now - readTime) / (1000 * 60);
    
    return diffInMinutes <= 1;
  };

  // 복사 핸들러
  const handleCopy = async () => {
    if (!canCopy()) return;
    
    try {
      await navigator.clipboard.writeText(message.message_content);
      console.log('✅ 메시지 복사 완료:', message.message_content);
      onCopy && onCopy(message);
      onClose();
    } catch (error) {
      console.error('❌ 복사 실패:', error);
      const textarea = document.createElement('textarea');
      textarea.value = message.message_content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      onCopy && onCopy(message);
      onClose();
    }
  };

  // 답장 핸들러
  const handleReply = () => {
    console.log('💬 답장 선택:', message.message_idx);
    onReply && onReply(message);
    onClose();
  };

  // 삭제 핸들러
  const handleDelete = () => {
    if (!canDelete()) return;
    
    const confirmDelete = window.confirm('이 메시지를 삭제하시겠습니까?');
    if (confirmDelete) {
      console.log('🗑️ 메시지 삭제:', message.message_idx);
      onDelete && onDelete(message);
      onClose();
    }
  };

  // 신고 모달 열기
  const handleReportClick = () => {
    console.log('🚨 신고 모달 열기:', message.message_idx);
    setShowReportModal(true);
  };

  // 신고 제출
  const handleReportSubmit = () => {
    if (!reportContent.trim()) {
      alert('신고 사유를 입력해주세요.');
      return;
    }
    
    console.log('🚨 신고 제출:', {
      messageIdx: message.message_idx,
      content: reportContent.trim()
    });
    
    onReport && onReport(message, reportContent.trim());
    setShowReportModal(false);
    setReportContent('');
    onClose();
  };

  // 신고 모달 닫기
  const handleReportCancel = () => {
    setShowReportModal(false);
    setReportContent('');
  };

  if (!isVisible) return null;

  return (
    <>
      {/* 🔥 정확한 위치 계산이 적용된 메뉴 */}
      <MenuContainer ref={menuRef} $position={calculatedPosition}>
        {/* 복사 버튼 */}
        <MenuButton 
          onClick={handleCopy} 
          disabled={!canCopy()}
          title={canCopy() ? '메시지 복사' : '복사할 내용이 없습니다'}
        >
          <MenuIcon>📋</MenuIcon>
          복사
        </MenuButton>

        {/* 답장 버튼 */}
        <MenuButton onClick={handleReply}>
          <MenuIcon>↩️</MenuIcon>
          답장
        </MenuButton>

        {/* 삭제 버튼 (내 메시지인 경우에만) */}
        {isCurrentUser && (
          <MenuButton 
            onClick={handleDelete}
            disabled={!canDelete()}
            className={canDelete() ? 'danger' : ''}
            title={
              !canDelete() 
                ? '삭제할 수 없습니다 (읽음 후 1분 경과)' 
                : '메시지 삭제'
            }
          >
            <MenuIcon>🗑️</MenuIcon>
            삭제
          </MenuButton>
        )}

        {/* 신고 버튼 (상대방 메시지인 경우에만) */}
        {!isCurrentUser && (
          <MenuButton onClick={handleReportClick} className="danger">
            <MenuIcon>🚨</MenuIcon>
            신고
          </MenuButton>
        )}
      </MenuContainer>

      {/* 신고 모달 */}
      {showReportModal && (
        <ReportModalOverlay onClick={handleReportCancel}>
          <ReportModalContent onClick={(e) => e.stopPropagation()}>
            <ReportModalTitle>메시지 신고</ReportModalTitle>
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
              >
                취소
              </ReportButton>
              <ReportButton 
                className="submit" 
                onClick={handleReportSubmit}
                disabled={!reportContent.trim()}
              >
                신고
              </ReportButton>
            </ReportModalButtons>
          </ReportModalContent>
        </ReportModalOverlay>
      )}
    </>
  );
};

export default MessageContextMenu;