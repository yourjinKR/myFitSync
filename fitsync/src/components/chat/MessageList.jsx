import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import MessageItem from './MessageItem';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

// 하루 단위 날짜 구분선 컴포넌트
const DateSeparator = styled.div`
  text-align: center;
  margin: 20px 0 10px 0;
  position: relative;
  
  /* 구분선 스타일 */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background-color: var(--border-light);
  }
`;

const DateText = styled.span`
  background-color: var(--bg-secondary);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 1.2rem;
  color: var(--text-secondary);
  position: relative;
  z-index: 1;
  border: 1px solid var(--border-light);
`;

// 읽지 않은 메시지 구분선 컴포넌트
const UnreadSeparator = styled.div`
  text-align: center;
  margin: 16px 0;
  position: relative;
  
  /* 파란색 구분선 스타일 */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent 0%, var(--primary-blue) 20%, var(--primary-blue) 80%, transparent 100%);
  }
`;

const UnreadText = styled.span`
  background-color: var(--bg-secondary);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 1.2rem;
  color: var(--text-secondary);
  position: relative;
  z-index: 1;
  border: 1px solid var(--border-light);
`;

// onImageLoad 콜백 props 추가
const MessageList = ({ 
  messages, 
  currentMemberIdx, 
  attachments, 
  roomData,
  onImageLoad = null // 이미지 로딩 완료 콜백 추가
}) => {
  
  // 가장 오래된 읽지 않은 메시지 ID를 고정하여 저장
  const [fixedOldestUnreadMessageIdx, setFixedOldestUnreadMessageIdx] = useState(null);

  // 초기 읽지 않은 메시지 중 가장 오래된 메시지 ID 계산 (한 번만)
  const initialOldestUnreadMessageIdx = useMemo(() => {
    const unreadMessages = messages.filter(msg => 
      msg.sender_idx !== currentMemberIdx && !msg.message_readdate
    );
    
    if (unreadMessages.length === 0) return null;
    
    const oldestUnreadMessage = unreadMessages.reduce((oldest, current) => {
      const oldestTime = new Date(oldest.message_senddate).getTime();
      const currentTime = new Date(current.message_senddate).getTime();
      return currentTime < oldestTime ? current : oldest;
    });
    
    console.log('🔒 초기 가장 오래된 읽지 않은 메시지 ID 고정:', oldestUnreadMessage.message_idx);
    return oldestUnreadMessage.message_idx;
  }, [messages.length]); // messages.length가 변경될 때만 재계산 (새 메시지 추가 시)

  // 고정된 가장 오래된 읽지 않은 메시지 ID 설정
  useEffect(() => {
    if (initialOldestUnreadMessageIdx && fixedOldestUnreadMessageIdx === null) {
      setFixedOldestUnreadMessageIdx(initialOldestUnreadMessageIdx);
      console.log('✅ 구분선 위치 고정:', initialOldestUnreadMessageIdx);
    }
  }, [initialOldestUnreadMessageIdx, fixedOldestUnreadMessageIdx]);

  // 날짜를 한국어 형식으로 포맷
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 날짜 구분선 표시 여부 결정
  const shouldShowDateSeparator = (currentMessage, previousMessage) => {
    // 첫 번째 메시지인 경우 항상 구분선 표시
    if (!previousMessage) return true;
    
    // 현재 메시지와 이전 메시지의 날짜 비교
    const currentDate = new Date(currentMessage.message_senddate).toDateString();
    const previousDate = new Date(previousMessage.message_senddate).toDateString();
    
    // 날짜가 다르면 구분선 표시
    return currentDate !== previousDate;
  };

  // 읽지 않은 메시지 구분선 표시 여부 결정 (고정된 ID 사용)
  const shouldShowUnreadSeparator = (currentMessage) => {
    // 고정된 가장 오래된 읽지 않은 메시지 ID가 없으면 구분선 표시하지 않음
    if (!fixedOldestUnreadMessageIdx) return false;
    
    // 현재 메시지가 고정된 가장 오래된 읽지 않은 메시지인지 확인
    const shouldShow = currentMessage.message_idx === fixedOldestUnreadMessageIdx;
    
    console.log('📍 읽지 않은 메시지 구분선 체크 (고정):', {
      currentMessageIdx: currentMessage.message_idx,
      fixedOldestUnreadMessageIdx: fixedOldestUnreadMessageIdx,
      shouldShow: shouldShow
    });
    
    return shouldShow;
  };

  // 발신자 이름 생성 (상대방 메시지에만 필요)
  const getSenderName = (message) => {
    // 내 메시지인 경우 이름 불필요
    if (message.sender_idx === currentMemberIdx) {
      return null;
    }
    
    // 상대방 메시지인 경우
    // roomData에서 상대방 정보 확인
    if (roomData && currentMemberIdx) {
      // 현재 사용자가 트레이너인지 일반 사용자인지 확인
      if (roomData.trainer_idx === currentMemberIdx) {
        // 내가 트레이너면 상대방은 회원 - roomData.user_name 사용
        return roomData.user_name || '회원';
      } else {
        // 내가 일반 사용자면 상대방은 트레이너 - roomData.trainer_name 사용
        return roomData.trainer_name || '트레이너';
      }
    }
    
    // 기본값
    return '상대방';
  };

  // 연속 메시지 체크 (같은 발신자의 연속 메시지인지 확인)
  const isConsecutiveMessage = (currentMessage, previousMessage) => {
    if (!previousMessage) return false;
    
    // 같은 발신자이고, 시간 차이가 5분 이내인 경우
    const timeDiff = new Date(currentMessage.message_senddate) - new Date(previousMessage.message_senddate);
    const fiveMinutes = 5 * 60 * 1000;
    
    return currentMessage.sender_idx === previousMessage.sender_idx && timeDiff < fiveMinutes;
  };

  // 이미지 로딩 완료 핸들러 - 부모 컴포넌트로 전달
  const handleImageLoad = (messageIdx) => {
    console.log('📷 MessageList: 이미지 로딩 완료 콜백 수신:', messageIdx);
    if (onImageLoad) {
      onImageLoad(messageIdx);
    }
  };

  return (
    <Container>
      {messages.map((message, index) => {
        const previousMessage = messages[index - 1];
        const isConsecutive = isConsecutiveMessage(message, previousMessage);
        const senderName = getSenderName(message);
        
        return (
          <React.Fragment key={message.message_idx}>
            {/* 날짜 구분선 (필요한 경우에만 표시) */}
            {shouldShowDateSeparator(message, previousMessage) && (
              <DateSeparator>
                <DateText>{formatDate(message.message_senddate)}</DateText>
              </DateSeparator>
            )}
            
            {/* 읽지 않은 메시지 구분선 (고정된 위치에만 표시) */}
            {shouldShowUnreadSeparator(message) && (
              <UnreadSeparator>
                <UnreadText>여기서부터 안읽음</UnreadText>
              </UnreadSeparator>
            )}
            
            {/* 개별 메시지 컴포넌트 */}
            <MessageItem
              message={message}
              isCurrentUser={message.sender_idx === currentMemberIdx}
              attachments={attachments[message.message_idx] || null} // 단일 객체 전달
              senderName={isConsecutive ? null : senderName} // 연속 메시지가 아닐 때만 이름 표시
              onImageLoad={handleImageLoad} // 이미지 로딩 완료 콜백 전달
            />
          </React.Fragment>
        );
      })}
    </Container>
  );
};

export default MessageList;