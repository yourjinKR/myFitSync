import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useWebSocket } from '../../hooks/UseWebSocket';
import chatApi from '../../utils/ChatApi';
import axios from 'axios';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import IsLoading3 from '../../components/IsLoading3';
import ChatRoomHeader from './ChatRoomHeader';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--bg-primary);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 2rem;
  cursor: pointer;
  margin-right: 15px;
  padding: 5px;
  border-radius: 4px;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(255,255,255,0.1);
  }
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: 600;
  font-size: 1.8rem;
`;

const UserStatus = styled.div`
  font-size: 1.2rem;
  opacity: 0.8;
  margin-top: 2px;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: var(--bg-primary);
  
  /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border-medium);
    border-radius: 3px;
  }
`;

// 개별 채팅방 화면 컴포넌트
const ChatRoom = () => {
  // React Router hooks
  const { roomId } = useParams(); // URL에서 채팅방 ID 추출
  const location = useLocation(); // 이전 페이지에서 전달된 state 정보
  const navigate = useNavigate();

  // Redux에서 현재 사용자 정보 가져오기
  const { user } = useSelector(state => state.user);

  // 컴포넌트 상태 관리
  const [messages, setMessages] = useState([]); // 메시지 목록
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [roomData, setRoomData] = useState(null); // 채팅방 정보
  const [attachments, setAttachments] = useState({}); // 첨부파일 정보 (message_idx를 key로 하는 객체)
  const [currentMemberIdx, setCurrentMemberIdx] = useState(null); // 현재 사용자의 member_idx
  const [hasScrolledToUnread, setHasScrolledToUnread] = useState(false); // 읽지 않은 메시지로 스크롤 완료 여부
  const [isInitialLoad, setIsInitialLoad] = useState(true); // 첫 로드 여부
  const [searchResults, setSearchResults] = useState([]); // 검색 결과

  // 미확인 메시지 초기 읽음 처리 플래그
  const initialReadDone = useRef(false);
  // 자동 스크롤을 위한 ref
  const messagesEndRef = useRef(null);
  // 메시지 컨테이너 참조
  const messagesContainerRef = useRef(null);

  // WebSocket 연결 및 기능들
  const { connected, subscribeToRoom, sendMessage, markAsRead } = useWebSocket();

  // 채팅용 member_idx 조회 및 세션스토리지 저장
  const getMemberIdxForChat = async () => {
    try {

      const response = await axios.get('/api/chat/member-info', {
        withCredentials: true
      });

      if (response.data.success) {
        const memberIdx = response.data.member_idx.toString();
        sessionStorage.setItem('chat_member_idx', memberIdx);
        setCurrentMemberIdx(parseInt(memberIdx)); // 상태에도 저장
        return parseInt(memberIdx);
      } else {
        if (response.data.message.includes('로그인')) {
          navigate('/login');
        }
        return null;
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      }
      return null;
    }
  };

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    const initializeChatRoom = async () => {
      // 로그인 확인 (Redux 사용)
      if (!user || !user.isLogin) {
        navigate('/login');
        return;
      }

      // 채팅용 member_idx 조회 및 세션스토리지 저장
      const memberIdx = await getMemberIdxForChat();
      if (!memberIdx) {
        return; // 실패 시 이미 navigate 처리됨
      }

      // 이전 페이지에서 전달된 채팅방 데이터 설정
      if (location.state?.roomData) {
        setRoomData(location.state.roomData);
      }

      // 메시지 목록 로드
      await loadMessages();
    };

    initializeChatRoom();

    // 채팅방 퇴장 시 세션스토리지 정리
    return () => {
      sessionStorage.removeItem('chat_member_idx');
    };
  }, [roomId, user, navigate, location.state]);

  // 메시지 목록 로드
  const loadMessages = async () => {
    try {
      setLoading(true);

      // 백엔드 API 호출 (readMessageList 메서드와 정확히 일치)
      const messageList = await chatApi.readMessageList(parseInt(roomId));
      setMessages(messageList);

      // 각 이미지 메시지의 첨부파일 정보 로드
      const attachmentsMap = {};
      for (const message of messageList) {
        if (message.message_type === 'image' && message.attach_idx && message.attach_idx > 0) {
          try {
            // 단일 첨부파일 객체 조회
            const attachment = await chatApi.readFile(message.message_idx);
            attachmentsMap[message.message_idx] = attachment;
          } catch (error) {
            console.error(`메시지 ${message.message_idx} 첨부파일 로드 실패:`, error);
          }
        }
      }
      setAttachments(attachmentsMap);

    } catch (error) {
      console.error('메시지 로드 실패:', error);

      // 에러 처리
      if (error.response?.status === 404) {
        alert('존재하지 않는 채팅방입니다.');
        navigate('/chat');
      } else if (error.response?.status === 403) {
        alert('접근 권한이 없습니다.');
        navigate('/chat');
      }
    } finally {
      setLoading(false);
    }
  };

  // WebSocket 구독 설정(실시간 새메시지 읽음확인)
  useEffect(() => {
    if (connected && roomId && currentMemberIdx) {

      const unsubscribe = subscribeToRoom(
        parseInt(roomId),

        // 새 메시지 수신 콜백
        async (newMessage) => {

          // 중복 메시지 방지
          setMessages(prev => {
            // 동일한 message_idx가 이미 존재하는지 확인
            const existingMessage = prev.find(msg => msg.message_idx === newMessage.message_idx);
            if (existingMessage) {
              return prev; // 중복이면 기존 상태 유지
            }
            return [...prev, newMessage]; // 새 메시지만 추가
          });

          // 이미지 메시지인 경우 첨부파일 정보도 로드
          if (newMessage.message_type === 'image' && newMessage.attach_idx && newMessage.attach_idx > 0) {
            try {
              // 약간의 딜레이 후 첨부파일 정보 로드 (서버에서 파일 처리 완료 대기)
              setTimeout(async () => {
                try {
                  const attachment = await chatApi.readFile(newMessage.message_idx);
                  setAttachments(prev => ({
                    ...prev,
                    [newMessage.message_idx]: attachment
                  }));
                } catch (error) {
                  console.error(`실시간 메시지 ${newMessage.message_idx} 첨부파일 로드 실패:`, error);
                }
              }, 1000); // 1초 대기
            } catch (error) {
              console.error('실시간 이미지 메시지 첨부파일 로드 실패:', error);
            }
          }

          // 받은 메시지인 경우 자동으로 읽음 처리
          if (newMessage.receiver_idx === currentMemberIdx) {
            // 약간의 지연 후 읽음 처리 (메시지가 화면에 렌더링된 후)
            setTimeout(() => {
              markAsRead(newMessage.message_idx, parseInt(roomId));
            }, 100);
          }
        },

        // 읽음 확인 수신 콜백
        (readData) => {
          // 해당 메시지의 읽음 상태 업데이트
          setMessages(prev => {
            const updatedMessages = prev.map(msg => {
              if (msg.message_idx === readData.message_idx) {
                return {
                  ...msg,
                  message_readdate: new Date().toISOString() // 현재 시간으로 설정
                };
              }
              return msg;
            });

            return updatedMessages;
          });
        }
      );

      // 컴포넌트 언마운트 시 구독 해제
      return unsubscribe;
    }
  }, [connected, roomId, subscribeToRoom, markAsRead, currentMemberIdx]);

  // 방 입장 직후, 과거(unread) 메시지 전부 읽음 처리
  useEffect(() => {
    if (
      connected &&
      currentMemberIdx &&
      messages.length > 0 &&
      !initialReadDone.current
    ) {
      initialReadDone.current = true;

      messages.forEach(msg => {
        // 나에게 온(unread) 메시지인 경우에만
        if (msg.receiver_idx === currentMemberIdx && !msg.message_readdate) {
          markAsRead(msg.message_idx, parseInt(roomId, 10));
        }
      });
    }
  }, [connected, currentMemberIdx, messages, roomId, markAsRead]);

  // 메시지 로드 후 스마트 스크롤 위치 설정
  useEffect(() => {
    if (messages.length > 0 && isInitialLoad && currentMemberIdx && !hasScrolledToUnread) {
      // 1. 첫 번째 읽지 않은 메시지 찾기
      const firstUnreadMessage = messages.find(msg => 
        msg.sender_idx !== currentMemberIdx && !msg.message_readdate
      );

      if (firstUnreadMessage) {
        // 2. 읽지 않은 메시지가 있으면 해당 메시지로 스크롤
        console.log('📍 첫 번째 읽지 않은 메시지로 스크롤:', firstUnreadMessage.message_idx);
        scrollToMessage(firstUnreadMessage.message_idx);
      } else {
        // 3. 읽지 않은 메시지가 없으면 가장 최신 메시지로 스크롤
        console.log('📍 읽지 않은 메시지 없음 - 최신 메시지로 스크롤');
        scrollToBottom(false); // 애니메이션 없이 즉시 이동
      }
      
      setHasScrolledToUnread(true);
      setIsInitialLoad(false);
    }
  }, [messages, currentMemberIdx, isInitialLoad, hasScrolledToUnread]);

  // 새 메시지 추가 시 자동 스크롤
  useEffect(() => {
    if (!isInitialLoad && messages.length > 0) {
      // 사용자가 스크롤을 맨 아래에 두고 있을 때만 자동 스크롤
      if (isScrollAtBottom()) {
        scrollToBottom(true); // 애니메이션과 함께 이동
      }
    }
  }, [messages.length, isInitialLoad]);

  // 특정 메시지로 스크롤하는 함수
  const scrollToMessage = useCallback((messageIdx) => {
    const messageElement = document.getElementById(`message-${messageIdx}`);
    if (messageElement && messagesContainerRef.current) {
      // 해당 메시지가 컨테이너 중앙에 오도록 스크롤
      const containerRect = messagesContainerRef.current.getBoundingClientRect();
      const messageRect = messageElement.getBoundingClientRect();
      
      const scrollTop = messagesContainerRef.current.scrollTop + 
                       messageRect.top - containerRect.top - 
                       containerRect.height / 2 + messageRect.height / 2;
      
      messagesContainerRef.current.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });

      // 메시지 하이라이트 효과
      messageElement.style.backgroundColor = 'rgba(74, 144, 226, 0.2)';
      setTimeout(() => {
        messageElement.style.backgroundColor = '';
      }, 2000);
      
      console.log('✅ 메시지로 스크롤 완료:', messageIdx);
    }
  }, []);

  // 맨 아래로 스크롤하는 함수
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end'
      });
      console.log('✅ 맨 아래로 스크롤 완료');
    }
  }, []);

  // 현재 스크롤이 맨 아래에 있는지 확인하는 함수
  const isScrollAtBottom = useCallback(() => {
    if (!messagesContainerRef.current) return false;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const threshold = 100; // 100px 이내면 맨 아래로 간주
    
    return scrollTop + clientHeight >= scrollHeight - threshold;
  }, []);

  // 검색 결과 처리 함수
  const handleSearchResults = useCallback((results) => {
    setSearchResults(results);
    console.log('🔍 검색 결과 업데이트:', results.length, '개');
  }, []);

  // 검색 결과에서 특정 메시지로 이동
  const handleScrollToSearchResult = useCallback((messageIdx) => {
    console.log('🔍 검색 결과로 스크롤 이동:', messageIdx);
    scrollToMessage(messageIdx);
  }, [scrollToMessage]);

  // 메시지 전송 핸들러
  const handleSendMessage = async (messageContent, messageType = 'text', file = null) => {
    if (!connected || !roomId || !currentMemberIdx) {
      console.warn('WebSocket 연결이 되어있지 않거나 채팅방 ID가 없습니다.');
      return;
    }

    // 상대방 인덱스 계산
    const otherMemberIdx = roomData?.trainer_idx === currentMemberIdx
      ? roomData?.user_idx      // 내가 트레이너면 → 상대방은 회원
      : roomData?.trainer_idx;  // 내가 회원이면 → 상대방은 트레이너

    // 메시지 데이터 구성
    const messageData = {
      room_idx: parseInt(roomId),
      // sender_idx: currentMemberIdx, - useWebSocket에서 자동으로 추가
      receiver_idx: otherMemberIdx,
      message_content: messageContent,
      message_type: messageType
    };

    // WebSocket으로 메시지 전송 (실시간 전송)
    sendMessage(messageData);

    // 파일 업로드 처리 (이미지인 경우)
    if (file && messageType === 'image') {

      // 메시지가 서버에 저장될 때까지 잠시 대기 후 파일 업로드
      setTimeout(async () => {
        try {
          // 최신 메시지 목록에서 방금 전송한 메시지 찾기
          const messageList = await chatApi.readMessageList(parseInt(roomId));
          const latestMessage = messageList[messageList.length - 1];

          if (latestMessage && latestMessage.sender_idx === currentMemberIdx) {
            // 파일 업로드 및 메시지 연결
            const uploadResult = await chatApi.uploadFile(file, latestMessage.message_idx);

            // 첨부파일 상태 업데이트 (단일 객체)
            setAttachments(prev => ({
              ...prev,
              [latestMessage.message_idx]: {
                attach_idx: uploadResult.attachIdx,
                original_filename: uploadResult.originalFilename,
                cloudinary_url: uploadResult.cloudinaryUrl,
                file_size_bytes: uploadResult.fileSize,
                mime_type: uploadResult.mimeType
              }
            }));
          }
        } catch (error) {
          console.error('파일 업로드 실패:', error);
          alert('파일 업로드에 실패했습니다.');
        }
      }, 500); // 500ms 대기
    }
  };

  // 채팅방 표시 이름 생성
  const getRoomDisplayName = () => {
    // 백엔드에서 가져온 실제 이름 사용 (roomData에 상대방 이름이 포함되어 있음)
    if (roomData && currentMemberIdx) {
      if (roomData.trainer_idx === currentMemberIdx) {
        // 내가 트레이너인 경우 → 회원 이름 표시
        const userName = roomData.user_name || '회원';
        return `${userName}님과의 상담`;
      } else {
        // 내가 일반 사용자인 경우 → 트레이너 이름 표시
        const trainerName = roomData.trainer_name || '트레이너';
        return `${trainerName}님과의 상담`;
      }
    }

    // 2순위: 기존 room_name 파싱
    if (roomData?.room_name) {
      const nameMatch = roomData.room_name.match(/^(.+)님과의 상담$/);
      if (nameMatch) {
        if (roomData.trainer_idx === currentMemberIdx) {
          return `회원님과의 상담`; // 트레이너인 경우 임시 표시
        } else {
          return roomData.room_name; // 기존 이름 유지
        }
      }
      return roomData.room_name;
    }

    // 3순위: 트레이너 정보에서 이름
    if (location.state?.trainerInfo?.member_name) {
      const trainerName = location.state.trainerInfo.member_name;

      if (roomData?.trainer_idx === currentMemberIdx) {
        return `회원님과의 상담`;
      } else {
        return `${trainerName}님과의 상담`;
      }
    }

    // 4순위: 기본 표시명
    if (roomData?.trainer_idx === currentMemberIdx) {
      return `회원님과의 상담`;
    } else {
      return `트레이너님과의 상담`;
    }
  };

  // 뒤로 가기 버튼 핸들러
  const handleBackClick = () => {
    navigate('/chat');
  };

  // 로딩 중 화면
  if (loading) {
    return (
      <Container>
        <Header>
          <BackButton onClick={handleBackClick}>
            ←
          </BackButton>

          <UserInfo>
            <UserName>채팅방</UserName>
          </UserInfo>
        </Header>
        <IsLoading3 />
      </Container>
    );
  }

  return (
    <Container>
      {/* 채팅방 헤더 */}
      <ChatRoomHeader 
        roomDisplayName={getRoomDisplayName()} 
        onSearchResults={handleSearchResults} 
        onScrollToSearchResult={handleScrollToSearchResult}
        messages={messages}
      />

      {/* 메시지 목록 */}
      <MessagesContainer ref={messagesContainerRef}>
        <MessageList
          messages={messages}
          currentMemberIdx={currentMemberIdx} // currentUser 대신 currentMemberIdx 전달
          attachments={attachments}
          roomData={roomData} // roomData 전달 추가
        />
        {/* 자동 스크롤을 위한 더미 요소 */}
        <div ref={messagesEndRef} />
      </MessagesContainer>

      {/* 메시지 입력창 */}
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={!connected}
      />
    </Container>
  );
};

export default ChatRoom;