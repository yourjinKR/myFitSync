import { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export const useWebSocket = (member_idx) => {
  const [client, setClient] = useState(null);       // STOMP 클라이언트 객체
  const [connected, setConnected] = useState(false);// 연결 상태
  const clientRef = useRef(null);                   // 클라이언트 참조 (컴포넌트 언마운트 시 정리용)

  // WebSocket 연결 초기화 및 관리
  useEffect(() => {
    if (!member_idx) return;

    // STOMP 클라이언트 연결 설정 및 시작
    const connect = () => {
      const stompClient = new Client({
        webSocketFactory: () => new SockJS('/chat'),  // SockJS를 통한 WebSocket 연결 (폴백 지원)
        connectHeaders: {
          member_idx: member_idx.toString()           // 연결 헤더에 사용자 정보 포함
        },
        debug: function (str) {
          console.log('STOMP Debug: ' + str);
        },
        reconnectDelay: 5000,     // 재연결 설정 (연결 끊어졌을 때 5초 후 재시도)
        heartbeatIncoming: 4000,  // 서버로부터 받는 하트비트 간격
        heartbeatOutgoing: 4000,  // 서버로 보내는 하트비트 간격
      });

      // 연결 성공 시 콜백
      stompClient.onConnect = (frame) => {
        console.log('WebSocket Connected: ' + frame);
        setConnected(true);
        setClient(stompClient);
        clientRef.current = stompClient;
      };

      // STOMP 에러 발생 시 콜백
      stompClient.onStompError = (frame) => {
        console.error('STOMP Error: ' + frame.headers['message']);
        setConnected(false);
      };

      // 연결 해제 시 콜백
      stompClient.onDisconnect = () => {
        console.log('WebSocket Disconnected');
        setConnected(false);
      };

      // 연결 시작
      stompClient.activate();
    };

    connect();

    // 컴포넌트 언마운트 시 연결 정리
    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [member_idx]);

  // 채팅방 구독
  const subscribeToRoom = useCallback((room_idx, onMessageReceived, onReadReceived) => {
    if (client && connected) {
      // 채팅 메시지 구독
      const messageSubscription = client.subscribe(`/topic/room/${room_idx}`, (message) => {
        const messageData = JSON.parse(message.body);
        onMessageReceived(messageData);
      });
      // 읽음 확인 구독
      const readSubscription = client.subscribe(`/topic/room/${room_idx}/read`, (message) => {
        const readData = JSON.parse(message.body);
        onReadReceived && onReadReceived(readData);
      });
      // 구독 해제
      return () => {
        messageSubscription.unsubscribe();
        readSubscription.unsubscribe();
      };
    }
  }, [client, connected]);

  // 메시지 전송
  const sendMessage = useCallback((messageData) => {
    if (client && connected) {
      client.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(messageData)
      });
    }
  }, [client, connected]);

  // 읽음 처리
  const markAsRead = useCallback((message_idx, room_idx, receiver_idx) => {
    if (client && connected) {
      client.publish({
        destination: '/app/chat.read',
        body: JSON.stringify({
          message_idx,
          room_idx,
          receiver_idx
        })
      });
    }
  }, [client, connected]);

  return {
    connected,
    subscribeToRoom,
    sendMessage,
    markAsRead
  };
};