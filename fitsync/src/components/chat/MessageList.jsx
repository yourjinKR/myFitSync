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

// 카카오톡 스타일 메시지 그룹핑과 프로필 이미지 추가
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

  // 원래 카카오톡 스타일 그룹핑으로 복원 (분 단위)
  const isConsecutiveMessage = (currentMessage, previousMessage) => {
    if (!previousMessage) return false;
    
    // 같은 발신자이고, 같은 분(minute) 내의 메시지인지 확인
    const currentTime = new Date(currentMessage.message_senddate);
    const previousTime = new Date(previousMessage.message_senddate);
    
    const isSameSender = currentMessage.sender_idx === previousMessage.sender_idx;
    const isSameMinute = currentTime.getFullYear() === previousTime.getFullYear() &&
                         currentTime.getMonth() === previousTime.getMonth() &&
                         currentTime.getDate() === previousTime.getDate() &&
                         currentTime.getHours() === previousTime.getHours() &&
                         currentTime.getMinutes() === previousTime.getMinutes();
    
    return isSameSender && isSameMinute;
  };

  // 그룹의 마지막 메시지인지 확인 (시간 표시 여부 결정용)
  const isLastInGroup = (currentMessage, nextMessage) => {
    if (!nextMessage) return true; // 마지막 메시지
    
    // 다음 메시지가 다른 발신자이거나 다른 분(minute)이면 그룹의 마지막
    const currentTime = new Date(currentMessage.message_senddate);
    const nextTime = new Date(nextMessage.message_senddate);
    
    const isDifferentSender = currentMessage.sender_idx !== nextMessage.sender_idx;
    const isDifferentMinute = currentTime.getFullYear() !== nextTime.getFullYear() ||
                              currentTime.getMonth() !== nextTime.getMonth() ||
                              currentTime.getDate() !== nextTime.getDate() ||
                              currentTime.getHours() !== nextTime.getHours() ||
                              currentTime.getMinutes() !== nextTime.getMinutes();
    
    return isDifferentSender || isDifferentMinute;
  };

  // 프로필 표시 로직 - 연속 메시지가 아닐 때만 프로필 표시
  const getOtherPersonInfo = (message, isConsecutive) => {
    if (!roomData) return { name: '상대방', image: null };
    
    // 메시지 발신자가 현재 사용자가 아닌 경우 (상대방 메시지)
    if (message.sender_idx !== currentMemberIdx) {
      // 연속 메시지인 경우 프로필 정보 반환하지 않음
      if (isConsecutive) {
        return { name: null, image: null };
      }
      
      // 그룹의 첫 번째 메시지인 경우에만 프로필 정보 반환
      if (roomData.trainer_idx === currentMemberIdx) {
        // 내가 트레이너면 상대방은 회원
        return {
          name: roomData.user_name || '회원',
          image: roomData.user_image
        };
      } else {
        // 내가 일반 사용자면 상대방은 트레이너
        return {
          name: roomData.trainer_name || '트레이너',
          image: roomData.trainer_image
        };
      }
    }
    
    return { name: null, image: null }; // 내 메시지는 프로필 불필요
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
        const nextMessage = messages[index + 1];
        const isConsecutive = isConsecutiveMessage(message, previousMessage);
        const isLastMessage = isLastInGroup(message, nextMessage);
        const otherPersonInfo = getOtherPersonInfo(message, isConsecutive);
        
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
              senderName={otherPersonInfo.name} // 연속 메시지 체크를 getOtherPersonInfo에서 처리
              senderImage={otherPersonInfo.image} // 연속 메시지 체크를 getOtherPersonInfo에서 처리
              showTime={isLastMessage} // 그룹의 마지막 메시지에만 시간 표시
              onImageLoad={handleImageLoad} // 이미지 로딩 완료 콜백 전달
            />
          </React.Fragment>
        );
      })}
    </Container>
  );
};

export default MessageList;