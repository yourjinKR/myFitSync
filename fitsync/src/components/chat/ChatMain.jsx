import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ChatApi from '../../utils/ChatApi';
import IsLoading3 from '../../components/IsLoading3';

const Container = styled.div`
  padding: 20px;
  height: 100%;
  background-color: var(--bg-primary);
`;

const Header = styled.div`
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-size: 2.4rem;
  color: var(--text-primary);
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 1.4rem;
  color: var(--text-secondary);
`;

const RoomList = styled.div`
  background: var(--bg-secondary);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  border: 1px solid var(--border-light);
`;

const RoomItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-light);
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background-color: var(--bg-tertiary);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const Avatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-dark) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.6rem;
  margin-right: 16px;
`;

const RoomInfo = styled.div`
  flex: 1;
`;

const RoomName = styled.div`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const LastMessage = styled.div`
  font-size: 1.3rem;
  color: var(--text-secondary);
`;

const TimeStamp = styled.div`
  font-size: 1.2rem;
  color: var(--text-tertiary);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 16px;
`;

const EmptyText = styled.p`
  font-size: 1.6rem;
  margin-bottom: 8px;
`;

const EmptySubtext = styled.p`
  font-size: 1.3rem;
  color: var(--text-tertiary);
`;

// 채팅 메인 화면 컴포넌트
const ChatMain = () => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.user); // Redux에서 사용자 정보 가져오기
  
  // 상태 관리
  const [rooms, setRooms] = useState([]);       // 채팅방 목록
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [unreadCounts, setUnreadCounts] = useState({}); // 읽지 않은 메시지 개수 저장

  // 컴포넌트 마운트시 초기화
  useEffect(() => {
    // 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
    if (!user || !user.isLogin) {
      navigate('/login');
      return;
    }

    loadRooms();
  }, [user, navigate]);

  // 채팅방 목록 조회
  const loadRooms = async () => {
    try {
      // 백엔드 API 호출
      const roomList = await ChatApi.readRoomList();
      setRooms(roomList);

      // 각 채팅방의 읽지 않은 메시지 개수 조회
      const unreadData = {};
      for (const room of roomList) {
        try {
          const unreadResponse = await ChatApi.unreadCount(room.room_idx);
          unreadData[room.room_idx] = unreadResponse.unreadCount || 0;
        } catch (error) {
          console.error(`채팅방 ${room.room_idx} 읽지 않은 메시지 조회 실패:`, error);
          unreadData[room.room_idx] = 0;
        }
      }
      setUnreadCounts(unreadData);
      
    } catch (error) {
      console.error('채팅방 목록 로드 실패:', error);
      
      // 에러 처리
      if (error.response?.status === 401) {
        alert('로그인이 만료되었습니다.');
        navigate('/login');
      } else {
        // 네트워크 오류나 기타 오류는 빈 배열로 처리
        setRooms([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // 시간 포멧
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = diffInMs / (1000 * 60 * 60);

    // 24시간 이내면 시:분 형태로 표시
    if (diffInHours < 24) {
      return date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      // 24시간 이후면 월 일 형태로 표시
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  // 채팅방 표시 이름 생성 (수정된 부분)
  const getRoomDisplayName = (room) => {
    // 현재 로그인한 사용자의 member_idx 가져오기
    const currentMemberIdx = user.member_idx;
    
    // 백엔드에서 가져온 실제 이름 사용
    if (room.trainer_idx === currentMemberIdx) {
      // 내가 트레이너인 경우 → 회원 이름 표시
      const userName = room.user_name || '회원';
      return `${userName}님과의 상담`;
    } else {
      // 내가 일반 사용자인 경우 → 트레이너 이름 표시
      const trainerName = room.trainer_name || '트레이너';
      return `${trainerName}님과의 상담`;
    }
  };

  // 마지막 메시지 상태 텍스트 생성 (수정된 부분)
  const getLastMessageText = (room) => {
    const unreadCount = unreadCounts[room.room_idx] || 0;
    
    if (unreadCount > 0) {
      return `새 메시지 ${unreadCount}개가 있습니다`;
    } else {
      return '메시지 기록이 있습니다';
    }
  };

  // 아바타 초성 추출
  const getInitial = (room) => {
    const currentMemberIdx = user.member_idx;
    
    // 실제 상대방 이름에서 초성 추출
    if (room.trainer_idx === currentMemberIdx) {
      // 내가 트레이너인 경우 → 회원 이름 초성
      const userName = room.user_name || '회원';
      return userName.charAt(0).toUpperCase();
    } else {
      // 내가 일반 사용자인 경우 → 트레이너 이름 초성
      const trainerName = room.trainer_name || '트레이너';
      return trainerName.charAt(0).toUpperCase();
    }
  };

  // 채팅방 정보 클릭
  const handleRoomClick = (room) => {
    navigate(`/chat/${room.room_idx}`, {
      state: { roomData: room } // 채팅방 정보를 state로 전달
    });
  };

  // 로딩 중 화면
  if (loading) {
    return (
      <Container>
        <Header>
          <Title>채팅</Title>
        </Header>
        <IsLoading3 />
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>채팅</Title>
        <Subtitle>진행중인 상담 목록입니다</Subtitle>
      </Header>

      {/* 채팅방이 없는 경우 빈 상태 표시 */}
      {rooms.length === 0 ? (
        <RoomList>
          <EmptyState>
            <EmptyIcon>💬</EmptyIcon>
            <EmptyText>진행중인 채팅이 없습니다</EmptyText>
            <EmptySubtext>트레이너 검색에서 1:1 상담을 시작해보세요</EmptySubtext>
          </EmptyState>
        </RoomList>
      ) : (
        // 채팅방 목록 표시
        <RoomList>
          {rooms.map((room) => (
            <RoomItem
              key={room.room_idx}
              onClick={() => handleRoomClick(room)}
            >
              {/* 상대방 아바타 */}
              <Avatar>
                {getInitial(getRoomDisplayName(room))}
              </Avatar>
              
              {/* 채팅방 정보 */}
              <RoomInfo>
                <RoomName>{getRoomDisplayName(room)}</RoomName>
                <LastMessage>
                  {getLastMessageText(room)}
                </LastMessage>
              </RoomInfo>
              
              {/* 마지막 메시지 시간 */}
              <TimeStamp>
                {formatTime(room.room_msgdate)}
              </TimeStamp>
            </RoomItem>
          ))}
        </RoomList>
      )}
    </Container>
  );
};

export default ChatMain;