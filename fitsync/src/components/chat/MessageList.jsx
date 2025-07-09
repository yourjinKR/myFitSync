import React from 'react';
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
    background-color: rgba(255, 255, 255, 0.3);
  }
`;

const DateText = styled.span`
  background-color: rgba(255, 255, 255, 0.9);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 1.2rem;
  color: #666;
  position: relative;
  z-index: 1;
`;

// 메시지 목록 컴포넌트
const MessageList = ({ messages, currentUser, attachments, roomData }) => {
  
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

  // 발신자 이름 생성 (상대방 메시지에만 필요)
  const getSenderName = (message) => {
    // 내 메시지인 경우 이름 불필요
    if (message.sender_idx === currentUser.member_idx) {
      return null;
    }
    
    // 상대방 메시지인 경우
    // roomData에서 상대방 정보 확인
    if (roomData) {
      // 현재 사용자가 트레이너인지 일반 사용자인지 확인
      if (roomData.trainer_idx === currentUser.member_idx) {
        // 내가 트레이너면 상대방은 회원
        return '회원';
      } else {
        // 내가 일반 사용자면 상대방은 트레이너
        // roomData.room_name에서 트레이너 이름 추출
        if (roomData.room_name) {
          const nameMatch = roomData.room_name.match(/^(.+)님과의 상담$/);
          if (nameMatch) {
            return nameMatch[1]; // 트레이너 이름
          }
        }
        return '트레이너';
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
            
            {/* 개별 메시지 컴포넌트 */}
            <MessageItem
              message={message}
              isCurrentUser={message.sender_idx === currentUser.member_idx}
              attachments={attachments[message.message_idx] || []}
              senderName={isConsecutive ? null : senderName} // 연속 메시지가 아닐 때만 이름 표시
            />
          </React.Fragment>
        );
      })}
    </Container>
  );
};

export default MessageList;