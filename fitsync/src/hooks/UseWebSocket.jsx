import { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export const useWebSocket = () => {
  const [client, setClient] = useState(null);       // STOMP 클라이언트 객체
  const [connected, setConnected] = useState(false);// 연결 상태
  const clientRef = useRef(null);                   // 클라이언트 참조 (컴포넌트 언마운트 시 정리용)

  // WebSocket 연결 초기화 및 관리
  useEffect(() => {
    // STOMP 클라이언트 연결 설정 및 시작
    const connect = () => {
      console.log('WebSocket 연결 시도 중...');
      
      const stompClient = new Client({
        webSocketFactory: () => {
          console.log('SockJS 연결 생성');
          // SockJS를 통한 WebSocket 연결 (폴백 지원)
          return new SockJS('http://localhost:7070/chat', null, { 
            withCredentials: true
          });
        },
        connectHeaders: {},
        debug: function (str) {
          console.log('STOMP Debug:', str);
        },
        reconnectDelay: 5000,     // 재연결 설정 (연결 끊어졌을 때 5초 후 재시도)
        heartbeatIncoming: 4000,  // 서버로부터 받는 하트비트 간격
        heartbeatOutgoing: 4000,  // 서버로 보내는 하트비트 간격
      });

      // 연결 성공 시 콜백
      stompClient.onConnect = (frame) => {
        console.log('WebSocket 연결 성공!', frame);
        setConnected(true);
        setClient(stompClient);
        clientRef.current = stompClient;
      };

      // STOMP 에러 발생 시 콜백
      stompClient.onStompError = (frame) => {
        console.error('STOMP 에러:', frame.headers['message']);
        console.error('STOMP 에러 상세:', frame);
        setConnected(false);
      };

      // WebSocket 에러 발생 시 콜백
      stompClient.onWebSocketError = (event) => {
        console.error('WebSocket 에러:', event);
        setConnected(false);
      };

      // 연결 해제 시 콜백
      stompClient.onDisconnect = () => {
        console.log('WebSocket 연결 해제됨');
        setConnected(false);
      };

      // 연결 시작
      try {
        stompClient.activate();
        console.log('STOMP 클라이언트 활성화 완료');
      } catch (error) {
        console.error('STOMP 클라이언트 활성화 실패:', error);
        setConnected(false);
      }
    };

    connect();

    // 컴포넌트 언마운트 시 연결 정리
    return () => {
      console.log('WebSocket 정리 중...');
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, []);

  // 채팅방 구독
  const subscribeToRoom = useCallback((room_idx, onMessageReceived, onReadReceived) => {
    console.log('채팅방 구독 시도:', room_idx, '연결 상태:', connected);
    
    if (client && connected) {
      console.log('채팅방 구독 시작:', room_idx);
      
      // 채팅 메시지 구독
      const messageSubscription = client.subscribe(`/topic/room/${room_idx}`, (message) => {
        console.log('WebSocket 메시지 수신:', message.body);
        const messageData = JSON.parse(message.body);
        onMessageReceived(messageData);
      });
      
      // 읽음 확인 구독
      const readSubscription = client.subscribe(`/topic/room/${room_idx}/read`, (message) => {
        console.log('WebSocket 읽음 확인 수신:', message.body);
        const readData = JSON.parse(message.body);
        onReadReceived && onReadReceived(readData);
      });
      
      console.log('채팅방 구독 완료');
      
      // 구독 해제 함수 반환
      return () => {
        console.log('채팅방 구독 해제');
        messageSubscription.unsubscribe();
        readSubscription.unsubscribe();
      };
    } else {
      console.warn('WebSocket 연결되지 않음 - 구독 불가');
      return null;
    }
  }, [client, connected]);

  // 메시지 전송
  const sendMessage = useCallback((messageData) => {
    console.log('메시지 전송 시도:', messageData, '연결 상태:', connected);
    
    if (client && connected) {
      client.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(messageData)
      });
      console.log('메시지 전송 완료');
    } else {
      console.warn('WebSocket 연결되지 않음 - 메시지 전송 불가');
    }
  }, [client, connected]);

  // 읽음 처리
  const markAsRead = useCallback((message_idx, room_idx) => {
    console.log('읽음 처리 시도:', { message_idx, room_idx }, '연결 상태:', connected);
    
    if (client && connected) {
      client.publish({
        destination: '/app/chat.read',
        body: JSON.stringify({
          message_idx,
          room_idx
          // receiver_idx 제거 - 백엔드에서 세션으로 처리
        })
      });
      console.log('읽음 처리 완료');
    } else {
      console.warn('WebSocket 연결되지 않음 - 읽음 처리 불가');
    }
  }, [client, connected]);

  return {
    connected,
    subscribeToRoom,
    sendMessage,
    markAsRead
  };
};