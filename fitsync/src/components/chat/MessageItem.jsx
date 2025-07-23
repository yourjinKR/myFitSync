import React, { useCallback, useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import ImageModal from './ImageModal';
import MessageContextMenu from './MessageContextMenu';

// 기존 스타일 컴포넌트들은 그대로 유지
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`;

const MessageContainer = styled.div`
  display: flex;
  justify-content: ${props => props.$isCurrentUser ? 'flex-end' : 'flex-start'};
  margin-bottom: 12px;
  align-items: flex-start;
  transition: background-color 0.3s ease;
  padding: 4px 8px;
  border-radius: 8px;
  gap: 8px;
  position: relative;
`;

const ProfileImage = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  overflow: hidden;
  flex-shrink: 0;
  margin-top: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  &.default-avatar {
    background: linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-dark) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 1.4rem;
  }
  
  &.invisible {
    opacity: 0;
  }
`;

const MessageGroup = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 70%;
  min-width: 0;
  word-wrap: break-word;
  align-items: ${props => props.$isCurrentUser ? 'flex-end' : 'flex-start'};
`;

const SenderName = styled.div`
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin-bottom: 4px;
  margin-left: 4px;
  order: 1;
`;

// 🔥 핵심 수정: Pointer Events API + 우클릭 지원
const MessageBubble = styled.div`
  padding: 10px 14px;
  border-radius: 18px;
  background-color: ${props => props.$isCurrentUser ? 'var(--primary-blue)' : 'var(--bg-secondary)'};
  color: ${props => props.$isCurrentUser ? 'var(--text-primary)' : 'var(--text-primary)'};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  position: relative;
  word-wrap: break-word;
  border: ${props => props.$isCurrentUser ? 'none' : '1px solid var(--border-light)'};
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  order: 2;
  cursor: pointer;
  user-select: none;
  
  /* 🔥 Pointer Events 최적화 */
  touch-action: manipulation;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  
  /* 시각적 피드백 강화 */
  &.long-pressing {
    transform: scale(0.98);
    opacity: 0.8;
    transition: all 0.1s ease;
    background-color: ${props => props.$isCurrentUser ? 'var(--primary-blue-hover)' : 'var(--bg-tertiary)'};
  }
  
  /* PC 환경 호버 효과 */
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: scale(1.01);
      transition: transform 0.1s ease;
    }
  }
`;

const MessageText = styled.div`
  line-height: 1.4;
  white-space: pre-wrap;
  font-size: 1.4rem;
  color: inherit;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
  hyphens: auto;
`;

const ImageLoadingContainer = styled.div`
  max-width: 200px;
  max-height: 200px;
  min-width: 150px;
  min-height: 100px;
  border-radius: 8px;
  background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  border: 2px dashed #ccc;
  position: relative;
  overflow: hidden;
`;

const LoadingSpinner = styled.div`
  width: 24px;
  height: 24px;
  border: 3px solid var(--border-light);
  border-top: 3px solid var(--primary-blue);
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 8px;
`;

const LoadingText = styled.div`
  font-size: 1.2rem;
  color: var(--text-secondary);
  animation: ${pulse} 1.5s ease-in-out infinite;
  font-weight: 500;
`;

const LoadingProgress = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== '$progress'
})`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px;
  background: var(--primary-blue);
  border-radius: 0 0 8px 8px;
  transition: width 0.3s ease;
  width: ${props => props.$progress || 0}%;
