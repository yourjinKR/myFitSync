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
  color: var(--text-secondary);
  margin-bottom: 4px;
  margin-left: 4px;
`;

// 메시지 그룹 (이름 + 말풍선)
const MessageGroup = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 70%;
`;

// 메시지 말풍선 - 내 메시지는 메인 블루, 상대방은 흰색
const MessageBubble = styled.div`
  padding: 10px 14px;
  border-radius: 18px;
  background-color: ${props => props.$isCurrentUser ? 'var(--primary-blue)' : 'var(--text-primary)'};
  color: ${props => props.$isCurrentUser ? 'var(--text-primary)' : 'var(--bg-primary)'};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  position: relative;
  word-wrap: break-word;
  
  /* 말풍선 꼬리 제거 - 깔끔한 디자인을 위해 */
`;

const MessageText = styled.div`
  line-height: 1.4;
  white-space: pre-wrap; /* 줄바꿈 보존 */
  font-size: 1.4rem;
  color: inherit; /* 부모 색상 상속 */
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

// 시간과 읽음 상태를 메시지 옆에 표시하는 컨테이너
const MessageWithInfo = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  ${props => props.$isCurrentUser ? 'flex-direction: row-reverse;' : 'flex-direction: row;'}
`;

// 메시지 하단 정보 (시간, 읽음 상태)
const MessageInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.$isCurrentUser ? 'flex-end' : 'flex-start'};
  font-size: 1.1rem;
  opacity: 0.7;
  gap: 2px;
  white-space: nowrap; /* 시간이 줄바꿈되지 않도록 */
  min-width: fit-content; /* 최소 너비 보장 */
  flex-shrink: 0; /* 축소되지 않도록 */
`;

const MessageTime = styled.span`
  color: var(--text-secondary);
  font-size: 1rem;
`;

// 읽음 상태를 시간 아래에 표시
const ReadStatus = styled.div`
  color: var(--text-secondary);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 4px;
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

  // 읽음 상태 정보 생성
  const getReadStatusInfo = () => {
    // 상대방 메시지인 경우 읽음 상태 표시하지 않음
    if (!isCurrentUser) return null;
    
    // 읽음 시간이 있으면 읽은시간 + "읽음", 없으면 "읽지 않음" 표시
    if (message.message_readdate) {
      // 다양한 형태의 날짜 처리
      let readDate;
      if (typeof message.message_readdate === 'string') {
        readDate = new Date(message.message_readdate);
      } else if (message.message_readdate instanceof Date) {
        readDate = message.message_readdate;
      } else {
        // 타임스탬프 숫자인 경우
        readDate = new Date(message.message_readdate);
      }
      
      // 유효한 날짜인지 확인
      if (isNaN(readDate.getTime())) {
        return {
          text: '읽음',
          time: null
        };
      }
      
      return {
        text: '읽음',
        time: formatTime(readDate)
      };
    } else {
      return {
        text: '읽지 않음',
        time: null
      };
    }
  };

  // 이미지 클릭 핸들러
  const handleImageClick = (imageUrl) => {
    window.open(imageUrl, '_blank');
  };

  const readStatusInfo = getReadStatusInfo();

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
            {readStatusInfo && (
              <ReadStatus>
                {readStatusInfo.time && <span>{readStatusInfo.time}</span>}
                <span>{readStatusInfo.text}</span>
              </ReadStatus>
            )}
          </MessageInfo>
        </MessageWithInfo>
      </MessageGroup>
    </MessageContainer>
  );
};

export default MessageItem;