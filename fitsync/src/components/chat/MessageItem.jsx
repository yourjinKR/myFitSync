import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import ImageModal from './ImageModal';

// 메시지 컨테이너 - 내 메시지는 오른쪽, 상대방 메시지는 왼쪽 정렬
const MessageContainer = styled.div`
  display: flex;
  justify-content: ${props => props.$isCurrentUser ? 'flex-end' : 'flex-start'};
  margin-bottom: 12px;
  align-items: flex-end;
  /* 검색 결과 하이라이트를 위한 transition 추가 */
  transition: background-color 0.3s ease;
  padding: 4px 8px;
  border-radius: 8px;
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
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 0.9;
    transform: scale(1.02); /* 호버 시 살짝 확대 */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: scale(0.98); /* 클릭 시 살짝 축소 */
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

const ReadTime = styled.span`
  font-size: 0.8rem;
  color: var(--text-tertiary);
`;

// 개별 메시지 아이템 컴포넌트
const MessageItem = ({ message, isCurrentUser, attachments = null, senderName = null }) => {

  // 이미지 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 이미지 클릭 핸들러 - 새창 대신 모달 열기
  const handleImageClick = useCallback((e) => {
    e.preventDefault(); // 기본 동작 방지
    e.stopPropagation(); // 이벤트 버블링 방지
    
    console.log('🖼️ 이미지 클릭 - 모달 열기:', attachments?.original_filename);
    setIsModalOpen(true);
  }, [attachments]);

  // 모달 닫기 핸들러
  const handleModalClose = useCallback(() => {
    console.log('❌ 이미지 모달 닫기');
    setIsModalOpen(false);
  }, []);
  
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
      return {
        text: '읽음',
        time: null
      };
    } else {
      return {
        text: '읽지 않음',
        time: null
      };
    }
  };

  const readStatusInfo = getReadStatusInfo();

  return (
    <>
    <MessageContainer id={`message-${message.message_idx}`} $isCurrentUser={isCurrentUser}>
      <MessageGroup>
        {/* 상대방 메시지인 경우에만 이름 표시 */}
        {!isCurrentUser && senderName && (
          <SenderName>{senderName}</SenderName>
        )}
        
        {/* 메시지와 시간/읽음상태를 나란히 배치 */}
        <MessageWithInfo $isCurrentUser={isCurrentUser}>
          <MessageBubble $isCurrentUser={isCurrentUser}>
            {/* 이미지 메시지 처리 수정 (단일 첨부파일) */}
            {message.message_type === 'image' && attachments ? (
              <div>
                <MessageImage
                  src={attachments.cloudinary_url}
                  alt={attachments.original_filename}
                  onClick={handleImageClick} // 새창 대신 모달 열기
                  title="클릭하면 확대하여 볼 수 있습니다"
                  loading="lazy" // 이미지 지연 로딩
                />
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
          
          {/* 읽음 상태를 말풍선 옆에 표시 */}
          <MessageInfo $isCurrentUser={isCurrentUser}>
            <MessageTime>
              {formatTime(message.message_senddate)}
            </MessageTime>
            {/* 읽음 상태 (내가 보낸 메시지인 경우에만 표시) */}
            {readStatusInfo && (
              <ReadStatus>
                <ReadTime>{readStatusInfo.text}</ReadTime>
              </ReadStatus>
            )}
          </MessageInfo>
        </MessageWithInfo>
      </MessageGroup>
    </MessageContainer>
    {/* 이미지 모달 - attachments가 있을 때만 렌더링 */}
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