import React, { useCallback, useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import ImageModal from './ImageModal';
import MessageContextMenu from './MessageContextMenu';

// 기존 스타일 컴포넌트들 유지
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
  
  touch-action: manipulation;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  
  &.long-pressing {
    transform: scale(0.98);
    opacity: 0.8;
    transition: all 0.1s ease;
    background-color: ${props => props.$isCurrentUser ? 'var(--primary-blue-hover)' : 'var(--bg-tertiary)'};
  }
  
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

const LoadingProgress = styled.div`
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

// 🔥 근본적 해결책 1: 통합 좌표 변환 시스템
const useContextMenuPosition = () => {
  const calculatePosition = useCallback((event, containerRef) => {
    if (!containerRef.current) {
      console.warn('🚨 컨테이너 참조가 없습니다');
      return { x: 100, y: 100 };
    }

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    
    // 🔥 핵심: 스크롤바 너비 계산 (데스크톱 특화)
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    // 🔥 핵심: 이벤트 좌표 추출 (크로스 플랫폼)
    let clientX, clientY;
    if (event.touches && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    // 🔥 핵심: 컨테이너 기준 좌표로 변환 (auto margin 오프셋 해결)
    let relativeX = clientX - containerRect.left;
    let relativeY = clientY - containerRect.top;

    console.log('🎯 좌표 변환 (근본 해결):', {
      원본좌표: { clientX, clientY },
      컨테이너정보: {
        left: containerRect.left,
        top: containerRect.top,
        width: containerRect.width,
        height: containerRect.height
      },
      변환좌표: { relativeX, relativeY },
      스크롤바너비: scrollbarWidth,
      뷰포트너비: window.innerWidth,
      문서너비: document.documentElement.clientWidth
    });

    // 🔥 핵심: DPR(Device Pixel Ratio) 보정
    const dpr = window.devicePixelRatio || 1;
    if (dpr !== 1 && dpr > 1.5) {
      console.log('📱 DPR 보정 적용:', dpr);
      relativeX = relativeX / dpr;
      relativeY = relativeY / dpr;
    }

    // 🔥 메뉴 크기 및 여백
    const menuWidth = 160;
    const menuHeight = 200;
    const padding = 10;

    // 🔥 핵심: 컨테이너 기준 최종 위치 계산 (뷰포트가 아닌 컨테이너 기준!)
    let finalX = relativeX + padding;
    let finalY = relativeY;

    // 🔥 컨테이너 내부 경계 체크
    if (finalX + menuWidth > containerRect.width - scrollbarWidth - padding) {
      finalX = relativeX - menuWidth - padding;
    }

    if (finalX < padding) {
      finalX = padding;
      finalY = relativeY - menuHeight - padding;
    }

    if (finalY < padding) {
      finalY = relativeY + padding;
    }

    if (finalY + menuHeight > containerRect.height - padding) {
      finalY = containerRect.height - menuHeight - padding;
    }

    // 🔥 최종 뷰포트 좌표로 다시 변환 (Portal 렌더링용)
    const viewportX = finalX + containerRect.left;
    const viewportY = finalY + containerRect.top;

    console.log('📍 최종 위치 (근본 해결):', {
      컨테이너기준: { x: finalX, y: finalY },
      뷰포트기준: { x: viewportX, y: viewportY }
    });

    return { x: viewportX, y: viewportY };
  }, []);

  return calculatePosition;
};

// 🔥 근본적 해결책 2: ResizeObserver를 활용한 안정적인 측정
const useStableRect = (ref) => {
  const [rect, setRect] = useState(null);
  
  useEffect(() => {
    if (!ref.current) return;
    
    let timeoutId;
    
    const observer = new ResizeObserver((entries) => {
      console.log('📏 ResizeObserver 감지');
      for (const entry of entries) {
        // 🔥 reflow 없이 안정적인 크기 제공
        const boundingRect = entry.target.getBoundingClientRect();
        
        setRect({
          left: boundingRect.left,
          top: boundingRect.top,
          width: boundingRect.width,
          height: boundingRect.height,
          right: boundingRect.right,
          bottom: boundingRect.bottom
        });
      }
    });
    
    observer.observe(ref.current);
    
    // 🔥 초기 측정을 위한 지연 (styled-components 타이밍 이슈 해결)
    timeoutId = setTimeout(() => {
      if (ref.current) {
        const initialRect = ref.current.getBoundingClientRect();
        setRect(initialRect);
        console.log('📏 초기 Rect 측정 완료:', initialRect);
      }
    }, 150); // styled-components 렌더링 완료 대기
    
    return () => {
      observer.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);
  
  return rect;
};

// 🔥 근본적 해결책 3: 통합 포인터 이벤트 처리
const useUnifiedPointerEvents = (onContextMenu, containerRef) => {
  const longPressTimer = useRef(null);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressExecuted = useRef(false);
  const calculatePosition = useContextMenuPosition();

  const handlePointerDown = useCallback((event) => {
    console.log('🔥 통합 포인터 이벤트 시작:', {
      type: event.type,
      pointerType: event.pointerType,
      button: event.button,
      isTrusted: event.isTrusted
    });

    // 이미지 요소는 제외
    if (event.target.tagName && event.target.tagName.toLowerCase() === 'img') {
      return;
    }

    // 🔥 우클릭 처리 (데스크톱)
    if (event.button === 2) {
      event.preventDefault();
      console.log('🖱️ 우클릭 감지 - 즉시 메뉴 표시');
      const position = calculatePosition(event, containerRef);
      onContextMenu(event, position);
      return;
    }

    // 🔥 터치/포인터 이벤트 처리 (모바일/하이브리드)
    if (event.button === 0 || event.pointerType === 'touch' || event.type === 'touchstart') {
      setIsLongPressing(true);
      longPressExecuted.current = false;

      longPressTimer.current = setTimeout(() => {
        if (!longPressExecuted.current) {
          console.log('📱 장누르기 완료 - 메뉴 표시');
          longPressExecuted.current = true;
          setIsLongPressing(false);
          
          const position = calculatePosition(event, containerRef);
          onContextMenu(event, position);
        }
      }, 500); // 모바일 표준 장누르기 시간
    }
  }, [onContextMenu, containerRef, calculatePosition]);

  const handlePointerUp = useCallback((event) => {
    console.log('🔥 포인터 이벤트 종료:', event.type);
    
    setIsLongPressing(false);
    
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // 🔥 컨텍스트 메뉴 직접 처리 (네이티브 이벤트)
  const handleContextMenu = useCallback((event) => {
    event.preventDefault();
    console.log('🖱️ 네이티브 컨텍스트메뉴 이벤트');
    
    const position = calculatePosition(event, containerRef);
    onContextMenu(event, position);
  }, [onContextMenu, containerRef, calculatePosition]);

  // 메모리 정리
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  // 🔥 Pointer Events API 지원 여부에 따른 핸들러 반환
  const supportsPointerEvents = typeof window !== 'undefined' && window.PointerEvent;
  
  if (supportsPointerEvents) {
    console.log('🎯 Pointer Events API 사용');
    return {
      eventHandlers: {
        onPointerDown: handlePointerDown,
        onPointerUp: handlePointerUp,
        onPointerLeave: handlePointerUp,
        onPointerCancel: handlePointerUp,
        onContextMenu: handleContextMenu
      },
      isLongPressing
    };
  } else {
    console.log('🎯 전통적인 이벤트 사용');
    return {
      eventHandlers: {
        onMouseDown: handlePointerDown,
        onMouseUp: handlePointerUp,
        onMouseLeave: handlePointerUp,
        onTouchStart: handlePointerDown,
        onTouchEnd: handlePointerUp,
        onTouchCancel: handlePointerUp,
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

  // 🔥 핵심: 채팅 컨테이너 참조 찾기
  const containerRef = useRef(null);
  
  useEffect(() => {
    // 🔥 상위 채팅 컨테이너 자동 탐지
    const findChatContainer = (element) => {
      let current = element;
      while (current && current !== document.body) {
        const computedStyle = window.getComputedStyle(current);
        const maxWidth = computedStyle.maxWidth;
        
        // max-width: 750px인 컨테이너 찾기
        if (maxWidth === '750px' || current.classList.toString().includes('Container')) {
          return current;
        }
        current = current.parentElement;
      }
      return document.body;
    };

    if (containerRef.current) {
      const chatContainer = findChatContainer(containerRef.current);
      containerRef.current = chatContainer;
      console.log('🎯 채팅 컨테이너 탐지:', chatContainer.tagName, chatContainer.className);
    }
  }, []);

  // 🔥 새로운 통합 이벤트 시스템 사용
  const { eventHandlers, isLongPressing } = useUnifiedPointerEvents(
    (event, position) => {
      console.log('🎯 컨텍스트 메뉴 콜백 (근본 해결):', position);
      
      setContextMenu({
        isVisible: true,
        position: { x: position.x, y: position.y }
      });
    },
    containerRef
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
    <MessageContainer 
      id={`message-${message.message_idx}`} 
      $isCurrentUser={isCurrentUser}
      ref={containerRef}
    >
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
          {/* 🔥 핵심: 새로운 통합 이벤트 핸들러 적용 */}
          <MessageBubble 
            $isCurrentUser={isCurrentUser}
            {...eventHandlers} // 🔥 근본 문제가 해결된 핸들러
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