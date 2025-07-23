import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import MessageItem from './MessageItem';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DateSeparator = styled.div`
  text-align: center;
  margin: 20px 0 10px 0;
  position: relative;
  
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

const UnreadSeparator = styled.div`
  text-align: center;
  margin: 16px 0;
  position: relative;
  
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

// 핸들러 전달이 추가된 MessageList 컴포넌트
const MessageList = ({ 
  messages, 
  currentMemberIdx, 
  attachments, 
  roomData,
  onImageLoad = null,
  onReply = null, // 답장 핸들러 추가
  onDelete = null, // 삭제 핸들러 추가
  onReport = null // 신고 핸들러 추가
}) => {
  
  const [fixedOldestUnreadMessageIdx, setFixedOldestUnreadMessageIdx] = useState(null);

  // 초기 읽지 않은 메시지 중 가장 오래된 메시지 ID 계산
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
  }, [messages.length, currentMemberIdx]);

  // 고정된 가장 오래된 읽지 않은 메시지 ID 설정
  useEffect(() => {
    if (initialOldestUnreadMessageIdx && fixedOldestUnreadMessageIdx === null) {
      setFixedOldestUnreadMessageIdx(initialOldestUnreadMessageIdx);
      console.log('✅ 구분선 위치 고정:', initialOldestUnreadMessageIdx);
    }
  }, [initialOldestUnreadMessageIdx, fixedOldestUnreadMessageIdx]);

  // 답장 대상 메시지 찾기 함수
  const getParentMessage = (parentIdx) => {
    if (!parentIdx) return null;
    return messages.find(msg => msg.message_idx === parentIdx);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const shouldShowDateSeparator = (currentMessage, previousMessage) => {
    if (!previousMessage) return true;
    
    const currentDate = new Date(currentMessage.message_senddate).toDateString();
    const previousDate = new Date(previousMessage.message_senddate).toDateString();
    
    return currentDate !== previousDate;
  };

  const shouldShowUnreadSeparator = (currentMessage) => {
    if (!fixedOldestUnreadMessageIdx) return false;
    
    const shouldShow = currentMessage.message_idx === fixedOldestUnreadMessageIdx;
    
    console.log('📍 읽지 않은 메시지 구분선 체크 (고정):', {
      currentMessageIdx: currentMessage.message_idx,
      fixedOldestUnreadMessageIdx: fixedOldestUnreadMessageIdx,
      shouldShow: shouldShow
    });
    
    return shouldShow;
  };

  const isConsecutiveMessage = (currentMessage, previousMessage) => {
    if (!previousMessage) return false;
    
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

  const isLastInGroup = (currentMessage, nextMessage) => {
    if (!nextMessage) return true;
    
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

  const getOtherPersonInfo = (message, isConsecutive) => {
    if (!roomData) return { name: '상대방', image: null };
    
    if (message.sender_idx !== currentMemberIdx) {
      if (isConsecutive) {
        return { name: null, image: null };
      }
      
      if (roomData.trainer_idx === currentMemberIdx) {
        return {
          name: roomData.user_name || '회원',
          image: roomData.user_image
        };
      } else {
        return {
          name: roomData.trainer_name || '트레이너',
          image: roomData.trainer_image
        };
      }
    }
    
    return { name: null, image: null };
  };

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
        
        // 답장 대상 메시지 찾기
        const parentMessage = getParentMessage(message.parent_idx);
        
        return (
          <React.Fragment key={message.message_idx}>
            {/* 날짜 구분선 */}
            {shouldShowDateSeparator(message, previousMessage) && (
              <DateSeparator>
                <DateText>{formatDate(message.message_senddate)}</DateText>
              </DateSeparator>
            )}
            
            {/* 읽지 않은 메시지 구분선 */}
            {shouldShowUnreadSeparator(message) && (
              <UnreadSeparator>
                <UnreadText>여기서부터 안읽음</UnreadText>
              </UnreadSeparator>
            )}
            
            {/* 개별 메시지 컴포넌트 - 핸들러들 전달 */}
            <MessageItem
              message={message}
              isCurrentUser={message.sender_idx === currentMemberIdx}
              attachments={attachments[message.message_idx] || null}
              senderName={otherPersonInfo.name}
              senderImage={otherPersonInfo.image}
              showTime={isLastMessage}
              onImageLoad={handleImageLoad}
              onReply={onReply} // 답장 핸들러 전달
              onDelete={onDelete} // 삭제 핸들러 전달
              onReport={onReport} // 신고 핸들러 전달
              parentMessage={parentMessage} // 답장 대상 메시지 전달
            />
          </React.Fragment>
        );
      })}
    </Container>
  );
};

export default MessageList;