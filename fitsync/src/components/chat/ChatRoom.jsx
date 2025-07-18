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
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Redux에서 현재 사용자 정보 가져오기
  const { user } = useSelector(state => state.user);

  // 컴포넌트 상태 관리
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomData, setRoomData] = useState(null);
  const [attachments, setAttachments] = useState({});
  const [currentMemberIdx, setCurrentMemberIdx] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [initialUnreadMessages, setInitialUnreadMessages] = useState([]);
  
  // 완전히 새로운 접근: 즉시 스크롤 + 필요시에만 이미지 대기
  const [hasPerformedInitialScroll, setHasPerformedInitialScroll] = useState(false);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);

  // ref 관리
  const initialReadDone = useRef(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const scrollAdjustmentTimerRef = useRef(null);

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
        setCurrentMemberIdx(parseInt(memberIdx));
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
      if (!user || !user.isLogin) {
        navigate('/login');
        return;
      }

      // 상태 초기화
      setIsInitialLoad(true);
      setHasPerformedInitialScroll(false);
      setShouldScrollToBottom(false);
      setInitialUnreadMessages([]);
      
      console.log('🔄 채팅방 초기화');

      const memberIdx = await getMemberIdxForChat();
      if (!memberIdx) return;

      if (location.state?.roomData) {
        setRoomData(location.state.roomData);
      }

      await loadMessages(memberIdx);
    };

    initializeChatRoom();

    return () => {
      sessionStorage.removeItem('chat_member_idx');
      if (scrollAdjustmentTimerRef.current) {
        clearTimeout(scrollAdjustmentTimerRef.current);
      }
    };
  }, [roomId, user, navigate, location.state]);

  // 완전히 새로운 접근: 메시지 로드 후 즉시 스크롤, 이미지는 백그라운드에서 처리
  const loadMessages = async (memberIdx = null) => {
    try {
      setLoading(true);

      const messageList = await chatApi.readMessageList(parseInt(roomId));
      setMessages(messageList);

      // 읽지 않은 메시지 분석
      if (memberIdx) {
        const unreadMessages = messageList.filter(msg => 
          msg.sender_idx !== memberIdx && !msg.message_readdate
        );
        setInitialUnreadMessages(unreadMessages);

        if (unreadMessages.length === 0) {
          console.log('🔍 읽지 않은 메시지 없음 - 맨 아래 스크롤 예정');
          setShouldScrollToBottom(true);
        } else {
          console.log('🔍 읽지 않은 메시지', unreadMessages.length, '개 - 가장 오래된 읽지 않은 메시지로 스크롤 예정');
          setShouldScrollToBottom(false);
        }
      }

      // 첨부파일은 백그라운드에서 비동기 로드 (스크롤 차단하지 않음)
      const imageMessages = messageList.filter(msg => msg.message_type === 'image');
      if (imageMessages.length > 0) {
        console.log('📷 백그라운드에서 첨부파일 로드 시작...', imageMessages.length, '개');
        loadAttachmentsInBackground(imageMessages);
      }

    } catch (error) {
      console.error('메시지 로드 실패:', error);
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

  // 백그라운드에서 첨부파일 로드 (스크롤 차단하지 않음)
  const loadAttachmentsInBackground = async (imageMessages) => {
    const attachmentsMap = {};

    // 비동기로 첨부파일 로드 (await 사용하지 않음)
    imageMessages.forEach(async (message, index) => {
      if (message.attach_idx && message.attach_idx > 0) {
        try {
          const attachment = await chatApi.readFile(message.message_idx);
          
          // 실시간으로 첨부파일 추가
          setAttachments(prev => ({
            ...prev,
            [message.message_idx]: attachment
          }));
          
          console.log(`📷 백그라운드 첨부파일 로드 완료: ${index + 1}/${imageMessages.length} (message_idx: ${message.message_idx})`);
          
          // 각 이미지 로드 완료 시 스크롤 위치 미세 조정
          if (!isInitialLoad) {
            adjustScrollPosition();
          }
          
        } catch (error) {
          console.error(`첨부파일 로드 실패 (message_idx: ${message.message_idx}):`, error);
        }
      }
    });
  };

  // 메시지 로드 완료 후 즉시 스크롤 실행 (이미지 대기하지 않음)
  useEffect(() => {
    if (messages.length > 0 && isInitialLoad && currentMemberIdx && !hasPerformedInitialScroll) {
      console.log('📍 즉시 스크롤 실행 - 이미지 로딩 대기하지 않음');
      
      // DOM 렌더링 완료 대기만 최소한으로
      setTimeout(() => {
        performInitialScroll();
      }, 100);
    }
  }, [messages, currentMemberIdx, isInitialLoad, hasPerformedInitialScroll]);

  // 새로운 함수: 초기 스크롤 실행
  const performInitialScroll = () => {
    console.log('🎯 초기 스크롤 실행:', {
      shouldScrollToBottom,
      unreadCount: initialUnreadMessages.length
    });

    if (shouldScrollToBottom) {
      console.log('📍 맨 아래로 스크롤');
      scrollToBottom(false);
    } else if (initialUnreadMessages.length > 0) {
      const oldestUnreadMessage = initialUnreadMessages[0];
      console.log('📍 가장 오래된 읽지 않은 메시지로 스크롤:', oldestUnreadMessage.message_idx);
      scrollToMessage(oldestUnreadMessage.message_idx);
    } else {
      console.log('📍 읽지 않은 메시지 없음 - 맨 아래로 스크롤');
      scrollToBottom(false);
    }

    setHasPerformedInitialScroll(true);
    
    // 스크롤 완료 후 읽음 처리
    setTimeout(() => {
      setIsInitialLoad(false);
      performInitialReadMark();
    }, 300);
  };

  // 새로운 함수: 초기 읽음 처리
  const performInitialReadMark = () => {
    if (connected && currentMemberIdx && messages.length > 0 && !initialReadDone.current) {
      initialReadDone.current = true;
      console.log('📖 초기 읽음 처리 시작');

      messages.forEach(msg => {
        if (msg.receiver_idx === currentMemberIdx && !msg.message_readdate) {
          markAsRead(msg.message_idx, parseInt(roomId, 10));
        }
      });
      
      console.log('✅ 초기 읽음 처리 완료');
    }
  };

  // WebSocket 구독 설정
  useEffect(() => {
    if (connected && roomId && currentMemberIdx) {
      const unsubscribe = subscribeToRoom(
        parseInt(roomId),
        // 새 메시지 수신 콜백
        async (newMessage) => {
          setMessages(prev => {
            const existingMessage = prev.find(msg => msg.message_idx === newMessage.message_idx);
            if (existingMessage) return prev;
            return [...prev, newMessage];
          });

          // 새 메시지 수신 시 맨 아래로 스크롤 (조건 없이)
          console.log('📨 새 메시지 수신 - 맨 아래로 스크롤');
          setTimeout(() => {
            scrollToBottom(true);
          }, 100);

          // 이미지 메시지인 경우 첨부파일 정보도 로드
          if (newMessage.message_type === 'image' && newMessage.attach_idx && newMessage.attach_idx > 0) {
            setTimeout(async () => {
              try {
                const attachment = await chatApi.readFile(newMessage.message_idx);
                setAttachments(prev => ({
                  ...prev,
                  [newMessage.message_idx]: attachment
                }));
                
                // 🔧 첨부파일 로드 후 스크롤 재조정
                setTimeout(() => {
                  adjustScrollPosition();
                }, 100);
                
              } catch (error) {
                console.error(`실시간 메시지 ${newMessage.message_idx} 첨부파일 로드 실패:`, error);
              }
            }, 1000);
          }

          // 받은 메시지인 경우 자동으로 읽음 처리
          if (newMessage.receiver_idx === currentMemberIdx) {
            setTimeout(() => {
              markAsRead(newMessage.message_idx, parseInt(roomId));
            }, 100);
          }
        },
        // 읽음 확인 수신 콜백
        (readData) => {
          setMessages(prev => prev.map(msg => {
            if (msg.message_idx === readData.message_idx) {
              return { ...msg, message_readdate: new Date().toISOString() };
            }
            return msg;
          }));
        }
      );

      return unsubscribe;
    }
  }, [connected, roomId, subscribeToRoom, markAsRead, currentMemberIdx]);

  // 특정 메시지로 스크롤 함수 (재시도 로직 포함)
  const scrollToMessage = useCallback((messageIdx, retryCount = 0) => {
    const maxRetries = 5;
    const messageElement = document.getElementById(`message-${messageIdx}`);
    
    if (messageElement && messagesContainerRef.current) {
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
      return true;
    } else if (retryCount < maxRetries) {
      console.log(`⏳ 메시지 DOM 대기 중... 재시도 ${retryCount + 1}/${maxRetries}`);
      setTimeout(() => scrollToMessage(messageIdx, retryCount + 1), 100);
      return false;
    } else {
      console.warn('❌ 메시지 요소를 찾을 수 없음 - 맨 아래로 스크롤:', messageIdx);
      scrollToBottom(false);
      return false;
    }
  }, []);

  // 맨 아래로 스크롤 함수 (재시도 로직 포함)
  const scrollToBottom = useCallback((smooth = true, retryCount = 0) => {
    const maxRetries = 5;
    
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end'
      });
      console.log('✅ 맨 아래로 스크롤 완료');
      return true;
    } else if (retryCount < maxRetries) {
      console.log(`⏳ 스크롤 대상 DOM 대기 중... 재시도 ${retryCount + 1}/${maxRetries}`);
      setTimeout(() => scrollToBottom(smooth, retryCount + 1), 100);
      return false;
    } else {
      console.warn('❌ 스크롤 대상을 찾을 수 없음');
      return false;
    }
  }, []);

  // 스크롤 위치 미세 조정 (이미지 로드 완료 후)
  const adjustScrollPosition = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 150; // 150px 여유
      
      // 맨 아래 근처에 있으면 맨 아래로 조정
      if (isNearBottom) {
        console.log('🔧 스크롤 위치 미세 조정 - 맨 아래로');
        scrollToBottom(false);
      }
    }
  }, [scrollToBottom]);

  // 이미지 로딩 완료 핸들러 (스크롤 조정만)
  const handleImageLoad = useCallback((messageIdx) => {
    console.log('📷 이미지 로딩 완료:', messageIdx);
    
    // 로딩 완료 후 스크롤 위치 조정
    setTimeout(() => {
      adjustScrollPosition();
    }, 50);
  }, [adjustScrollPosition]);

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

  // 메시지 전송 핸들러 - 무조건 맨 아래로 스크롤
  const handleSendMessage = async (messageContent, messageType = 'text', file = null) => {
    if (!connected || !roomId || !currentMemberIdx) {
      console.warn('WebSocket 연결이 되어있지 않거나 채팅방 ID가 없습니다.');
      return;
    }

    const otherMemberIdx = roomData?.trainer_idx === currentMemberIdx
      ? roomData?.user_idx
      : roomData?.trainer_idx;

    const messageData = {
      room_idx: parseInt(roomId),
      receiver_idx: otherMemberIdx,
      message_content: messageContent,
      message_type: messageType
    };

    sendMessage(messageData);

    // 메시지 전송 즉시 맨 아래로 스크롤 (조건 없이)
    console.log('📤 메시지 전송 - 즉시 맨 아래로 스크롤');
    setTimeout(() => {
      scrollToBottom(true);
    }, 50);

    // 파일 업로드 처리
    if (file && messageType === 'image') {
      console.log('📷 이미지 파일 업로드 시작');
      
      setTimeout(async () => {
        try {
          const messageList = await chatApi.readMessageList(parseInt(roomId));
          const latestMessage = messageList[messageList.length - 1];

          if (latestMessage && latestMessage.sender_idx === currentMemberIdx) {
            const uploadResult = await chatApi.uploadFile(file, latestMessage.message_idx);
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
            
            // 파일 업로드 완료 후 스크롤 재조정
            console.log('📷 이미지 업로드 완료 - 스크롤 재조정');
            setTimeout(() => {
              scrollToBottom(false);
            }, 200);
          }
        } catch (error) {
          console.error('파일 업로드 실패:', error);
          alert('파일 업로드에 실패했습니다.');
        }
      }, 500);
    }
  };

  // 채팅방 표시 이름 생성
  const getRoomDisplayName = () => {
    if (roomData && currentMemberIdx) {
      if (roomData.trainer_idx === currentMemberIdx) {
        const userName = roomData.user_name || '회원';
        return `${userName}님과의 상담`;
      } else {
        const trainerName = roomData.trainer_name || '트레이너';
        return `${trainerName}님과의 상담`;
      }
    }

    if (roomData?.room_name) {
      const nameMatch = roomData.room_name.match(/^(.+)님과의 상담$/);
      if (nameMatch) {
        if (roomData.trainer_idx === currentMemberIdx) {
          return `회원님과의 상담`;
        } else {
          return roomData.room_name;
        }
      }
      return roomData.room_name;
    }

    if (location.state?.trainerInfo?.member_name) {
      const trainerName = location.state.trainerInfo.member_name;
      if (roomData?.trainer_idx === currentMemberIdx) {
        return `회원님과의 상담`;
      } else {
        return `${trainerName}님과의 상담`;
      }
    }

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
      <ChatRoomHeader 
        roomDisplayName={getRoomDisplayName()} 
        onSearchResults={handleSearchResults} 
        onScrollToSearchResult={handleScrollToSearchResult}
        messages={messages}
      />

      <MessagesContainer ref={messagesContainerRef}>
        <MessageList
          messages={messages}
          currentMemberIdx={currentMemberIdx}
          attachments={attachments}
          roomData={roomData}
          onImageLoad={handleImageLoad}
        />
        <div ref={messagesEndRef} />
      </MessagesContainer>

      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={!connected}
      />
    </Container>
  );
};

export default ChatRoom;