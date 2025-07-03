import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ChatApi from '../../util/ChatApi';

const Container = styled.div`
  padding: 20px;
  height: 100%;
  background-color: #f8faff;
`;

const Header = styled.div`
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-size: 2.4rem;
  color: #232946;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 1.4rem;
  color: #666;
`;

const RoomList = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const RoomItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background-color: #f8faff;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const Avatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background: linear-gradient(135deg, #7D93FF 0%, #5e72e4 100%);
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
  color: #232946;
  margin-bottom: 4px;
`;

const LastMessage = styled.div`
  font-size: 1.3rem;
  color: #666;
`;

const TimeStamp = styled.div`
  font-size: 1.2rem;
  color: #999;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
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
  color: #999;
`;

// 채팅 메인 화면 컴포넌트
const ChatMain = () => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.user); // Redux에서 사용자 정보 가져오기
  
  // 상태 관리
  const [rooms, setRooms] = useState([]);       // 채팅방 목록
  const [loading, setLoading] = useState(true); // 로딩 상태

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
      
      console.log('채팅방 목록 로드 성공:', roomList);
      setRooms(roomList);
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

  // 채팅방 표시 이름 생성
  const getRoomDisplayName = (room) => {
    // 1순위: 설정된 채팅방 이름
    if (room.room_name) return room.room_name;
    
    // 2순위: 상대방 구분하여 표시
    if (room.trainer_idx === user.member_idx) {
      return `회원 ${room.user_idx}`; // 내가 트레이너인 경우
    } else {
      return `트레이너 ${room.trainer_idx}`; // 내가 일반 사용자인 경우
    }
  };

  // 아바타 초성 추출
  const getInitial = (name) => {
    return name.charAt(0).toUpperCase();
  };

  // 채팅방 정보 클릭
  const handleRoomClick = (room) => {
    console.log('채팅방 선택:', room);
    
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
          <Subtitle>로딩 중...</Subtitle>
        </Header>
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
                  {room.room_msgdate ? '새 메시지가 있습니다' : '채팅을 시작해보세요'}
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