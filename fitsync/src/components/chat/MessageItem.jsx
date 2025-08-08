import React, { useCallback, useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ImageModal from './ImageModal';
import MessageContextMenu from './MessageContextMenu';
import UserProfileModal from './UserProfileModal';
import { useSelector } from 'react-redux';
import chatApi from '../../utils/ChatApi';
import { useWebSocket } from '../../hooks/UseWebSocket';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`;

// 메시지 컨테이너 - 연속 메시지 처리를 위한 스타일링
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
  position: relative;
  cursor: ${props => props.$isConsecutive ? 'default' : 'pointer'};
  
  opacity: ${props => props.$isConsecutive ? 0 : 1};
  
  border: ${props => {
    if (props.$gender === '남성') {
      return '2px solid #4A90E2';
    }
    if (props.$gender === '여성') {
      return '2px solid #FF69B4';
    }
    return '1px solid var(--border-light)';
  }};
  
  transition: all 0.3s ease;

  ${props => !props.$isConsecutive && `

    
    &:active {
      transform: scale(0.95);
    }
  `}
  
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
    font-size: 1.4rem;
  }
  
  &.invisible {
    opacity: 0;
    cursor: default;
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

// 발신자 이름 - 연속 메시지에서는 숨김
const SenderName = styled.div`
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin-bottom: 4px;
  margin-left: 4px;
  order: 1;
  
  display: ${props => props.$isConsecutive ? 'none' : 'block'};
`;

// 메시지 말풍선 - 터치 이벤트 및 컨텍스트 메뉴 지원
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

// 매칭 버튼 컨테이너 - 트레이너/회원 구분하여 스타일 적용
const MatchingContainer = styled.div`
  margin-top: ${props => props.$isCurrentUser ? '8px' : '12px'};
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  
  /* 트레이너(본인)가 보낸 매칭 메시지의 경우 말풍선과 통합된 느낌 */
  ${props => props.$isCurrentUser && `
    margin-top: 0px;
    padding-top: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    justify-content: flex-end;
  `}
`;

// 매칭 요청/수락 버튼 - 트레이너/회원 구분 스타일
const MatchingButton = styled.button`
  background: ${props => {
    if (props.$disabled) return 'var(--border-medium)';
    if (props.$isCurrentUser) return 'rgba(255, 255, 255, 0.2)'; // 트레이너용: 투명한 배경
    return 'var(--primary-blue)'; // 회원용: 파란색 배경
  }};
  color: ${props => {
    if (props.$disabled) return 'var(--text-tertiary)';
    if (props.$isCurrentUser) return 'white'; // 트레이너용: 흰색 텍스트
    return 'white'; // 회원용: 흰색 텍스트
  }};
  border: ${props => {
    if (props.$disabled) return 'none';
    if (props.$isCurrentUser) return '1px solid rgba(255, 255, 255, 0.3)'; // 트레이너용: 투명한 테두리
    return 'none'; // 회원용: 테두리 없음
  }};
  padding: 8px 16px;
  border-radius: ${props => props.$isCurrentUser ? '8px' : '8px'};
  font-size: 1.3rem;
  font-weight: 600;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  white-space: nowrap;
  box-shadow: ${props => {
    if (props.$disabled) return 'none';
    if (props.$isCurrentUser) return '0 1px 3px rgba(0,0,0,0.1)'; // 트레이너용: 약한 그림자
    return '0 2px 4px rgba(0,0,0,0.1)'; // 회원용: 일반 그림자
  }};
  backdrop-filter: ${props => props.$isCurrentUser && !props.$disabled ? 'blur(10px)' : 'none'};
  
  &:hover:not(:disabled) {
    background: ${props => {
      if (props.$isCurrentUser) return 'rgba(255, 255, 255, 0.3)'; // 트레이너용: 더 진한 투명
      return 'var(--primary-blue-hover)'; // 회원용: 호버 색상
    }};
    transform: translateY(-1px);
    box-shadow: ${props => {
      if (props.$isCurrentUser) return '0 2px 6px rgba(0,0,0,0.15)'; // 트레이너용
      return '0 4px 8px rgba(74, 144, 226, 0.3)'; // 회원용
    }};
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: ${props => {
      if (props.$isCurrentUser) return '0 1px 3px rgba(0,0,0,0.1)';
      return '0 2px 4px rgba(0,0,0,0.1)';
    }};
  }
  
  &:disabled {
    opacity: 0.6;
    transform: none;
  }
`;

// 매칭 상태 표시 - 트레이너/회원 구분 스타일
const MatchingStatus = styled.div`
  font-size: 1.2rem;
  color: ${props => {
    if (props.$isCurrentUser) return 'rgba(255, 255, 255, 0.8)'; // 트레이너용: 투명한 흰색
    return 'var(--text-secondary)'; // 회원용: 일반 보조 텍스트
  }};
  font-style: italic;
  padding: 4px 8px;
  background: ${props => {
    if (props.$isCurrentUser) return 'rgba(255, 255, 255, 0.1)'; // 트레이너용: 투명한 배경
    return 'var(--bg-tertiary)'; // 회원용: 일반 배경
  }};
  border-radius: 6px;
  border: ${props => {
    if (props.$isCurrentUser) return '1px solid rgba(255, 255, 255, 0.2)'; // 트레이너용
    return '1px solid var(--border-light)'; // 회원용
  }};
  backdrop-filter: ${props => props.$isCurrentUser ? 'blur(5px)' : 'none'};
`;

// 답장 컨테이너
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

// 이미지 로딩 컨테이너
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

// 매칭 데이터 파싱 함수 - DB 저장된 JSON 문자열을 우선적으로 파싱
const parseMatchingDataFromMessage = (message) => {
  if (message.message_type !== 'matching_request') {
    return null;
  }

  // DB에서 조회한 matching_data 필드 (JSON 문자열) 우선 처리
  if (message.matching_data && typeof message.matching_data === 'string' && message.matching_data.trim() !== '') {
    try {
      const matchingData = JSON.parse(message.matching_data);
      
      // 필수 필드 검증
      if (matchingData.matching_idx && typeof matchingData.matching_idx === 'number') {
        return matchingData;
      }
    } catch (error) {
      // JSON 파싱 실패 시 다음 방법으로 fallback
    }
  }

  // WebSocket으로 수신한 matching_data_map (실시간 메시지용)
  if (message.matching_data_map && typeof message.matching_data_map === 'object' && message.matching_data_map !== null) {
    if (message.matching_data_map.matching_idx && typeof message.matching_data_map.matching_idx === 'number') {
      return message.matching_data_map;
    }
  }

  return null;
};

// 표시용 메시지 내용 정리 - 매칭 데이터가 포함된 경우 정리된 내용 반환
const getDisplayMessageContent = (message) => {
  if (message.message_type !== 'matching_request') {
    return message.message_content;
  }

  // DB 저장된 매칭 메시지는 message_content를 그대로 사용
  if (message.matching_data && typeof message.matching_data === 'string') {
    return message.message_content;
  }

  // 기존 방식 (폴백용)
  try {
    const content = message.message_content || '';
    
    const patterns = [
      /\|MATCHING_DATA:.+$/,
      /MATCHING_DATA:.+$/,
      /\{.*"matching_idx".*\}$/
    ];

    let displayContent = content;
    
    for (const pattern of patterns) {
      displayContent = displayContent.replace(pattern, '').trim();
      if (displayContent !== content) {
        break;
      }
    }

    return displayContent || content;
  } catch (error) {
    return message.message_content;
  }
};

// 컨텍스트 메뉴 위치 계산 훅 - 뷰포트 경계를 고려한 안전한 위치 계산
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

// 통합 포인터 이벤트 훅 - 마우스와 터치 이벤트를 통합하여 처리(롱프레스와 우클릭 지원)
const useUnifiedPointerEvents = (onContextMenu, containerRef) => {
  const longPressTimer = useRef(null);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressExecuted = useRef(false);
  const calculatePosition = useContextMenuPosition();

  const handlePointerDown = useCallback((event) => {
    // 이미지 클릭은 제외
    if (event.target.tagName && event.target.tagName.toLowerCase() === 'img') {
      return;
    }

    // 우클릭 처리
    if (event.button === 2) {
      event.preventDefault();
      const position = calculatePosition(event, containerRef);
      onContextMenu(event, position);
      return;
    }

    // 롱프레스 시작
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

// 메시지 아이템 컴포넌트
const MessageItem = ({ 
  message, 
  isCurrentUser, 
  attachments = null,
  senderName = null,
  senderImage = null,
  senderGender = null,
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
  roomData = null,
  hasCompletedMatchingWithTrainer = false,
  isMatchingCheckLoading = false,
  allMessages = [], // 전체 메시지 목록 추가
  currentMemberIdx = null // 현재 회원 ID 추가
}) => {

  // Redux에서 사용자 정보 가져오기
  const { user } = useSelector(state => state.user);
  const navigate = useNavigate();
  
  // WebSocket 훅에서 브로드캐스트 함수 가져오기
  const { broadcastMatchingStatus } = useWebSocket();

  // 매칭 데이터 파싱
  const parsedMatchingData = parseMatchingDataFromMessage(message);
  const displayContent = getDisplayMessageContent(message);

  // 매칭 데이터 추출
  const matchingData = parsedMatchingData || {};
  const matchingIdx = matchingData.matching_idx;
  const matchingTotal = matchingData.matching_total || 0;
  const matchingComplete = matchingData.matching_complete || 0;

  // 실시간 매칭 상태 관리
  const [currentMatchingStatus, setCurrentMatchingStatus] = useState(null);
  const [isMatchingStatusLoading, setIsMatchingStatusLoading] = useState(false);
  const statusFetchedRef = useRef(false);

  // 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [contextMenu, setContextMenu] = useState({
    isVisible: false,
    position: { x: 0, y: 0 }
  });
  
  // 프로필 모달 상태
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileUserInfo, setProfileUserInfo] = useState(null);
  
  // 매칭 관련 상태
  const [matchingLoading, setMatchingLoading] = useState(false);

  const containerRef = useRef(null);

  // 최신 매칭 메시지인지 확인하는 함수
  const isLatestMatchingMessage = useCallback(() => {
    if (message.message_type !== 'matching_request' || !allMessages || !currentMemberIdx) {
      return false;
    }

    // 현재 채팅방의 모든 매칭 메시지 필터링 (같은 room_idx, 같은 sender)
    const matchingMessages = allMessages
      .filter(msg => 
        msg.message_type === 'matching_request' && 
        msg.sender_idx === message.sender_idx &&
        msg.room_idx === message.room_idx
      )
      .sort((a, b) => new Date(b.message_senddate) - new Date(a.message_senddate));

    // 가장 최근 매칭 메시지인지 확인
    return matchingMessages.length > 0 && matchingMessages[0].message_idx === message.message_idx;
  }, [message, allMessages, currentMemberIdx]);

  // 관리자 매칭 체크 함수 - 관리자(member_idx: 141)와의 매칭은 비활성화
  const isAdminMatching = () => {
    if (!roomData || !user) return false;
    
    if (roomData.trainer_idx === 141 || roomData.user_idx === 141) {
      return true;
    }
    
    return false;
  };

  // 프로필 이미지 클릭 핸들러
  const handleProfileImageClick = async () => {
    if (isConsecutive || isCurrentUser) return;
    
    // 상대방 정보 가져오기
    const otherPersonInfo = getOtherPersonInfo();
    if (!otherPersonInfo) return;
    
    try {
      if (otherPersonInfo.type === 'trainer') {
        // 트레이너인 경우 - TrainerDetailView로 이동
        navigate(`/trainer/view/${otherPersonInfo.member_idx}`);
      } else if (otherPersonInfo.type === 'user') {
        // 회원인 경우 - 상세 정보 조회 후 모달 표시
        const response = await axios.get(`/member/user/profile/${otherPersonInfo.member_idx}`, {
          withCredentials: true
        });
        
        // API 응답 구조에 맞게 수정
        if (response.data) {
          setProfileUserInfo(response.data);
          setIsProfileModalOpen(true);
        }
      }
    } catch (error) {
      console.error('프로필 정보 조회 실패:', error);
      // 기본 모달 표시 (user 타입인 경우)
      if (otherPersonInfo.type === 'user') {
        setProfileUserInfo({
          member_name: otherPersonInfo.name,
          member_image: otherPersonInfo.image,
          member_gender: otherPersonInfo.gender,
          member_birth: null
        });
        setIsProfileModalOpen(true);
      }
    }
  };

  // 상대방 정보 가져오기 함수
  const getOtherPersonInfo = () => {
    if (!roomData || !user) {
      return null;
    }
      
    const currentMemberIdx = user.member_idx;
      
    if (roomData.trainer_idx === currentMemberIdx) {
      // 내가 트레이너인 경우 → 회원 반환
      return {
        member_idx: roomData.user_idx,
        name: roomData.user_name || '회원',
        image: roomData.user_image,
        gender: roomData.user_gender,
        type: 'user'
      };
    } else {
      // 내가 일반 사용자인 경우 → 트레이너 반환
      return {
        member_idx: roomData.trainer_idx,
        name: roomData.trainer_name || '트레이너',
        image: roomData.trainer_image,
        gender: roomData.trainer_gender,
        type: roomData.trainer_type || 'trainer'
      };
    }
  };

  // 매칭 상태 조회 - 단 한 번만 실행 - 매칭 요청 메시지의 실시간 상태를 DB에서 조회
  useEffect(() => {
    if (message.message_type !== 'matching_request') {
      return;
    }

    if (!matchingIdx || matchingIdx <= 0) {
      return;
    }

    if (statusFetchedRef.current) {
      return;
    }

    if (isMatchingStatusLoading) {
      return;
    }

    statusFetchedRef.current = true;
    
    const fetchMatchingStatus = async () => {
      setIsMatchingStatusLoading(true);
      
      try {
        const response = await chatApi.getMatchingStatus(matchingIdx);
        
        if (response.success && response.matching) {
          const latestMatchingData = response.matching;
          setCurrentMatchingStatus(latestMatchingData);
        } else {
          setCurrentMatchingStatus(null);
        }
      } catch (error) {
        setCurrentMatchingStatus(null);
      } finally {
        setIsMatchingStatusLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchMatchingStatus, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [matchingIdx]);

  // 채팅 컨테이너 찾기
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

  // 매칭 버튼 클릭 가능 여부 - 최신 매칭 메시지인지도 확인
  const canClickMatchingButton = !isCurrentUser && 
                                user?.member_type === 'user' && 
                                !isAdminMatching() && 
                                isLatestMatchingMessage();

  // 최신 매칭 상태 사용 (DB 조회 결과 우선)
  const latestMatchingComplete = currentMatchingStatus ? currentMatchingStatus.matching_complete : matchingComplete;

  // 매칭 요청 수락 핸들러 - 매칭 상태를 업데이트하고 브로드캐스트 전송
  const handleMatchingAccept = async () => {
    if (!matchingIdx) {
      alert('매칭 정보를 찾을 수 없습니다. 메시지가 손상되었을 수 있습니다.');
      return;
    }
    
    if (matchingLoading) {
      return;
    }
    
    if (isAdminMatching()) {
      alert('관리자와는 매칭을 진행할 수 없습니다.');
      return;
    }
    
    if (hasCompletedMatchingWithTrainer) {
      alert('해당 트레이너와 이미 진행 중인 매칭이 있습니다.');
      return;
    }
    
    setMatchingLoading(true);
    
    try {
      const result = await chatApi.acceptMatching(matchingIdx);
      
      if (result.success) {
        alert('매칭이 성공적으로 수락되었습니다!');
        
        // 로컬 상태 즉시 업데이트
        setCurrentMatchingStatus(prev => ({
          ...prev,
          matching_complete: 1
        }));
        
        // 매칭 상태 브로드캐스트 전송
        if (roomData && broadcastMatchingStatus) {
          const statusData = {
            trainer_idx: roomData.trainer_idx,
            user_idx: user.member_idx,
            status_type: 'accepted',
            matching_idx: matchingIdx
          };
          broadcastMatchingStatus(statusData);
        }
        
      } else {
        alert(result.message || '매칭 수락에 실패했습니다.');
      }
      
    } catch (error) {
      alert('매칭 수락 중 오류가 발생했습니다.');
    } finally {
      setMatchingLoading(false);
    }
  };

  // 통합 포인터 이벤트 처리
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

  // 로딩 진행률 시뮬레이션 - 이미지 업로드 중 사용자 경험 개선
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

  // 프로필 이미지 렌더링 - 이미지 로드 실패 시 초성으로 fallback
  const renderProfileImage = () => {
    if (isCurrentUser) return null;
    
    const hasValidImage = senderImage && 
                         typeof senderImage === 'string' && 
                         senderImage.trim() !== '' &&
                         senderImage.startsWith('http');
    
    if (!senderName) {
      return <ProfileImage className="invisible" $isConsecutive={true} $gender={null} />;
    }
    
    return (
      <ProfileImage 
        $isConsecutive={isConsecutive}
        $gender={senderGender}
        onClick={handleProfileImageClick}
        title={isConsecutive ? '' : '프로필 보기'}
      >
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

  // 읽음 상태 정보 생성
  const getReadStatusInfo = () => {
    if (!isCurrentUser) return null;
    
    if (message.message_readdate) {
      return { text: '읽음', time: null };
    } else {
      return { text: '읽지 않음', time: null };
    }
  };

  const readStatusInfo = getReadStatusInfo();

  // 매칭 상태 렌더링 함수 - 회원/트레이너 구분하여 적절한 UI 표시
  const renderMatchingStatus = () => {
    if (canClickMatchingButton) {
      // 회원 계정에서 보는 경우
      
      if (isAdminMatching()) {
        return (
          <MatchingStatus $isCurrentUser={isCurrentUser}>
            관리자와는 매칭이 불가능합니다
          </MatchingStatus>
        );
      }
      
      if (isMatchingStatusLoading) {
        return (
          <MatchingButton disabled={true} $disabled={true} $isCurrentUser={isCurrentUser}>
            매칭 상태 확인 중...
          </MatchingButton>
        );
      }
      
      if (isMatchingCheckLoading) {
        return (
          <MatchingButton disabled={true} $disabled={true} $isCurrentUser={isCurrentUser}>
            상태 확인 중...
          </MatchingButton>
        );
      }
      
      // 실시간 DB 상태로 매칭 완료 체크
      if (latestMatchingComplete === 2) {
        return (
          <MatchingStatus $isCurrentUser={isCurrentUser}>
            완료된 매칭입니다
          </MatchingStatus>
        );
      }
      
      if (latestMatchingComplete === 1) {
        return (
          <MatchingStatus $isCurrentUser={isCurrentUser}>
            이미 수락된 매칭입니다
          </MatchingStatus>
        );
      }
      
      if (hasCompletedMatchingWithTrainer) {
        return (
          <MatchingStatus $isCurrentUser={isCurrentUser}>
            이미 진행 중인 PT가 있습니다
          </MatchingStatus>
        );
      }
      
      // 매칭 대기 상태에서만 버튼 활성화
      if (matchingIdx && typeof matchingIdx === 'number' && matchingIdx > 0 && latestMatchingComplete === 0) {
        return (
          <MatchingButton
            onClick={handleMatchingAccept}
            disabled={matchingLoading}
            $disabled={matchingLoading}
            $isCurrentUser={isCurrentUser}
          >
            {matchingLoading ? '처리 중...' : '매칭수락'}
          </MatchingButton>
        );
      } else {
        return (
          <MatchingButton disabled={true} $disabled={true} $isCurrentUser={isCurrentUser}>
            {latestMatchingComplete > 0 ? '매칭 처리됨' : '매칭 정보 파싱 실패'}
          </MatchingButton>
        );
      }
    } else if (!isCurrentUser && message.message_type === 'matching_request' && !isLatestMatchingMessage()) {
      // 회원이 보는 이전 매칭 메시지들 - 비활성화
      return (
        <MatchingStatus $isCurrentUser={isCurrentUser}>
          기간이 만료된 요청
        </MatchingStatus>
      );
    } else {
      // 트레이너 계정에서 보거나 다른 상황
      if (isCurrentUser) {
        // 트레이너가 보낸 매칭 요청의 실시간 상태 표시
        if (latestMatchingComplete === 2) {
          return (
            <MatchingStatus $isCurrentUser={isCurrentUser}>
              완료된 매칭
            </MatchingStatus>
          );
        } else if (latestMatchingComplete === 1) {
          return (
            <MatchingStatus $isCurrentUser={isCurrentUser}>
              수락된 매칭
            </MatchingStatus>
          );
        } else {
          return (
            <MatchingStatus $isCurrentUser={isCurrentUser}>
              매칭 요청 전송
            </MatchingStatus>
          );
        }
      } else {
        return (
          <MatchingStatus $isCurrentUser={isCurrentUser}>
            매칭 요청
          </MatchingStatus>
        );
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
            
            {/* 메시지 내용 */}
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
              <MatchingContainer $isCurrentUser={isCurrentUser}>
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

    {/* 회원 프로필 모달 */}
    <UserProfileModal
      isOpen={isProfileModalOpen}
      onClose={() => setIsProfileModalOpen(false)}
      userInfo={profileUserInfo}
    />
    </>
  );
};

export default MessageItem;