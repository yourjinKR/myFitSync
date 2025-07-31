import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

// Portal 기반으로 body에 직접 렌더링
const MenuContainer = styled.div`
  position: fixed;
  z-index: 10000;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  padding: 4px 0;
  min-width: 140px;
  max-width: 200px;
  animation: ${fadeIn} 0.15s ease-out;
  width: auto;
  white-space: nowrap;
  overflow: hidden;
  max-height: 300px;
  overflow-y: auto;
  
  /* MessageItem에서 계산된 뷰포트 좌표 직접 사용 */
  left: ${props => props.$x || 0}px;
  top: ${props => props.$y || 0}px;
  
  /* 뷰포트 경계 방어 로직 */
  transform: ${props => {
    const x = props.$x || 0;
    const y = props.$y || 0;
    const menuWidth = 200;
    const menuHeight = 300;
    const padding = 10;
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let adjustX = 0;
    let adjustY = 0;
    
    // 오른쪽 경계 체크
    if (x + menuWidth > viewportWidth - padding) {
      adjustX = -(menuWidth + 20);
    }
    
    // 하단 경계 체크  
    if (y + menuHeight > viewportHeight - padding) {
      adjustY = -(menuHeight + 20);
    }
    
    // 왼쪽 경계 체크
    if (x + adjustX < padding) {
      adjustX = -x + padding;
    }
    
    // 상단 경계 체크
    if (y + adjustY < padding) {
      adjustY = -y + padding;
    }
    
    return adjustX !== 0 || adjustY !== 0 ? `translate(${adjustX}px, ${adjustY}px)` : 'none';
  }};
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
  white-space: nowrap;
  
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
  flex-shrink: 0;
`;

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
  z-index: 20000;
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

// Portal 기반 컨텍스트 메뉴 컴포넌트
const ContextMenuPortal = ({ isVisible, x, y, children }) => {
  if (!isVisible) return null;

  return createPortal(
    <MenuContainer $x={x} $y={y}>
      {children}
    </MenuContainer>,
    document.body // body에 직접 렌더링으로 컨테이너 제약 완전 회피
  );
};

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

  // 위치 검증 및 안전장치
  const validateAndClampPosition = (rawPosition) => {
    if (!rawPosition || typeof rawPosition.x !== 'number' || typeof rawPosition.y !== 'number') {
      console.warn('⚠️ 잘못된 위치 데이터 - 기본값 사용:', rawPosition);
      return { x: 100, y: 100 };
    }

    let { x, y } = rawPosition;
    const padding = 10;
    const menuWidth = 200;
    const menuHeight = 300;
    
    // 뷰포트 경계 clamp
    const maxX = window.innerWidth - menuWidth - padding;
    const maxY = window.innerHeight - menuHeight - padding;
    
    x = Math.max(padding, Math.min(x, maxX));
    y = Math.max(padding, Math.min(y, maxY));
    
    return { x, y };
  };

  const validatedPosition = isVisible ? validateAndClampPosition(position) : { x: 0, y: 0 };

  // 외부 클릭 감지 (Portal 환경에 최적화)
  useEffect(() => {
    if (!isVisible) return;

    const handleGlobalClick = (event) => {
      // 메뉴 내부 클릭은 무시
      if (menuRef.current && menuRef.current.contains(event.target)) {
        return;
      }
      
      // 외부 클릭 시 메뉴 닫기
      onClose();
    };

    const handleGlobalTouch = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    // 캡처 단계에서 이벤트 감지 (Portal 특성상 중요)
    document.addEventListener('mousedown', handleGlobalClick, true);
    document.addEventListener('touchstart', handleGlobalTouch, true);

    return () => {
      document.removeEventListener('mousedown', handleGlobalClick, true);
      document.removeEventListener('touchstart', handleGlobalTouch, true);
    };
  }, [isVisible, onClose]);

  // ESC 키로 닫기
  useEffect(() => {
    if (!isVisible && !showReportModal) return;

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

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isVisible, showReportModal, onClose]);

  // 스크롤 시 메뉴 닫기 (Portal 환경 고려)
  useEffect(() => {
    if (!isVisible) return;

    const handleGlobalScroll = () => {
      onClose();
    };

    // 모든 스크롤 가능한 요소에서 스크롤 감지
    document.addEventListener('scroll', handleGlobalScroll, true);
    window.addEventListener('scroll', handleGlobalScroll);
    
    return () => {
      document.removeEventListener('scroll', handleGlobalScroll, true);
      window.removeEventListener('scroll', handleGlobalScroll);
    };
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
    onReply && onReply(message);
    onClose();
  };

  // 삭제 핸들러
  const handleDelete = () => {
    if (!canDelete()) return;
    
    const confirmDelete = window.confirm('이 메시지를 삭제하시겠습니까?');
    if (confirmDelete) {
      onDelete && onDelete(message);
      onClose();
    }
  };

  // 신고 모달 열기
  const handleReportClick = () => {
    setShowReportModal(true);
  };

  // 신고 제출
  const handleReportSubmit = () => {
    if (!reportContent.trim()) {
      alert('신고 사유를 입력해주세요.');
      return;
    }
    
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

  return (
    <>
      {/* Portal 기반 컨텍스트 메뉴 */}
      <ContextMenuPortal 
        isVisible={isVisible} 
        x={validatedPosition.x} 
        y={validatedPosition.y}
      >
        <div ref={menuRef}>
          <MenuButton 
            onClick={handleCopy} 
            disabled={!canCopy()}
            title={canCopy() ? '메시지 복사' : '복사할 내용이 없습니다'}
          >
            <MenuIcon>📋</MenuIcon>
            복사
          </MenuButton>

          <MenuButton onClick={handleReply}>
            <MenuIcon>↩️</MenuIcon>
            답장
          </MenuButton>

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

          {!isCurrentUser && (
            <MenuButton onClick={handleReportClick} className="danger">
              <MenuIcon>🚨</MenuIcon>
              신고
            </MenuButton>
          )}
        </div>
      </ContextMenuPortal>

      {/* 신고 모달 (Portal 기반) */}
      {showReportModal && createPortal(
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
        </ReportModalOverlay>,
        document.body
      )}
    </>
  );
};

export default MessageContextMenu;