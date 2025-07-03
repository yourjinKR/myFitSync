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
const MessageList = ({ messages, currentUser, attachments }) => {
  
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

  return (
    <Container>
      {messages.map((message, index) => (
        <React.Fragment key={message.message_idx}>
          {/* 날짜 구분선 (필요한 경우에만 표시) */}
          {shouldShowDateSeparator(message, messages[index - 1]) && (
            <DateSeparator>
              <DateText>{formatDate(message.message_senddate)}</DateText>
            </DateSeparator>
          )}
          
          {/* 개별 메시지 컴포넌트 */}
          <MessageItem
            message={message}
            isCurrentUser={message.sender_idx === currentUser.member_idx}
            attachments={attachments[message.message_idx] || []}
          />
        </React.Fragment>
      ))}
    </Container>
  );
};

export default MessageList;