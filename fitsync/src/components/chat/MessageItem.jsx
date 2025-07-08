import React from 'react';
import styled from 'styled-components';

// 메시지 컨테이너 - 내 메시지는 오른쪽, 상대방 메시지는 왼쪽 정렬
const MessageContainer = styled.div`
  display: flex;
  justify-content: ${props => props.$isCurrentUser ? 'flex-end' : 'flex-start'};
  margin-bottom: 8px;
`;

// 메시지 말풍선
const MessageBubble = styled.div`
  max-width: 60%;
  padding: 10px 14px;
  border-radius: 18px;
  background-color: ${props => props.$isCurrentUser ? '#7D93FF' : '#ffffff'};
  color: ${props => props.$isCurrentUser ? '#ffffff' : '#333333'};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  position: relative;
  word-wrap: break-word;
`;

const MessageText = styled.div`
  line-height: 1.4;
  white-space: pre-wrap; /* 줄바꿈 보존 */
  font-size: 1.4rem;
  color: inherit;
`;

// 메시지 내 이미지 스타일
const MessageImage = styled.img`
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  object-fit: cover;
  cursor: pointer;
  display: block;
  margin-bottom: 4px;
  
  &:hover {
    opacity: 0.9;
  }
`;

// 메시지 하단 정보 (시간, 읽음 상태)
const MessageInfo = styled.div`
  display: flex;
  align-items: center;
  margin-top: 4px;
  font-size: 1.1rem;
  opacity: 0.7;
  gap: 4px;
`;

const MessageTime = styled.span`
  color: ${props => props.$isCurrentUser ? '#ffffff' : '#666666'};
`;

const ReadStatus = styled.span`
  color: ${props => props.$isCurrentUser ? '#ffffff' : '#666666'};
  font-size: 1rem;
`;

// 개별 메시지 아이템 컴포넌트
const MessageItem = ({ message, isCurrentUser, attachments = [] }) => {
  
  // 시간을 HH:MM 형식으로 포맷
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 읽음 상태 텍스트 생성
  const getReadStatus = () => {
    // 상대방 메시지인 경우 읽음 상태 표시하지 않음
    if (!isCurrentUser) return null;
    
    // 읽음 시간이 있으면 "읽음", 없으면 "1" 표시
    if (message.message_readdate) {
      return '읽음';
    } else {
      return '1';
    }
  };

  // 이미지 클릭 핸들러
  const handleImageClick = (imageUrl) => {
    window.open(imageUrl, '_blank');
  };

  return (
    <MessageContainer $isCurrentUser={isCurrentUser}>
      <MessageBubble $isCurrentUser={isCurrentUser}>
        {/* 이미지 메시지 처리 */}
        {message.message_type === 'image' && attachments.length > 0 ? (
          <div>
            {/* 모든 첨부 이미지 표시 */}
            {attachments.map((attachment) => (
              <MessageImage
                key={attachment.attach_idx}
                src={attachment.cloudinary_url}
                alt={attachment.original_filename}
                onClick={() => handleImageClick(attachment.cloudinary_url)}
                title="클릭하면 원본 이미지를 볼 수 있습니다"
              />
            ))}
            {/* 이미지와 함께 텍스트가 있는 경우 표시 */}
            {message.message_content && message.message_content !== '[이미지]' && (
              <MessageText>{message.message_content}</MessageText>
            )}
          </div>
        ) : (
          /* 일반 텍스트 메시지 */
          <MessageText>{message.message_content}</MessageText>
        )}
        
        {/* 메시지 하단 정보 (시간, 읽음 상태) */}
        <MessageInfo>
          <MessageTime $isCurrentUser={isCurrentUser}>
            {formatTime(message.message_senddate)}
          </MessageTime>
          {/* 읽음 상태 (내가 보낸 메시지인 경우에만 표시) */}
          {getReadStatus() && (
            <ReadStatus $isCurrentUser={isCurrentUser}>
              {getReadStatus()}
            </ReadStatus>
          )}
        </MessageInfo>
      </MessageBubble>
    </MessageContainer>
  );
};

export default MessageItem;