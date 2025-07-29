import React, { useCallback, useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import ImageModal from './ImageModal';
import MessageContextMenu from './MessageContextMenu';
import { useSelector } from 'react-redux';
import chatApi from '../../utils/ChatApi';

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
  
  ${props => props.$isConsecutive && !props.$isCurrentUser ? `
    margin-left: 44px;
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

// 매칭 버튼 컨테이너 스타일
const MatchingContainer = styled.div`
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

// 매칭 요청 버튼 스타일
const MatchingButton = styled.button`
  background: ${props => props.$disabled ? 'var(--border-medium)' : 'var(--primary-blue)'};
  color: ${props => props.$disabled ? 'var(--text-tertiary)' : 'white'};
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 1.3rem;
  font-weight: 600;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  &:hover:not(:disabled) {
    background: var(--primary-blue-hover);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(74, 144, 226, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  &:disabled {
    opacity: 0.6;
    transform: none;
  }
`;

// 매칭 상태 표시 스타일
const MatchingStatus = styled.div`
  font-size: 1.2rem;
  color: var(--text-secondary);
  font-style: italic;
  padding: 4px 8px;
  background: var(--bg-tertiary);
  border-radius: 6px;
  border: 1px solid var(--border-light);
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

const MessageInfo = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  font-size: 1.1rem;
  opacity: 0.7;
  white-space: nowrap;
  min-width: fit-content;
  flex-shrink: 0;
  margin-top: 0;
  
  opacity: ${props => props.$showTime ? 0.7 : 0};
  visibility: ${props => props.$showTime ? 'visible' : 'hidden'};
  
  ${props => props.$isCurrentUser ? 'flex-direction: row;' : 'flex-direction: row-reverse;'}
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
  white-space: nowrap;
`;

const ReadTime = styled.span`
  font-size: 0.9rem;
  color: var(--text-tertiary);
`;

// 강화된 매칭 데이터 파싱 함수
const parseMatchingDataFromMessage = (message) => {
  console.log('🔍 매칭 데이터 파싱 시작:', {
    messageType: message.message_type,
    messageContent: message.message_content,
    messageIdx: message.message_idx
  });

  if (message.message_type !== 'matching_request') {
    console.log('❌ 매칭 요청 메시지가 아님');
    return null;
  }

  if (!message.message_content) {
    console.log('❌ 메시지 내용이 없음');
    return null;
  }

  try {
    const content = message.message_content;
    console.log('🔍 파싱할 메시지 내용:', content);

    // 다양한 패턴으로 매칭 데이터 추출 시도
    const patterns = [
      /\|MATCHING_DATA:(.+)$/,           // 기본 패턴
      /MATCHING_DATA:(.+)$/,             // | 없는 패턴
      /\{.*"matching_idx".*\}/,          // JSON 패턴 직접 매칭
    ];

    let matchingDataStr = null;

    // 패턴별로 시도
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        if (pattern === patterns[2]) {
          // JSON 패턴인 경우 전체 매치 사용
          matchingDataStr = match[0];
        } else {
          // 캡처 그룹 사용
          matchingDataStr = match[1];
        }
        console.log('✅ 패턴 매칭 성공:', pattern, '→', matchingDataStr);
        break;
      }
    }

    if (!matchingDataStr) {
      console.log('❌ 매칭 데이터 패턴을 찾을 수 없음');
      return null;
    }

    // JSON 파싱 시도
    const matchingData = JSON.parse(matchingDataStr);
    console.log('✅ 매칭 데이터 파싱 성공:', matchingData);

    // 필수 필드 검증
    if (!matchingData.matching_idx) {
      console.log('❌ matching_idx가 없음');
      return null;
    }

    return matchingData;

  } catch (error) {
    console.error('❌ 매칭 데이터 파싱 실패:', error);
    console.error('❌ 파싱 실패한 내용:', message.message_content);
    return null;
  }
};

// 표시용 메시지 내용 정리하는 함수
const getDisplayMessageContent = (message) => {
  if (message.message_type !== 'matching_request') {
    return message.message_content;
  }

  try {
    const content = message.message_content || '';
    
    // 다양한 패턴으로 매칭 데이터 부분 제거
    const patterns = [
      /\|MATCHING_DATA:.+$/,
      /MATCHING_DATA:.+$/,
      /\{.*"matching_idx".*\}$/
    ];

    let displayContent = content;
    
    for (const pattern of patterns) {
      displayContent = displayContent.replace(pattern, '').trim();
      if (displayContent !== content) {
        console.log('✅ 표시용 메시지 내용 정리:', displayContent);
        break;
      }
    }

    return displayContent || content;
  } catch (error) {
    console.error('❌ 표시용 메시지 내용 정리 실패:', error);
    return message.message_content;
  }
};