`;

const MessageImage = styled.img`
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  object-fit: cover;
  cursor: pointer;
  display: block;
  margin-bottom: 8px;
  transition: all 0.2s ease;
  
  touch-action: manipulation;
  
  &:hover {
    opacity: 0.9;
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const ImageContainer = styled.div``;

const MessageWithInfo = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  ${props => props.$isCurrentUser ? 'flex-direction: row;' : 'flex-direction: row-reverse;'}
  order: 2;
`;

const MessageInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.$isCurrentUser ? 'flex-end' : 'flex-start'};
  font-size: 1.1rem;
  opacity: 0.7;
  gap: 2px;
  white-space: nowrap;
  min-width: fit-content;
  flex-shrink: 0;
  margin-top: 0;
`;

const MessageTime = styled.span`
  color: var(--text-secondary);
  font-size: 1rem;
`;

const ReadStatus = styled.div`
  color: var(--text-secondary);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ReadTime = styled.span`
  font-size: 0.8rem;
  color: var(--text-tertiary);
`;

const ReplyContainer = styled.div`
  margin-bottom: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-left: 3px solid var(--primary-blue);
  border-radius: 6px;
  opacity: 0.8;
`;

const ReplyText = styled.div`
  font-size: 1.2rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
`;

// 🔥 완전히 새로운 장누르기 훅 (Pointer Events API 기반)
const useUniversalLongPress = (onLongPress, delay = 700) => {
  const timeoutRef = useRef(null);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressExecuted = useRef(false);

  // 🔥 입력 타입 자동 감지
  const [inputMethod, setInputMethod] = useState('unknown');
  
  useEffect(() => {
    const detectInputMethod = () => {
      // 터치스크린 감지
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      // 마우스 감지 (대부분의 PC)
      const hasMouse = window.matchMedia('(pointer: fine)').matches;
      
      if (hasTouch && !hasMouse) {
        setInputMethod('touch');
      } else if (hasMouse) {
        setInputMethod('mouse');
      } else {
        setInputMethod('hybrid');
      }
    };
    
    detectInputMethod();
    console.log('🎯 입력 방식 감지:', inputMethod);
  }, []);

  // 🔥 통합 시작 핸들러 (Pointer Events 우선)
  const handlePressStart = useCallback((event) => {
    console.log('🔥 장누르기 시작:', event.type, event.pointerType || 'unknown');
    
    // 이미지 요소는 제외
    if (event.target.tagName && event.target.tagName.toLowerCase() === 'img') {
      return;
    }
    
    setIsLongPressing(true);
    longPressExecuted.current = false;
    
    // 기존 타이머 정리
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      if (!longPressExecuted.current) {
        console.log('✅ 장누르기 실행!');
        longPressExecuted.current = true;
        setIsLongPressing(false);
        
        // 🔥 정확한 위치 정보 추출 (뷰포트 기준)
        let clientX, clientY;
        
        if (event.touches && event.touches.length > 0) {
          // 터치 이벤트 - 뷰포트 기준 좌표
          clientX = event.touches[0].clientX;
          clientY = event.touches[0].clientY;
        } else if (event.changedTouches && event.changedTouches.length > 0) {
          // 터치 종료 이벤트
          clientX = event.changedTouches[0].clientX;
          clientY = event.changedTouches[0].clientY;
        } else {
          // 마우스 이벤트 - 뷰포트 기준 좌표 (clientX/Y 사용)
          clientX = event.clientX;
          clientY = event.clientY;
        }
        
        // 🔥 유효한 좌표인지 확인
        if (typeof clientX !== 'number' || typeof clientY !== 'number' || 
            clientX < 0 || clientY < 0) {
          console.warn('⚠️ 잘못된 좌표 감지, 기본값 사용:', { clientX, clientY });
          clientX = window.innerWidth / 2;
          clientY = window.innerHeight / 2;
        }
        
        const position = { x: clientX, y: clientY };
        
        console.log('📍 최종 추출된 위치 (뷰포트 기준):', position);
        
        onLongPress(event, position);
      }
    }, delay);
  }, [onLongPress, delay]);

  // 🔥 통합 종료 핸들러
  const handlePressEnd = useCallback((event) => {
    console.log('🔥 장누르기 종료:', event.type);
    
    setIsLongPressing(false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // 🔥 우클릭 핸들러 (PC 환경 전용)
  const handleContextMenu = useCallback((event) => {
    console.log('🖱️ 우클릭 감지 - 장누르기 대체 실행');
    event.preventDefault(); // 기본 우클릭 메뉴 차단
    
    const position = {
      x: event.clientX,
      y: event.clientY
    };
    
    onLongPress(event, position);
  }, [onLongPress]);

  // 메모리 정리
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // 🔥 Pointer Events API 지원 여부에 따른 핸들러 반환
  const supportsPointerEvents = typeof window !== 'undefined' && window.PointerEvent;
  
  console.log('🎯 Pointer Events 지원:', supportsPointerEvents);
  
  if (supportsPointerEvents) {
    // 최신 브라우저: Pointer Events 사용
    return {
      eventHandlers: {
        onPointerDown: handlePressStart,
        onPointerUp: handlePressEnd,
        onPointerLeave: handlePressEnd,
        onPointerCancel: handlePressEnd,
        onContextMenu: handleContextMenu // 우클릭 대체
      },
      isLongPressing
    };
  } else {
    // 구형 브라우저: 전통적인 이벤트 사용
    return {
      eventHandlers: {
        onMouseDown: handlePressStart,
        onMouseUp: handlePressEnd,
        onMouseLeave: handlePressEnd,
        onTouchStart: handlePressStart,
        onTouchEnd: handlePressEnd,
        onTouchCancel: handlePressEnd,
        onContextMenu: handleContextMenu
      },
      isLongPressing
    };
  }
};

const MessageItem = ({ 
  message, 
  isCurrentUser, 
  attachments = null, 
  senderName = null,
  senderImage = null,
  showTime = true,
  onImageLoad = null,
  onReply = null,
  onDelete = null,
  onReport = null,
  parentMessage = null
}) => {

  // 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [contextMenu, setContextMenu] = useState({
    isVisible: false,
    position: { x: 0, y: 0 }
  });

  // 🔥 새로운 장누르기 훅 사용
  const { eventHandlers, isLongPressing } = useUniversalLongPress(
    (event, position) => {
      console.log('🎯 장누르기 콜백 실행:', position);
      
      // 🔥 정확한 위치 계산 (스크롤 고려)
      const rawX = position.x;
      const rawY = position.y;
      
      console.log('📍 원본 터치/클릭 위치:', { rawX, rawY });
      console.log('📍 현재 스크롤 위치:', { 
        scrollX: window.scrollX, 
        scrollY: window.scrollY 
      });
      
      // 🔥 뷰포트 기준 절대 위치로 변환 (스크롤 무관)
      let finalX = rawX;
      let finalY = rawY;
      
      // 터치 이벤트의 경우 이미 뷰포트 기준이므로 그대로 사용
      // 마우스 이벤트의 경우에도 clientX/Y를 사용하므로 뷰포트 기준
      
      console.log('📍 최종 메뉴 위치 (뷰포트 기준):', { x: finalX, y: finalY });
      
      setContextMenu({
        isVisible: true,
        position: { x: finalX, y: finalY }
      });
    },
    700
  );

  // 이미지 클릭 핸들러
  const handleImageClick = useCallback((e) => {
    console.log('🖼️ 이미지 클릭!');
    e.preventDefault();
    e.stopPropagation();
    
    if (isLongPressing) {
      console.log('⏸️ 장누르기 중이므로 이미지 클릭 무시');
      return;
    }
    
    console.log('🖼️ 이미지 모달 열기:', attachments?.original_filename);
    setIsModalOpen(true);
  }, [attachments, isLongPressing]);

  // 모달 닫기
  const handleModalClose = useCallback(() => {
    console.log('❌ 이미지 모달 닫기');
    setIsModalOpen(false);
  }, []);

  // 컨텍스트 메뉴 닫기
  const handleContextMenuClose = useCallback(() => {
    console.log('❌ 컨텍스트 메뉴 닫기');
    setContextMenu({ isVisible: false, position: { x: 0, y: 0 } });
  }, []);

  // 기타 핸들러들 (기존과 동일)
  const handleCopy = useCallback((message) => {
    console.log('📋 메시지 복사됨:', message.message_content);
  }, []);

  const handleReply = useCallback((message) => {
    console.log('💬 답장 요청:', message);
    onReply && onReply(message);
  }, [onReply]);

  const handleDelete = useCallback((message) => {
    console.log('🗑️ 메시지 삭제 요청:', message);
    onDelete && onDelete(message);
  }, [onDelete]);

  const handleReport = useCallback((message, reportContent) => {
    console.log('🚨 메시지 신고 요청:', { message, reportContent });
    onReport && onReport(message, reportContent);
  }, [onReport]);

  const handleImageLoad = useCallback(() => {
    console.log('✅ 이미지 로드 완료');
    setImageLoading(false);
    setLoadingProgress(100);
    
    if (onImageLoad) {
      setTimeout(() => {
        onImageLoad(message.message_idx);
      }, 100);
    }
  }, [onImageLoad, message.message_idx]);

  const handleImageError = useCallback(() => {
    console.log('❌ 이미지 로드 실패');
    setImageLoading(false);
    setLoadingProgress(0);
  }, []);

  // 로딩 진행률 시뮬레이션
  useEffect(() => {
    if (message.message_type === 'image' && !attachments && imageLoading) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [message.message_type, attachments, imageLoading]);

  useEffect(() => {
    if (attachments && message.message_type === 'image') {
      setImageLoading(false);
      setLoadingProgress(100);
    }
  }, [attachments, message.message_type]);
  
  // 시간 포맷팅
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 프로필 이미지 렌더링
  const renderProfileImage = () => {
    if (isCurrentUser) return null;
    
    const hasValidImage = senderImage && 
                         typeof senderImage === 'string' && 
                         senderImage.trim() !== '' &&
                         senderImage.startsWith('http');
    
    if (!senderName) {
      return <ProfileImage className="invisible" />;
    }
    
    return (
      <ProfileImage>
        {hasValidImage ? (
          <img 
            src={senderImage} 
            alt={`${senderName} 프로필`}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.classList.add('default-avatar');
              e.target.parentElement.textContent = senderName?.charAt(0).toUpperCase() || '?';
            }}
          />
        ) : (
          <div className="default-avatar">
            {senderName.charAt(0).toUpperCase()}
          </div>
        )}
      </ProfileImage>
    );
  };

  // 읽음 상태 정보
  const getReadStatusInfo = () => {
    if (!isCurrentUser) return null;
    
    if (message.message_readdate) {
      return { text: '읽음', time: null };
    } else {
      return { text: '읽지 않음', time: null };
    }
  };

  const readStatusInfo = getReadStatusInfo();

  return (
    <>
    <MessageContainer id={`message-${message.message_idx}`} $isCurrentUser={isCurrentUser}>
      {renderProfileImage()}
      
      <MessageGroup $isCurrentUser={isCurrentUser}>
        {!isCurrentUser && senderName && (
          <SenderName>{senderName}</SenderName>
        )}
        
        {parentMessage && (
          <ReplyContainer>
            <ReplyText>
              {parentMessage.message_type === 'image' 
                ? (parentMessage.message_content && parentMessage.message_content !== '[이미지]' 
                   ? parentMessage.message_content 
                   : '📷 이미지')
                : parentMessage.message_content}
            </ReplyText>
          </ReplyContainer>
        )}
        
        <MessageWithInfo $isCurrentUser={isCurrentUser}>
          {/* 🔥 핵심 수정: 새로운 이벤트 핸들러 적용 */}
          <MessageBubble 
            $isCurrentUser={isCurrentUser}
            {...eventHandlers} // 🔥 Pointer Events 기반 핸들러 적용
            className={isLongPressing ? 'long-pressing' : ''}
          >
            {message.message_type === 'image' ? (
              <ImageContainer>
                {(!attachments || imageLoading) ? (
                  <ImageLoadingContainer>
                    <LoadingSpinner />
                    <LoadingText>이미지 업로드 중...</LoadingText>
                    <LoadingProgress $progress={loadingProgress} />
                  </ImageLoadingContainer>
                ) : (
                  <MessageImage
                    src={attachments.cloudinary_url}
                    alt={attachments.original_filename}
                    onClick={handleImageClick}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    title="클릭하면 확대하여 볼 수 있습니다"
                    loading="lazy"
                  />
                )}
                
                {message.message_content && message.message_content !== '[이미지]' && (
                  <MessageText>{message.message_content}</MessageText>
                )}
              </ImageContainer>
            ) : (
              <MessageText>{message.message_content}</MessageText>
            )}
          </MessageBubble>
          
          {showTime && (
            <MessageInfo $isCurrentUser={isCurrentUser}>
              <MessageTime>
                {formatTime(message.message_senddate)}
              </MessageTime>
              {readStatusInfo && (
                <ReadStatus>
                  <ReadTime>{readStatusInfo.text}</ReadTime>
                </ReadStatus>
              )}
            </MessageInfo>
          )}
        </MessageWithInfo>
      </MessageGroup>
    </MessageContainer>

    {/* 컨텍스트 메뉴 */}
    <MessageContextMenu
      isVisible={contextMenu.isVisible}
      position={contextMenu.position}
      message={message}
      isCurrentUser={isCurrentUser}
      onClose={handleContextMenuClose}
      onCopy={handleCopy}
      onReply={handleReply}
      onDelete={handleDelete}
      onReport={handleReport}
    />

    {/* 이미지 모달 */}
    {attachments && (
      <ImageModal
        isOpen={isModalOpen}
        imageUrl={attachments.cloudinary_url}
        originalFilename={attachments.original_filename}
        onClose={handleModalClose}
      />
    )}
    </>
  );
};

export default MessageItem;