import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import MessageItem from './MessageItem';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
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

// 메시지 목록 컴포넌트
const MessageList = ({ 
  messages, 
  currentMemberIdx, 
  attachments, 
  roomData,
  onImageLoad = null,
  onReply = null,
  onDelete = null,
  onReport = null,
  onScrollToMessage = null,
  hasCompletedMatchingWithTrainer = false,
  isMatchingCheckComplete = true,
  isMatchingCheckLoading = false
}) => {
  
  const [fixedOldestUnreadMessageIdx, setFixedOldestUnreadMessageIdx] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // 초기 읽지 않은 메시지 중 가장 오래된 메시지 ID 계산 - 읽지 않은 메시지 구분선 위치 결정에 사용
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
    
    return oldestUnreadMessage.message_idx;
  }, [messages.length, currentMemberIdx]);

  // 초기 로드 시에만 읽지 않은 메시지 구분선 위치 고정 - 실시간 메시지가 추가되어도 구분선 위치는 변경되지 않음
  useEffect(() => {
    if (!initialLoadComplete && messages.length > 0) {
      if (initialOldestUnreadMessageIdx && fixedOldestUnreadMessageIdx === null) {
        setFixedOldestUnreadMessageIdx(initialOldestUnreadMessageIdx);
      }
      setInitialLoadComplete(true);
    }
  }, [initialOldestUnreadMessageIdx, fixedOldestUnreadMessageIdx, messages.length, initialLoadComplete]);

  // 답장 대상 메시지 찾기 - parent_idx를 통해 원본 메시지 검색
  const getParentMessage = (parentIdx) => {
    if (!parentIdx) return null;
    return messages.find(msg => msg.message_idx === parentIdx);
  };

  // 답장 미리보기 텍스트 생성 - 이미지 메시지의 경우 파일명 또는 기본 텍스트 표시
  const getReplyPreviewText = (parentMsg, allAttachments) => {
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

  // 특정 메시지로 스크롤하는 함수 - 답장 클릭 시 원본 메시지로 이동
  const handleScrollToMessage = (messageIdx) => {
    if (onScrollToMessage) {
      onScrollToMessage(messageIdx);
    } else {
      // 직접 스크롤 처리 (fallback)
      const messageElement = document.getElementById(`message-${messageIdx}`);
      if (messageElement) {
        messageElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        
        // 하이라이트 효과
        messageElement.style.backgroundColor = 'rgba(74, 144, 226, 0.2)';
        setTimeout(() => {
          messageElement.style.backgroundColor = '';
        }, 2000);
      }
    }
  };

  // 날짜 포맷팅
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 날짜 구분선 표시 여부 결정 - 이전 메시지와 날짜가 다른 경우 구분선 표시
  const shouldShowDateSeparator = (currentMessage, previousMessage) => {
    if (!previousMessage) return true;
    
    const currentDate = new Date(currentMessage.message_senddate).toDateString();
    const previousDate = new Date(previousMessage.message_senddate).toDateString();
    
    return currentDate !== previousDate;
  };

  // 읽지 않은 메시지 구분선 표시 여부 결정 - 초기 로드 시에만 고정된 위치에 표시
  const shouldShowUnreadSeparator = (currentMessage) => {
    if (!initialLoadComplete || !fixedOldestUnreadMessageIdx) return false;
    return currentMessage.message_idx === fixedOldestUnreadMessageIdx;
  };

  // 연속 메시지 판단 로직 - 같은 발신자가 같은 분(minute) 내에 보낸 메시지를 연속으로 처리
  const isConsecutiveMessage = (currentMessage, previousMessage) => {
    if (!previousMessage) return false;
    
    const currentTime = new Date(currentMessage.message_senddate);
    const previousTime = new Date(previousMessage.message_senddate);
    
    // 같은 발신자인지 확인
    const isSameSender = currentMessage.sender_idx === previousMessage.sender_idx;
    
    // 같은 분(minute) 단위인지 확인
    const currentMinute = currentTime.getFullYear() * 100000000 + 
                         (currentTime.getMonth() + 1) * 1000000 + 
                         currentTime.getDate() * 10000 + 
                         currentTime.getHours() * 100 + 
                         currentTime.getMinutes();
    
    const previousMinute = previousTime.getFullYear() * 100000000 + 
                          (previousTime.getMonth() + 1) * 1000000 + 
                          previousTime.getDate() * 10000 + 
                          previousTime.getHours() * 100 + 
                          previousTime.getMinutes();
    
    return isSameSender && (currentMinute === previousMinute);
  };

  // 메시지 그룹의 마지막인지 판단 - 읽음 상태 표시 여부 결정에 사용
  const isLastInGroup = (currentMessage, nextMessage) => {
    if (!nextMessage) return true;
    
    const currentTime = new Date(currentMessage.message_senddate);
    const nextTime = new Date(nextMessage.message_senddate);
    
    // 다음 메시지가 다른 발신자인지 확인
    const isDifferentSender = currentMessage.sender_idx !== nextMessage.sender_idx;
    
    // 다음 메시지가 다른 분(minute) 단위인지 확인
    const currentMinute = currentTime.getFullYear() * 100000000 + 
                         (currentTime.getMonth() + 1) * 1000000 + 
                         currentTime.getDate() * 10000 + 
                         currentTime.getHours() * 100 + 
                         currentTime.getMinutes();
    
    const nextMinute = nextTime.getFullYear() * 100000000 + 
                      (nextTime.getMonth() + 1) * 1000000 + 
                      nextTime.getDate() * 10000 + 
                      nextTime.getHours() * 100 + 
                      nextTime.getMinutes();
    
    const isDifferentMinute = currentMinute !== nextMinute;
    
    return isDifferentSender || isDifferentMinute;
  };

  // 상대방 정보 가져오기 - 프로필 이미지, 이름, 성별 정보 제공
  const getOtherPersonInfo = (message, isConsecutive) => {
    if (!roomData) {
      return { name: '상대방', image: null, gender: null };
    }
    
    if (message.sender_idx !== currentMemberIdx) {
      // 연속 메시지에서는 성별 정보만 제공
      if (isConsecutive) {
        let consecutiveGender = null;
        
        if (roomData.trainer_idx === currentMemberIdx) {
          consecutiveGender = roomData.user_gender;
        } else {
          consecutiveGender = roomData.trainer_gender;
        }
        
        return { 
          name: null, 
          image: null, 
          gender: consecutiveGender
        };
      }
      
      // 일반 메시지에서는 전체 정보 제공
      if (roomData.trainer_idx === currentMemberIdx) {
        // 현재 사용자가 트레이너 -> 회원 정보 반환
        return {
          name: roomData.user_name || '회원',
          image: roomData.user_image,
          gender: roomData.user_gender || null
        };
      } else {
        // 현재 사용자가 회원 -> 트레이너 정보 반환
        return {
          name: roomData.trainer_name || '트레이너',
          image: roomData.trainer_image,
          gender: roomData.trainer_gender || null
        };
      }
    }
    
    // 내가 보낸 메시지인 경우
    return { name: null, image: null, gender: null };
  };

  // 이미지 로딩 완료 콜백
  const handleImageLoad = (messageIdx) => {
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
            
            {/* 메시지 아이템 */}
            <MessageItem
              message={message}
              isCurrentUser={message.sender_idx === currentMemberIdx}
              attachments={attachments[message.message_idx] || null}
              senderName={otherPersonInfo.name}
              senderImage={otherPersonInfo.image}
              senderGender={otherPersonInfo.gender}
              showTime={isLastMessage}
              isConsecutive={isConsecutive}
              onImageLoad={handleImageLoad}
              onReply={onReply}
              onDelete={onDelete}
              onReport={onReport}
              parentMessage={parentMessage}
              allAttachments={attachments}
              getReplyPreviewText={getReplyPreviewText}
              onScrollToMessage={handleScrollToMessage}
              roomData={roomData}
              hasCompletedMatchingWithTrainer={hasCompletedMatchingWithTrainer}
              isMatchingCheckComplete={isMatchingCheckComplete}
              isMatchingCheckLoading={isMatchingCheckLoading}
            />
          </React.Fragment>
        );
      })}
    </Container>
  );
};

export default MessageList;