// useContextMenuPosition 훅
const useContextMenuPosition = () => {
  const calculatePosition = useCallback((event, containerRef) => {
    if (!containerRef.current) {
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

// MessageItem 컴포넌트
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
  onScrollToMessage = null,
  roomData = null
}) => {

  // Redux에서 사용자 정보 가져오기
  const { user } = useSelector(state => state.user);

  // 매칭 데이터 파싱 및 로깅
  const parsedMatchingData = parseMatchingDataFromMessage(message);
  const displayContent = getDisplayMessageContent(message);

  console.log('🎯 MessageItem 렌더링:', {
    messageIdx: message.message_idx,
    messageType: message.message_type,
    isMatchingRequest: message.message_type === 'matching_request',
    parsedMatchingData: parsedMatchingData,
    matchingIdx: parsedMatchingData?.matching_idx
  });

  // 매칭 데이터 추출 (파싱된 데이터 사용)
  const matchingData = parsedMatchingData || {};
  const matchingIdx = matchingData.matching_idx;
  const matchingTotal = matchingData.matching_total || 0;
  const matchingComplete = matchingData.matching_complete || 0;

  // 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [contextMenu, setContextMenu] = useState({
    isVisible: false,
    position: { x: 0, y: 0 }
  });
  
  // 매칭 관련 상태
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [hasCompletedMatchingWithTrainer, setHasCompletedMatchingWithTrainer] = useState(false);
  const [isMatchingCheckComplete, setIsMatchingCheckComplete] = useState(false);

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

  // 매칭 요청 메시지 여부 확인
  const isMatchingRequestMessage = message.message_type === 'matching_request';

  // 매칭 버튼 클릭 가능 여부 (회원만 클릭 가능, 자신이 보낸 매칭 요청은 클릭 불가)
  const canClickMatchingButton = !isCurrentUser && user?.member_type === 'user';

  console.log('🎯 매칭 버튼 상태 분석:', {
    isMatchingRequestMessage,
    canClickMatchingButton,
    matchingIdx,
    userMemberType: user?.member_type,
    isCurrentUser
  });

  // 완료된 매칭 확인 (조건부 실행)
  useEffect(() => {
    if (isMatchingRequestMessage && canClickMatchingButton && !isMatchingCheckComplete && roomData) {
      console.log('🔍 완료된 매칭 확인 시작...');
      checkCompletedMatchingWithTrainer();
    }
  }, [isMatchingRequestMessage, canClickMatchingButton, isMatchingCheckComplete, user?.member_idx, roomData]);

  // 특정 트레이너와의 완료된 매칭 확인 함수
  const checkCompletedMatchingWithTrainer = async () => {
    try {
      const currentTrainerIdx = roomData?.trainer_idx;
      
      console.log('🔍 매칭 확인 파라미터:', {
        currentTrainerIdx,
        userMemberIdx: user.member_idx,
        roomData
      });
      
      if (!currentTrainerIdx) {
        console.log('❌ 트레이너 IDX 없음');
        setHasCompletedMatchingWithTrainer(false);
        setIsMatchingCheckComplete(true);
        return;
      }
      
      const result = await chatApi.checkCompletedMatchingBetween(currentTrainerIdx, user.member_idx);
      
      console.log('✅ 매칭 확인 결과:', result);
      
      if (result.success) {
        setHasCompletedMatchingWithTrainer(result.hasCompletedMatching);
        setIsMatchingCheckComplete(true);
      } else {
        setHasCompletedMatchingWithTrainer(false);
        setIsMatchingCheckComplete(true);
      }
      
    } catch (error) {
      console.error('❌ 매칭 확인 중 오류:', error);
      setHasCompletedMatchingWithTrainer(false);
      setIsMatchingCheckComplete(true);
    }
  };

  // 매칭 요청 수락 핸들러
  const handleMatchingAccept = async () => {
    console.log('🎯 매칭 수락 클릭:', {
      matchingIdx,
      matchingData,
      parsedMatchingData
    });

    if (!matchingIdx) {
      alert('매칭 정보를 찾을 수 없습니다. 메시지가 손상되었을 수 있습니다.');
      return;
    }
    
    if (matchingLoading) {
      return;
    }
    
    if (hasCompletedMatchingWithTrainer) {
      alert('해당 트레이너와 이미 진행 중인 매칭이 있습니다.');
      return;
    }
    
    setMatchingLoading(true);
    
    try {
      console.log('📤 매칭 수락 API 호출:', matchingIdx);
      const result = await chatApi.acceptMatching(matchingIdx);
      
      console.log('📥 매칭 수락 결과:', result);
      
      if (result.success) {
        alert('매칭이 성공적으로 수락되었습니다!');
        setHasCompletedMatchingWithTrainer(true);
      } else {
        alert(result.message || '매칭 수락에 실패했습니다.');
        await checkCompletedMatchingWithTrainer();
      }
      
    } catch (error) {
      console.error('❌ 매칭 수락 중 오류:', error);
      alert('매칭 수락 중 오류가 발생했습니다.');
      await checkCompletedMatchingWithTrainer();
    } finally {
      setMatchingLoading(false);
    }
  };

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
    
    setIsModalOpen(true);
  }, [attachments, isLongPressing]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleContextMenuClose = useCallback(() => {
    setContextMenu({ isVisible: false, position: { x: 0, y: 0 } });
  }, []);

  const handleCopy = useCallback((message) => {
    // 복사 완료 처리
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
    setImageLoading(false);
    setLoadingProgress(100);
    
    if (onImageLoad) {
      setTimeout(() => {
        onImageLoad(message.message_idx);
      }, 100);
    }
  }, [onImageLoad, message.message_idx]);

  const handleImageError = useCallback(() => {
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

  // 프로필 이미지 렌더링
  const renderProfileImage = () => {
    if (isCurrentUser) return null;
    
    const hasValidImage = senderImage && 
                         typeof senderImage === 'string' && 
                         senderImage.trim() !== '' &&
                         senderImage.startsWith('http');
    
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

  // 매칭 상태 렌더링 함수
  const renderMatchingStatus = () => {
    console.log('🎯 매칭 상태 렌더링:', {
      canClickMatchingButton,
      isMatchingCheckComplete,
      hasCompletedMatchingWithTrainer,
      matchingIdx,
      parsedMatchingData
    });

    if (canClickMatchingButton) {
      // 회원 계정에서 보는 경우
      
      // API 호출 완료 전에는 로딩 상태 표시
      if (!isMatchingCheckComplete) {
        return (
          <MatchingButton disabled={true} $disabled={true}>
            상태 확인 중...
          </MatchingButton>
        );
      }
      
      // 이미 완료된 매칭이 있는 경우
      if (hasCompletedMatchingWithTrainer) {
        return <MatchingStatus>해당 트레이너와 이미 진행 중인 매칭이 있습니다</MatchingStatus>;
      }
      
      // 파싱된 매칭 데이터 기반으로 버튼 상태 결정
      if (matchingIdx && typeof matchingIdx === 'number' && matchingIdx > 0) {
        console.log('✅ 매칭 수락 버튼 활성화:', matchingIdx);
        return (
          <MatchingButton
            onClick={handleMatchingAccept}
            disabled={matchingLoading}
            $disabled={matchingLoading}
          >
            {matchingLoading ? '처리 중...' : '매칭수락'}
          </MatchingButton>
        );
      } else {
        console.log('❌ 매칭 정보 파싱 실패:', {
          matchingIdx,
          type: typeof matchingIdx,
          parsedMatchingData
        });
        return (
          <MatchingButton disabled={true} $disabled={true}>
            매칭 정보 파싱 실패
          </MatchingButton>
        );
      }
    } else {
      // 트레이너 계정에서 보거나 다른 상황
      if (isCurrentUser) {
        return <MatchingStatus>매칭 요청 전송됨</MatchingStatus>;
      } else {
        return <MatchingStatus>매칭 요청</MatchingStatus>;
      }
    }
  };

  return (
    <>
    <MessageContainer 
      id={`message-${message.message_idx}`} 
      $isCurrentUser={isCurrentUser}
      $isConsecutive={isConsecutive}
      ref={containerRef}
    >
      {!isCurrentUser && !isConsecutive && senderName && renderProfileImage()}
      
      <MessageGroup $isCurrentUser={isCurrentUser}>
        {!isCurrentUser && senderName && (
          <SenderName $isConsecutive={isConsecutive}>{senderName}</SenderName>
        )}
        
        <MessageWithInfo $isCurrentUser={isCurrentUser}>
          <MessageBubble 
            $isCurrentUser={isCurrentUser}
            {...eventHandlers}
            className={isLongPressing ? 'long-pressing' : ''}
          >
            {/* 답장 미리보기 */}
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
              <MessageText>{displayContent}</MessageText>
            )}

            {/* 매칭 요청 버튼 */}
            {isMatchingRequestMessage && (
              <MatchingContainer>
                {renderMatchingStatus()}
              </MatchingContainer>
            )}
          </MessageBubble>
          
          <MessageInfo $isCurrentUser={isCurrentUser} $showTime={showTime}>
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