import React, { useCallback, useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import ImageModal from './ImageModal';
import MessageContextMenu from './MessageContextMenu';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`;

// 연속 메시지 처리를 위한 컨테이너
const MessageContainer = styled.div`
  display: flex;
  justify-content: ${props => props.$isCurrentUser ? 'flex-end' : 'flex-start'};
  margin-bottom: ${props => props.$isConsecutive ? '3px' : '3px'};
  align-items: flex-start;
  transition: background-color 0.3s ease;
  padding: 2px 8px;
  border-radius: 8px;
  position: relative;
  
  /* 연속 메시지의 경우 왼쪽 여백을 프로필 이미지 + gap 만큼 추가 */
  ${props => props.$isConsecutive && !props.$isCurrentUser ? `
    margin-left: 44px; /* 36px(프로필) + 8px(gap) */
  ` : ''}
  
  gap: ${props => props.$isConsecutive ? '0px' : '8px'};
`;

// 프로필 이미지
const ProfileImage = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  overflow: hidden;
  flex-shrink: 0;
  margin-top: 0;
  
  /* 연속 메시지에서는 투명처리하여 공간은 유지 */
  opacity: ${props => props.$isConsecutive ? 0 : 1};
  
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

// 발신자 이름
const SenderName = styled.div`
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin-bottom: 4px;
  margin-left: 4px;
  order: 1;
  
  /* 연속 메시지에서는 이름 숨김 */
  display: ${props => props.$isConsecutive ? 'none' : 'block'};
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

// ReplyContainer
const ReplyContainer = styled.div`
  margin-bottom: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  opacity: 0.7;
  position: relative;
  cursor: pointer;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 0.9;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: ${props => props.$isCurrentUser ? 'rgba(255, 255, 255, 0.3)' : 'var(--border-light)'};
  }
`;

const ReplyText = styled.div`
  font-size: 1.2rem;
  color: ${props => props.$isCurrentUser ? 'rgba(255, 255, 255, 0.8)' : 'var(--text-secondary)'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
  font-style: italic;
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

// 🔥 수정된 부분: 메시지 정보를 가로로 배치
const MessageInfo = styled.div`
  display: flex;
  flex-direction: row; /* 세로 → 가로로 변경 */
  align-items: center; /* 세로 중앙 정렬 */
  gap: 6px; /* 읽음 상태와 시간 사이 간격 */
  font-size: 1.1rem;
  opacity: 0.7;
  white-space: nowrap;
  min-width: fit-content;
  flex-shrink: 0;
  margin-top: 0;
  
  /* 연속 메시지에서는 시간 정보 숨김 */
  opacity: ${props => props.$showTime ? 0.7 : 0};
  visibility: ${props => props.$showTime ? 'visible' : 'hidden'};
  
  /* 현재 사용자 메시지인 경우 순서 변경 (읽음상태 - 시간) */
  ${props => props.$isCurrentUser ? 'flex-direction: row;' : 'flex-direction: row-reverse;'}
`;

const MessageTime = styled.span`
  color: var(--text-secondary);
  font-size: 1rem;
`;

// 🔥 수정된 부분: ReadStatus 스타일 개선
const ReadStatus = styled.div`
  color: var(--text-secondary);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  white-space: nowrap; /* 텍스트 줄바꿈 방지 */
`;

const ReadTime = styled.span`
  font-size: 0.9rem; /* 폰트 크기 약간 키움 */
  color: var(--text-tertiary);
`;

// useContextMenuPosition 훅
const useContextMenuPosition = () => {
  const calculatePosition = useCallback((event, containerRef) => {
    if (!containerRef.current) {
      console.warn('🚨 컨테이너 참조가 없습니다');
      return { x: 100, y: 100 };
    }

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    let clientX, clientY;
    if (event.touches && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    let relativeX = clientX - containerRect.left;
    let relativeY = clientY - containerRect.top;

    const dpr = window.devicePixelRatio || 1;
    if (dpr !== 1 && dpr > 1.5) {
      relativeX = relativeX / dpr;
      relativeY = relativeY / dpr;
    }

    const menuWidth = 160;
    const menuHeight = 200;
    const padding = 10;

    let finalX = relativeX + padding;
    let finalY = relativeY;

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

    const viewportX = finalX + containerRect.left;
    const viewportY = finalY + containerRect.top;

    return { x: viewportX, y: viewportY };
  }, []);

  return calculatePosition;
};

// useUnifiedPointerEvents 훅
const useUnifiedPointerEvents = (onContextMenu, containerRef) => {
  const longPressTimer = useRef(null);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressExecuted = useRef(false);
  const calculatePosition = useContextMenuPosition();

  const handlePointerDown = useCallback((event) => {
    if (event.target.tagName && event.target.tagName.toLowerCase() === 'img') {
      return;
    }

    if (event.button === 2) {
      event.preventDefault();
      const position = calculatePosition(event, containerRef);
      onContextMenu(event, position);
      return;
    }

    if (event.button === 0 || event.pointerType === 'touch' || event.type === 'touchstart') {
      setIsLongPressing(true);
      longPressExecuted.current = false;

      longPressTimer.current = setTimeout(() => {
        if (!longPressExecuted.current) {
          longPressExecuted.current = true;
          setIsLongPressing(false);
          
          const position = calculatePosition(event, containerRef);
          onContextMenu(event, position);
        }
      }, 500);
    }
  }, [onContextMenu, containerRef, calculatePosition]);

  const handlePointerUp = useCallback((event) => {
    setIsLongPressing(false);
    
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleContextMenu = useCallback((event) => {
    event.preventDefault();
    const position = calculatePosition(event, containerRef);
    onContextMenu(event, position);
  }, [onContextMenu, containerRef, calculatePosition]);

  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  const supportsPointerEvents = typeof window !== 'undefined' && window.PointerEvent;
  
  if (supportsPointerEvents) {
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

// props
const MessageItem = ({ 
  message, 
  isCurrentUser, 
  attachments = null,
  senderName = null,
  senderImage = null,
  showTime = true,
  isConsecutive = false,
  onImageLoad = null,
  onReply = null,
  onDelete = null,
  onReport = null,
  parentMessage = null,
  allAttachments = {},
  getReplyPreviewText = null,
  onScrollToMessage = null
}) => {

  // 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [contextMenu, setContextMenu] = useState({
    isVisible: false,
    position: { x: 0, y: 0 }
  });

  const containerRef = useRef(null);
  
  useEffect(() => {
    const findChatContainer = (element) => {
      let current = element;
      while (current && current !== document.body) {
        const computedStyle = window.getComputedStyle(current);
        const maxWidth = computedStyle.maxWidth;
        
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
    }
  }, []);

  const { eventHandlers, isLongPressing } = useUnifiedPointerEvents(
    (event, position) => {
      setContextMenu({
        isVisible: true,
        position: { x: position.x, y: position.y }
      });
    },
    containerRef
  );

  // 답장 미리보기 텍스트 생성
  const getReplyPreview = (parentMsg) => {
    if (getReplyPreviewText) {
      return getReplyPreviewText(parentMsg, allAttachments);
    }
    
    if (!parentMsg) return '';
    
    if (parentMsg.message_type === 'image') {
      const attachment = allAttachments && allAttachments[parentMsg.message_idx];
      
      if (attachment && attachment.original_filename) {
        return `📷 ${attachment.original_filename}`;
      }
      
      if (parentMsg.message_content && 
          parentMsg.message_content.trim() !== '' && 
          parentMsg.message_content !== '[이미지]') {
        return parentMsg.message_content;
      }
      
      return '📷 이미지';
    }
    
    return parentMsg.message_content || '';
  };

  // 부모 메시지 클릭 핸들러
  const handleReplyClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (parentMessage && onScrollToMessage) {
      console.log('🎯 부모 메시지로 스크롤 이동:', parentMessage.message_idx);
      onScrollToMessage(parentMessage.message_idx);
    }
  }, [parentMessage, onScrollToMessage]);

  // 이미지 클릭 핸들러
  const handleImageClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLongPressing) {
      return;
    }
    
    console.log('🖼️ 이미지 모달 열기:', attachments?.original_filename);
    setIsModalOpen(true);
  }, [attachments, isLongPressing]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleContextMenuClose = useCallback(() => {
    setContextMenu({ isVisible: false, position: { x: 0, y: 0 } });
  }, []);

  const handleCopy = useCallback((message) => {
    console.log('📋 메시지 복사됨:', message.message_content);
  }, []);

  const handleReply = useCallback((message) => {
    onReply && onReply(message);
  }, [onReply]);

  const handleDelete = useCallback((message) => {
    onDelete && onDelete(message);
  }, [onDelete]);

  const handleReport = useCallback((message, reportContent) => {
    onReport && onReport(message, reportContent);
  }, [onReport]);

  const handleImageLoad = useCallback(() => {
    console.log(`✅ 이미지 로딩 완료 - message_idx: ${message.message_idx}`);
    setImageLoading(false);
    setLoadingProgress(100);
    
    if (onImageLoad) {
      setTimeout(() => {
        onImageLoad(message.message_idx);
      }, 100);
    }
  }, [onImageLoad, message.message_idx]);

  const handleImageError = useCallback(() => {
    console.log(`❌ 이미지 로딩 실패 - message_idx: ${message.message_idx}`);
    setImageLoading(false);
    setLoadingProgress(0);
  }, [message.message_idx]);

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
      console.log(`✅ 첨부파일 상태 업데이트 - message_idx: ${message.message_idx}`, attachments);
      setImageLoading(false);
      setLoadingProgress(100);
    }
  }, [attachments, message.message_idx, message.message_type]);
  
  // 시간 포맷팅
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 프로필 이미지 렌더링 - 연속 메시지 고려
  const renderProfileImage = () => {
    if (isCurrentUser) return null;
    
    const hasValidImage = senderImage && 
                         typeof senderImage === 'string' && 
                         senderImage.trim() !== '' &&
                         senderImage.startsWith('http');
    
    // 발신자 이름이 없는 경우 투명 처리
    if (!senderName) {
      return <ProfileImage className="invisible" $isConsecutive={true} />;
    }
    
    return (
      <ProfileImage $isConsecutive={isConsecutive}>
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

  // 🔥 수정된 부분: 읽음 상태 정보 개선
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
    {/* 연속 메시지 prop 전달 */}
    <MessageContainer 
      id={`message-${message.message_idx}`} 
      $isCurrentUser={isCurrentUser}
      $isConsecutive={isConsecutive}
      ref={containerRef}
    >
      {/* 연속 메시지가 아닐 때만 프로필 이미지 렌더링 */}
      {!isCurrentUser && !isConsecutive && senderName && renderProfileImage()}
      
      <MessageGroup $isCurrentUser={isCurrentUser}>
        {/* 연속 메시지에서는 발신자 이름 숨김 */}
        {!isCurrentUser && senderName && (
          <SenderName $isConsecutive={isConsecutive}>{senderName}</SenderName>
        )}
        
        <MessageWithInfo $isCurrentUser={isCurrentUser}>
          <MessageBubble 
            $isCurrentUser={isCurrentUser}
            {...eventHandlers}
            className={isLongPressing ? 'long-pressing' : ''}
          >
            {/* 답장 미리보기 - 클릭 기능 */}
            {parentMessage && (
              <ReplyContainer 
                $isCurrentUser={isCurrentUser}
                onClick={handleReplyClick}
                title="원본 메시지로 이동"
              >
                <ReplyText $isCurrentUser={isCurrentUser}>
                  {getReplyPreview(parentMessage)}
                </ReplyText>
              </ReplyContainer>
            )}
            
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
          
          {/* 🔥 수정된 부분: MessageInfo 구조 변경 */}
          <MessageInfo $isCurrentUser={isCurrentUser} $showTime={showTime}>
            {/* 현재 사용자 메시지인 경우 읽음 상태를 시간 왼쪽에 배치 */}
            {readStatusInfo && (
              <ReadStatus>
                <ReadTime>{readStatusInfo.text}</ReadTime>
              </ReadStatus>
            )}
            <MessageTime>
              {formatTime(message.message_senddate)}
            </MessageTime>
          </MessageInfo>
        </MessageWithInfo>
      </MessageGroup>
    </MessageContainer>

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