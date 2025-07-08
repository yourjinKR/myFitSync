import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useWebSocket } from '../../hooks/UseWebSocket';
import chatApi from '../../utils/ChatApi';
import axios from 'axios';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #b2c7da; /* 배경색 */
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background-color: #7D93FF;
  color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: white;
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
  background-color: #b2c7da;
  
  /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255,255,255,0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.3);
    border-radius: 3px;
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #666;
  font-size: 1.4rem;
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
  
  // 자동 스크롤을 위한 ref
  const messagesEndRef = useRef(null);

  // WebSocket 연결 및 기능들
  const { connected, subscribeToRoom, sendMessage, markAsRead } = useWebSocket();

  // 채팅용 member_idx 조회 및 세션스토리지 저장
  const getMemberIdxForChat = async () => {
    try {
      console.log('🔍 채팅용 member_idx 조회 중...');
      
      const response = await axios.get('/api/chat/member-info', { 
        withCredentials: true 
      });
      
      if (response.data.success) {
        const memberIdx = response.data.member_idx.toString();
        sessionStorage.setItem('chat_member_idx', memberIdx);
        console.log('✅ member_idx 세션스토리지 저장 성공:', memberIdx);
        return parseInt(memberIdx);
      } else {
        console.error('❌ member_idx 조회 실패:', response.data.message);
        if (response.data.message.includes('로그인')) {
          navigate('/login');
        }
        return null;
      }
    } catch (error) {
      console.error('❌ member_idx 조회 중 오류:', error);
      if (error.response?.status === 401) {
        console.error('🚨 인증 실패 - 로그인 페이지로 이동');
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
        console.log('채팅방 데이터 설정:', location.state.roomData);
      }

      // 메시지 목록 로드
      await loadMessages();
    };

    initializeChatRoom();

    // 채팅방 퇴장 시 세션스토리지 정리
    return () => {
      sessionStorage.removeItem('chat_member_idx');
      console.log('🗑️ 채팅방 퇴장 - member_idx 세션스토리지 삭제');
    };
  }, [roomId, user, navigate, location.state]);

  // 메시지 목록 로드
  const loadMessages = async () => {
    try {
      setLoading(true);
      console.log('메시지 목록 로드 시작:', roomId);
      
      // 백엔드 API 호출 (readMessageList 메서드와 정확히 일치)
      const messageList = await chatApi.readMessageList(parseInt(roomId));
      setMessages(messageList);
      console.log('메시지 목록 로드 성공:', messageList);
      
      // 각 이미지 메시지의 첨부파일 정보 로드
      const attachmentsMap = {};
      for (const message of messageList) {
        if (message.message_type === 'image') {
          try {
            // 백엔드 API 호출 (readFile 메서드와 정확히 일치)
            const attachList = await chatApi.readFile(message.message_idx);
            attachmentsMap[message.message_idx] = attachList;
            console.log(`메시지 ${message.message_idx} 첨부파일:`, attachList);
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
    if (connected && roomId) {
      console.log('WebSocket 채팅방 구독 시작:', roomId);
      
      const unsubscribe = subscribeToRoom(
        parseInt(roomId),
        
        // 새 메시지 수신 콜백
        (newMessage) => {
          console.log('새 메시지 수신:', newMessage);
          
          // 중복 메시지 방지
          setMessages(prev => {
            // 동일한 message_idx가 이미 존재하는지 확인
            const existingMessage = prev.find(msg => msg.message_idx === newMessage.message_idx);
            if (existingMessage) {
              console.log('🔄 중복 메시지 무시:', newMessage.message_idx);
              return prev; // 중복이면 기존 상태 유지
            }
            return [...prev, newMessage]; // 새 메시지만 추가
          });

          // 세션스토리지에서 member_idx 가져와서 비교
          const sessionMemberIdx = sessionStorage.getItem('chat_member_idx');
          const currentMemberIdx = sessionMemberIdx ? parseInt(sessionMemberIdx) : null;
          
          // 받은 메시지인 경우 자동으로 읽음 처리
          if (newMessage.receiver_idx === currentMemberIdx) {
            console.log('받은 메시지 자동 읽음 처리');
            markAsRead(newMessage.message_idx, parseInt(roomId));
          }
        },
        
        // 읽음 확인 수신 콜백
        (readData) => {
          console.log('읽음 확인 수신:', readData);
          
          // 해당 메시지의 읽음 상태 업데이트
          setMessages(prev => 
            prev.map(msg => 
              msg.message_idx === readData.message_idx 
                ? { ...msg, message_readdate: new Date() }
                : msg
            )
          );
        }
      );

      // 컴포넌트 언마운트 시 구독 해제
      return unsubscribe;
    }
  }, [connected, roomId, subscribeToRoom, markAsRead]);

  // 새 메시지 추가 시 자동 스크롤
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [messages]);

  // 메시지 전송 핸들러
  const handleSendMessage = async (messageContent, messageType = 'text', file = null) => {
    if (!connected || !roomId) {
      console.warn('WebSocket 연결이 되어있지 않거나 채팅방 ID가 없습니다.');
      return;
    }

    // 세션스토리지에서 member_idx 가져오기
    const sessionMemberIdx = sessionStorage.getItem('chat_member_idx');
    const currentMemberIdx = sessionMemberIdx ? parseInt(sessionMemberIdx) : null;
    
    if (!currentMemberIdx) {
      console.error('세션스토리지에서 member_idx를 찾을 수 없습니다.');
      return;
    }

    // 상대방 인덱스 계산
    const otherMemberIdx = roomData?.trainer_idx === user.member_idx 
      ? roomData?.user_idx 
      : roomData?.trainer_idx;

    // 메시지 데이터 구성
    const messageData = {
      room_idx: parseInt(roomId),
      // sender_idx: user.member_idx, - useWebSocket에서 자동으로 추가
      receiver_idx: otherMemberIdx,
      message_content: messageContent,
      message_type: messageType
    };

    console.log('메시지 전송:', messageData);

    // WebSocket으로 메시지 전송 (실시간 전송)
    sendMessage(messageData);

    // 파일 업로드 처리 (이미지인 경우)
    if (file && messageType === 'image') {
      console.log('파일 업로드 처리 시작:', file.name);
      
      // 메시지가 서버에 저장될 때까지 잠시 대기 후 파일 업로드
      setTimeout(async () => {
        try {
          // 최신 메시지 목록에서 방금 전송한 메시지 찾기
          const messageList = await chatApi.readMessageList(parseInt(roomId));
          const latestMessage = messageList[messageList.length - 1];
          
          if (latestMessage && latestMessage.sender_idx === currentMemberIdx) {
            console.log('파일 업로드 시작:', latestMessage.message_idx);
            
            // 백엔드 API 호출 (uploadFile 메서드와 정확히 일치)
            await chatApi.uploadFile(file, latestMessage.message_idx);
            
            // 업로드된 첨부파일 정보 조회
            const attachList = await chatApi.readFile(latestMessage.message_idx);
            
            // 첨부파일 상태 업데이트
            setAttachments(prev => ({
              ...prev,
              [latestMessage.message_idx]: attachList
            }));
            
            console.log('파일 업로드 완료:', attachList);
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
    // 현재 로그인한 사용자의 member_idx 가져오기
    const currentMemberIdx = user.member_idx;
    
    // 1순위: 채팅방 이름
    if (roomData?.room_name) {
      // "양태양님과의 상담" 형태에서 이름 추출
      const nameMatch = roomData.room_name.match(/^(.+)님과의 상담$/);
      if (nameMatch) {
        // 현재 사용자가 트레이너인지 일반 사용자인지 확인
        if (roomData.trainer_idx === currentMemberIdx) {
          // 내가 트레이너인 경우 → 회원님과의 상담으로 표시
          return `회원님과의 상담`;
        } else {
          // 내가 일반 사용자인 경우 → 트레이너 이름 표시 (기존 로직)
          const trainerName = nameMatch[1];
          return `${trainerName}님과의 상담`;
        }
      }
      
      // 다른 형태의 room_name이면 그대로 반환
      return roomData.room_name;
    }
    
    // 2순위: 트레이너 정보에서 이름
    if (location.state?.trainerInfo?.member_name) {
      const trainerName = location.state.trainerInfo.member_name;
      
      if (roomData?.trainer_idx === currentMemberIdx) {
        return `회원님과의 상담`; // 내가 트레이너인 경우
      } else {
        return `${trainerName}님과의 상담`; // 내가 일반 사용자인 경우
      }
    }

    // 3순위: 기본 표시명
    if (roomData?.trainer_idx === currentMemberIdx) {
      return `회원님과의 상담`; // 내가 트레이너인 경우
    } else {
      return `트레이너님과의 상담`; // 내가 일반 사용자인 경우
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
        <LoadingMessage>메시지를 불러오는 중...</LoadingMessage>
      </Container>
    );
  }

  return (
    <Container>
      {/* 채팅방 헤더 */}
      <Header>
        <BackButton onClick={handleBackClick}>
          ←
        </BackButton>
        
        <UserInfo>
          <UserName>{getRoomDisplayName()}</UserName>
          {/* 온라인/오프라인 상태 - 일단 간단히 처리 */}
          <UserStatus>{connected ? '온라인' : '연결 중...'}</UserStatus>
        </UserInfo>
      </Header>
      
      {/* 메시지 목록 */}
      <MessagesContainer>
        <MessageList
          messages={messages}
          currentUser={user}
          attachments={attachments}
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