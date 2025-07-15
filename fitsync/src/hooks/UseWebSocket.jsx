import { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';

export const useWebSocket = () => {
  const [client, setClient] = useState(null);       // STOMP 클라이언트 객체
  const [connected, setConnected] = useState(false);// 연결 상태
  const clientRef = useRef(null);                   // 클라이언트 참조 (컴포넌트 언마운트 시 정리용)
  const isConnectingRef = useRef(false);            // 연결 중 상태 추가
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  
  // WebSocket 연결 초기화 및 관리
  useEffect(() => {
    // 이미 연결 중이거나 연결된 경우 새로운 연결 시도하지 않음
    if (isConnectingRef.current || connected || clientRef.current) {
      console.log('WebSocket 연결 중복 시도 방지');
      return;
    }

    // STOMP 클라이언트 연결 설정 및 시작
    const connect = async () => {
      console.log('WebSocket 연결 시도 중...');
      isConnectingRef.current = true; // 연결 중 플래그 설정
      
      // 다양한 네트워크 환경 지원을 위한 URL 결정
      const getWebSocketUrl = () => {
        const currentHost = window.location.hostname;
        const currentPort = window.location.port;
        const protocol = window.location.protocol;
        
        // 개발 환경: localhost:3000에서 접속
        if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
          return `${protocol}//localhost:7070/chat`;
        }
        
        // 로컬 네트워크: 192.168.x.x:3000에서 접속
        if (currentHost.startsWith('192.168.') || currentHost.startsWith('10.') || currentHost.startsWith('172.')) {
          return `${protocol}//${currentHost}:7070/chat`;
        }
        
        // 기본값: 현재 호스트 사용
        return `${protocol}//${currentHost}:7070/chat`;
      };
      
      const websocketUrl = getWebSocketUrl();
      console.log('🌐 WebSocket 연결 URL:', websocketUrl);
      
      const stompClient = new Client({
        webSocketFactory: () => {
          console.log('SockJS 연결 생성 - URL:', websocketUrl);
          return new SockJS(websocketUrl, null, { 
            withCredentials: true,
            transports: ['websocket', 'xhr-polling'], // 안정적인 전송 방식만 사용
            timeout: 15000 // 연결 타임아웃 15초
          });
        },
        connectHeaders: {
          'X-Client-Type': 'chat-client',
          'X-Timestamp': Date.now().toString()
        },
        debug: function (str) {
          console.log('STOMP Debug:', str);
        },
        reconnectDelay: 5000,     // 재연결 설정 (연결 끊어졌을 때 5초 후 재시도)
        heartbeatIncoming: 4000,  // 서버로부터 받는 하트비트 간격
        heartbeatOutgoing: 4000,  // 서버로 보내는 하트비트 간격
        onWebSocketClose: () => {
          console.log('WebSocket 연결 종료됨');
          setConnected(false);
          isConnectingRef.current = false;
          
          // 재연결 시도
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectAttemptsRef.current += 1;
            console.log(`재연결 시도 ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
            setTimeout(() => {
              if (!connected && !isConnectingRef.current) {
                connect();
              }
            }, 3000);
          }
        }
      });

      // 연결 성공 시 콜백
      stompClient.onConnect = (frame) => {
        console.log('WebSocket 연결 성공!', frame);
        isConnectingRef.current = false;
        setConnected(true);
        setClient(stompClient);
        clientRef.current = stompClient;
      };

      // STOMP 에러 발생 시 콜백
      stompClient.onStompError = (frame) => {
        console.error('STOMP 에러:', frame.headers['message']);
        console.error('STOMP 에러 상세:', frame);
        isConnectingRef.current = false;
        setConnected(false);
      };

      // WebSocket 에러 발생 시 콜백
      stompClient.onWebSocketError = (event) => {
        console.error('WebSocket 에러:', event);
        isConnectingRef.current = false;
        setConnected(false);
      };

      // 연결 해제 시 콜백
      stompClient.onDisconnect = () => {
        console.log('WebSocket 연결 해제됨');
        isConnectingRef.current = false;
        setConnected(false);
      };

      // 연결 시작
      try {
        stompClient.activate();
        console.log('STOMP 클라이언트 활성화 완료');
      } catch (error) {
        console.error('STOMP 클라이언트 활성화 실패:', error);
        isConnectingRef.current = false;
        setConnected(false);
      }
    };

    connect();

    // 컴포넌트 언마운트 시 연결 정리
    return () => {
      console.log('WebSocket 정리 중...');
      isConnectingRef.current = false;
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
      setClient(null);
      setConnected(false);
    };
  }, []);

  // 채팅방 구독
  const subscribeToRoom = useCallback((room_idx, onMessageReceived, onReadReceived) => {
    
    if (client && connected) {
      
      // 채팅 메시지 구독
      const messageSubscription = client.subscribe(`/topic/room/${room_idx}`, (message) => {
        console.log('🔔 실시간 메시지 수신:', message.body);
        try {
          const messageData = JSON.parse(message.body);
          console.log('📨 파싱된 메시지 데이터:', messageData);
          
          // 지연 없이 콜백 실행
          onMessageReceived(messageData);
        } catch (error) {
          console.error('메시지 파싱 오류:', error);
        }
      });
      
      // 읽음 확인 구독
      const readSubscription = client.subscribe(`/topic/room/${room_idx}/read`, (message) => {
        console.log('📖 실시간 읽음 확인 수신:', message.body);
        try {
          const readData = JSON.parse(message.body);
          console.log('👁️ 파싱된 읽음 데이터:', readData);
          
          // 지연 없이 콜백 실행
          onReadReceived && onReadReceived(readData);
        } catch (error) {
          console.error('읽음 확인 파싱 오류:', error);
        }
      });
      
      console.log('✅ 채팅방 구독 완료 - room_idx:', room_idx);
      
      // 구독 해제 함수 반환
      return () => {
        console.log('❌ 채팅방 구독 해제 - room_idx:', room_idx);
        messageSubscription.unsubscribe();
        readSubscription.unsubscribe();
      };
    } else {
      console.warn('⚠️ WebSocket 연결되지 않음 - 구독 불가');
      return null;
    }
  }, [client, connected]);

  // 메시지 전송 중복 방지 개선
  const sendMessage = useCallback((messageData) => {
    
    // 세션스토리지에서 member_idx 가져오기
    const sessionMemberIdx = sessionStorage.getItem('chat_member_idx');
    const memberIdx = sessionMemberIdx ? parseInt(sessionMemberIdx) : null;
    
    if (client && connected && memberIdx && !isConnectingRef.current) { // 연결 중이 아닐 때만 전송
      // 고유한 메시지 ID 생성 (중복 전송 방지)
      const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 세션스토리지에서 가져온 member_idx를 sender_idx로 추가
      const messageWithSender = {
        ...messageData,
        sender_idx: memberIdx,
        unique_id: uniqueId, // 고유ID
        timestamp: Date.now()
      };
      
      console.log('📤 메시지 전송 시도:', messageWithSender);
      
      try {
        client.publish({
          destination: '/app/chat.send',
          body: JSON.stringify(messageWithSender)
        });
        console.log('✅ 메시지 전송 완료');
      } catch (error) {
        console.error('❌ 메시지 전송 실패:', error);
      }
    } else {
      console.warn('⚠️ WebSocket 연결되지 않음 또는 연결 중이거나 세션스토리지에 member_idx 없음');
    }
  }, [client, connected]);

  // 읽음 처리
  const markAsRead = useCallback((message_idx, room_idx) => {
    console.log('👁️ 읽음 처리 시도:', { message_idx, room_idx }, '연결 상태:', connected);
    
    // 세션스토리지에서 member_idx 가져오기
    const sessionMemberIdx = sessionStorage.getItem('chat_member_idx');
    const memberIdx = sessionMemberIdx ? parseInt(sessionMemberIdx) : null;
    
    if (client && connected && memberIdx && !isConnectingRef.current) { // 연결 중이 아닐 때만 전송
      // 세션스토리지에서 가져온 member_idx를 receiver_idx로 추가
      const readData = {
        message_idx,
        room_idx,
        receiver_idx: memberIdx,
        timestamp: Date.now()
      };
      
      console.log('📖 최종 읽음 처리 데이터:', readData);
      
      try {
        client.publish({
          destination: '/app/chat.read',
          body: JSON.stringify(readData)
        });
        console.log('✅ 읽음 처리 완료');
      } catch (error) {
        console.error('❌ 읽음 처리 실패:', error);
      }
    } else {
      console.warn('⚠️ WebSocket 연결되지 않음 또는 연결 중이거나 세션스토리지에 member_idx 없음');
    }
  }, [client, connected]);

  return {
    connected,
    subscribeToRoom,
    sendMessage,
    markAsRead
  };
};