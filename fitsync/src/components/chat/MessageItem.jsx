import React from 'react';
import styled from 'styled-components';

// 메시지 컨테이너 - 내 메시지는 오른쪽, 상대방 메시지는 왼쪽 정렬
const MessageContainer = styled.div`
  display: flex;
  justify-content: ${props => props.$isCurrentUser ? 'flex-end' : 'flex-start'};
  margin-bottom: 12px;
  align-items: flex-end;
`;

// 사용자 이름 표시 (상대방 메시지에만)
const SenderName = styled.div`
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 4px;
  margin-left: 4px;
`;

// 메시지 그룹 (이름 + 말풍선)
const MessageGroup = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 70%;
`;

// 메시지 말풍선 - 내 메시지는 노란색, 상대방은 흰색
const MessageBubble = styled.div`
  padding: 10px 14px;
  border-radius: 18px;
  background-color: ${props => props.$isCurrentUser ? '#FFE66D' : '#ffffff'};
  color: ${props => props.$isCurrentUser ? '#333333' : '#333333'};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  position: relative;
  word-wrap: break-word;
  
  /* 말풍선 꼬리 효과 추가 */
  &::before {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    ${props => props.$isCurrentUser ? `
      right: -8px;
      border-left: 8px solid #FFE66D;
      border-top: 8px solid transparent;
      border-bottom: 8px solid transparent;
    ` : `
      left: -8px;
      border-right: 8px solid #ffffff;
      border-top: 8px solid transparent;
      border-bottom: 8px solid transparent;
    `}
    bottom: 8px;
  }
`;

const MessageText = styled.div`
  line-height: 1.4;
  white-space: pre-wrap; /* 줄바꿈 보존 */
  font-size: 1.4rem;
  color: #333333;
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

// 메시지 하단 정보 (시간, 읽음 상태) - 내 메시지는 왼쪽에, 상대방은 오른쪽에
const MessageInfo = styled.div`
  display: flex;
  align-items: center;
  margin-top: 4px;
  font-size: 1.1rem;
  opacity: 0.7;
  gap: 4px;
  ${props => props.$isCurrentUser ? 'justify-content: flex-start;' : 'justify-content: flex-end;'}
`;

const MessageTime = styled.span`
  color: #666666;
  font-size: 1rem;
`;

const ReadStatus = styled.span`
  color: #666666;
  font-size: 1rem;
`;

// 시간과 읽음 상태를 메시지 옆에 표시하는 컨테이너
const MessageWithInfo = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  ${props => props.$isCurrentUser ? 'flex-direction: row-reverse;' : 'flex-direction: row;'}
`;

// 개별 메시지 아이템 컴포넌트
const MessageItem = ({ message, isCurrentUser, attachments = [], senderName = null }) => {
  
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
      <MessageGroup>
        {/* 상대방 메시지인 경우에만 이름 표시 */}
        {!isCurrentUser && senderName && (
          <SenderName>{senderName}</SenderName>
        )}
        
        {/* 메시지와 시간/읽음상태를 나란히 배치 */}
        <MessageWithInfo $isCurrentUser={isCurrentUser}>
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
          </MessageBubble>
          
          {/* 시간과 읽음 상태를 말풍선 옆에 표시 */}
          <MessageInfo $isCurrentUser={isCurrentUser}>
            <MessageTime>
              {formatTime(message.message_senddate)}
            </MessageTime>
            {/* 읽음 상태 (내가 보낸 메시지인 경우에만 표시) */}
            {getReadStatus() && (
              <ReadStatus>
                {getReadStatus()}
              </ReadStatus>
            )}
          </MessageInfo>
        </MessageWithInfo>
      </MessageGroup>
    </MessageContainer>
  );
};

export default MessageItem;