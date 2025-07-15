import { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';
import { getWebSocketUrl, getNetworkInfo } from '../utils/WebSocketUtils';

export const useWebSocket = () => {
  const [client, setClient] = useState(null);       // STOMP 클라이언트 객체
  const [connected, setConnected] = useState(false);// 연결 상태
  const clientRef = useRef(null);                   // 클라이언트 참조 (컴포넌트 언마운트 시 정리용)
  const isConnectingRef = useRef(false);            // 연결 중 상태 추가
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;
  const subscriptionsRef = useRef(new Map()); // 구독 정보 저장
  
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
      
      // 네트워크 정보 확인
      const networkInfo = getNetworkInfo();
      const websocketUrl = networkInfo.websocketUrl;
      
      console.log('🔗 WebSocket 연결 URL:', websocketUrl);
      console.log('🌍 네트워크 환경:', networkInfo);
      
      const stompClient = new Client({
        webSocketFactory: () => {
          console.log('SockJS 연결 생성 - URL:', websocketUrl);
          return new SockJS(websocketUrl, null, { 
            withCredentials: true,
            transports: ['websocket', 'xhr-polling', 'xhr-streaming'], // 안정적인 전송 방식만 사용
            timeout: 15000 // 연결 타임아웃 15초
          });
        },
        connectHeaders: {
          'X-Client-Type': 'chat-client',
          'X-Network-Type': networkInfo.isLocal ? 'local' : 
                           networkInfo.isPrivateNetwork ? 'private' : 'public',
          'X-Timestamp': Date.now().toString()
        },
        debug: function (str) {
          console.log('STOMP Debug:', str);
        },
        reconnectDelay: 0,     // 재연결 설정 (연결 끊어졌을 때 5초 후 재시도)
        heartbeatIncoming: 20000,  // 서버로부터 받는 하트비트 간격
        heartbeatOutgoing: 10000,  // 서버로 보내는 하트비트 간격

        onConnect: (frame) => {
          console.log('✅ WebSocket 연결 성공!', frame);
          isConnectingRef.current = false;
          reconnectAttemptsRef.current = 0;
          setConnected(true);
          setClient(stompClient);
          clientRef.current = stompClient;
          
          // 기존 구독 복원
          restoreSubscriptions(stompClient);
        },

        onStompError: (frame) => {
          console.error('❌ STOMP 에러:', frame.headers['message']);
          console.error('STOMP 에러 상세:', frame);
          isConnectingRef.current = false;
          setConnected(false);
          scheduleReconnect();
        },

        onWebSocketError: (event) => {
          console.error('❌ WebSocket 에러:', event);
          isConnectingRef.current = false;
          setConnected(false);
          scheduleReconnect();
        },

        onDisconnect: () => {
          console.log('🔌 WebSocket 연결 해제됨');
          isConnectingRef.current = false;
          setConnected(false);
          scheduleReconnect();
        },

        onWebSocketClose: (event) => {
          console.log('🔌 WebSocket 연결 종료됨', event.code, event.reason);
          setConnected(false);
          isConnectingRef.current = false;
          
          // 정상 종료가 아닌 경우에만 재연결
          if (event.code !== 1000) {
            scheduleReconnect();
          }
        }
      });

      // 연결 시작
      try {
        stompClient.activate();
        console.log('STOMP 클라이언트 활성화 완료');
      } catch (error) {
        console.error('STOMP 클라이언트 활성화 실패:', error);
        isConnectingRef.current = false;
        setConnected(false);
        scheduleReconnect();
      }
    };

    // 재연결 로직 (지수 백오프)
    const scheduleReconnect = () => {
      if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        console.error('❌ 최대 재연결 시도 횟수 초과');
        return;
      }

      const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
      reconnectAttemptsRef.current += 1;
      
      console.log(`🔄 ${delay}ms 후 재연결 시도 (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (!connected && !isConnectingRef.current) {
          connect();
        }
      }, delay);
    };

    // 기존 구독 복원
    const restoreSubscriptions = (stompClient) => {
      subscriptionsRef.current.forEach((subscriptionInfo, destination) => {
        try {
          console.log(`🔄 구독 복원: ${destination}`);
          const subscription = stompClient.subscribe(destination, subscriptionInfo.callback);
          subscriptionsRef.current.set(destination, {
            ...subscriptionInfo,
            subscription
          });
        } catch (error) {
          console.error(`구독 복원 실패: ${destination}`, error);
        }
      });
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

      // 구독 정보 저장 (재연결 시 복원용)
      subscriptionsRef.current.set(`/topic/room/${room_idx}`, {
        callback: (message) => {
          try {
            const messageData = JSON.parse(message.body);
            onMessageReceived(messageData);
          } catch (error) {
            console.error('메시지 파싱 오류:', error);
          }
        },
        subscription: messageSubscription
      });
      
      subscriptionsRef.current.set(`/topic/room/${room_idx}/read`, {
        callback: (message) => {
          try {
            const readData = JSON.parse(message.body);
            onReadReceived && onReadReceived(readData);
          } catch (error) {
            console.error('읽음 확인 파싱 오류:', error);
          }
        },
        subscription: readSubscription
      });
      
      console.log('✅ 채팅방 구독 완료 - room_idx:', room_idx);
      
      // 구독 해제 함수 반환
      return () => {
        console.log('❌ 채팅방 구독 해제 - room_idx:', room_idx);
        messageSubscription.unsubscribe();
        readSubscription.unsubscribe();
        subscriptionsRef.current.delete(`/topic/room/${room_idx}`);
        subscriptionsRef.current.delete(`/topic/room/${room_idx}/read`);
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