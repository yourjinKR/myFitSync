import { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export const useWebSocket = () => {
  const [client, setClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);
  const isConnectingRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  
  useEffect(() => {
    if (isConnectingRef.current || connected || clientRef.current) {
      console.log('WebSocket 연결 중복 시도 방지');
      return;
    }

    const connect = async () => {
      console.log('WebSocket 연결 시도 중...');
      isConnectingRef.current = true;
      
      const getWebSocketUrl = () => {
        const currentHost = window.location.hostname;
        const currentPort = window.location.port;
        const protocol = window.location.protocol;
        
        if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
          return `${protocol}//localhost:7070/chat`;
        }
        
        if (currentHost.startsWith('192.168.') || currentHost.startsWith('10.') || currentHost.startsWith('172.')) {
          return `${protocol}//${currentHost}:7070/chat`;
        }
        
        return `${protocol}//${currentHost}:7070/chat`;
      };
      
      const websocketUrl = getWebSocketUrl();
      console.log('WebSocket 연결 URL:', websocketUrl);
      
      const stompClient = new Client({
        webSocketFactory: () => {
          console.log('SockJS 연결 생성 - URL:', websocketUrl);
          return new SockJS(websocketUrl, null, { 
            withCredentials: true,
            transports: ['websocket', 'xhr-polling'],
            timeout: 15000
          });
        },
        connectHeaders: {
          'X-Client-Type': 'chat-client',
          'X-Timestamp': Date.now().toString()
        },
        debug: function (str) {
          console.log('STOMP Debug:', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onWebSocketClose: () => {
          console.log('WebSocket 연결 종료됨');
          setConnected(false);
          isConnectingRef.current = false;
          
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

      stompClient.onConnect = (frame) => {
        console.log('WebSocket 연결 성공!', frame);
        isConnectingRef.current = false;
        setConnected(true);
        setClient(stompClient);
        clientRef.current = stompClient;
      };

      stompClient.onStompError = (frame) => {
        console.error('STOMP 에러:', frame.headers['message']);
        console.error('STOMP 에러 상세:', frame);
        isConnectingRef.current = false;
        setConnected(false);
      };

      stompClient.onWebSocketError = (event) => {
        console.error('WebSocket 에러:', event);
        isConnectingRef.current = false;
        setConnected(false);
      };

      stompClient.onDisconnect = () => {
        console.log('WebSocket 연결 해제됨');
        isConnectingRef.current = false;
        setConnected(false);
      };

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

  const subscribeToRoom = useCallback((room_idx, onMessageReceived, onReadReceived, onDeleteReceived) => {
    
    if (client && connected) {
      
      const messageSubscription = client.subscribe(`/topic/room/${room_idx}`, (message) => {
        console.log('🔔 실시간 메시지 수신:', message.body);
        try {
          const messageData = JSON.parse(message.body);
          console.log('📨 파싱된 메시지 데이터:', messageData);
          
          onMessageReceived(messageData);
        } catch (error) {
          console.error('메시지 파싱 오류:', error);
        }
      });
      
      const readSubscription = client.subscribe(`/topic/room/${room_idx}/read`, (message) => {
        console.log('📖 실시간 읽음 확인 수신:', message.body);
        try {
          const readData = JSON.parse(message.body);
          console.log('👁️ 파싱된 읽음 데이터:', readData);
          
          onReadReceived && onReadReceived(readData);
        } catch (error) {
          console.error('읽음 확인 파싱 오류:', error);
        }
      });
      
      // 삭제 알림 구독 추가
      const deleteSubscription = client.subscribe(`/topic/room/${room_idx}/delete`, (message) => {
        console.log('🗑️ 실시간 삭제 알림 수신:', message.body);
        try {
          const deleteData = JSON.parse(message.body);
          console.log('🗑️ 파싱된 삭제 데이터:', deleteData);
          
          onDeleteReceived && onDeleteReceived(deleteData);
        } catch (error) {
          console.error('삭제 알림 파싱 오류:', error);
        }
      });
      
      console.log('✅ 채팅방 구독 완료 (메시지/읽음/삭제) - room_idx:', room_idx);
      
      return () => {
        console.log('❌ 채팅방 구독 해제 - room_idx:', room_idx);
        messageSubscription.unsubscribe();
        readSubscription.unsubscribe();
        deleteSubscription.unsubscribe(); // 삭제 구독도 해제
      };
    } else {
      console.warn('⚠️ WebSocket 연결되지 않음 - 구독 불가');
      return null;
    }
  }, [client, connected]);

  // 메시지 전송 로직 개선 (타입 안전성 강화)
  const sendMessage = useCallback((messageData) => {
    
    const sessionMemberIdx = sessionStorage.getItem('chat_member_idx');
    const memberIdx = sessionMemberIdx ? parseInt(sessionMemberIdx) : null;
    
    if (client && connected && memberIdx && !isConnectingRef.current) {
      const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 타입 안전성 보장
      const messageWithSender = {
        room_idx: parseInt(messageData.room_idx), // 명시적 정수 변환
        sender_idx: memberIdx, // 정수 타입 보장
        receiver_idx: parseInt(messageData.receiver_idx), // 명시적 정수 변환
        message_content: String(messageData.message_content), // 문자열 타입 보장
        message_type: messageData.message_type || 'text', // 기본값 제공
        parent_idx: messageData.parent_idx ? parseInt(messageData.parent_idx) : null, // 답장 기능 (null 허용)
        unique_id: uniqueId,
        timestamp: Date.now()
      };
      
      console.log('📤 메시지 전송 시도 (타입 안전):', messageWithSender);
      
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
      console.warn('연결 상태:', { client: !!client, connected, memberIdx, isConnecting: isConnectingRef.current });
    }
  }, [client, connected]);

  // 읽음 처리 로직 개선
  const markAsRead = useCallback((message_idx, room_idx) => {
    console.log('👁️ 읽음 처리 시도:', { message_idx, room_idx }, '연결 상태:', connected);
    
    const sessionMemberIdx = sessionStorage.getItem('chat_member_idx');
    const memberIdx = sessionMemberIdx ? parseInt(sessionMemberIdx) : null;
    
    if (client && connected && memberIdx && !isConnectingRef.current) {
      // 타입 안전성 보장
      const readData = {
        message_idx: parseInt(message_idx), // 명시적 정수 변환
        room_idx: parseInt(room_idx), // 명시적 정수 변환
        receiver_idx: memberIdx, // 정수 타입 보장
        timestamp: Date.now()
      };
      
      console.log('📖 최종 읽음 처리 데이터 (타입 안전):', readData);
      
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
      console.warn('읽음 처리 상태:', { client: !!client, connected, memberIdx, isConnecting: isConnectingRef.current });
    }
  }, [client, connected]);

  // 메시지 삭제 알림 전송 함수 추가
  const sendDeleteNotification = useCallback((deleteData) => {
    const sessionMemberIdx = sessionStorage.getItem('chat_member_idx');
    const memberIdx = sessionMemberIdx ? parseInt(sessionMemberIdx) : null;
    
    if (client && connected && memberIdx && !isConnectingRef.current) {
      // 타입 안전성 보장
      const deleteNotification = {
        type: 'message_deleted',
        room_idx: parseInt(deleteData.room_idx),
        message_idx: parseInt(deleteData.message_idx),
        deleted_by: memberIdx,
        timestamp: Date.now()
      };
      
      console.log('🗑️ 삭제 알림 전송 (타입 안전):', deleteNotification);
      
      try {
        client.publish({
          destination: '/app/chat.delete',
          body: JSON.stringify(deleteNotification)
        });
        console.log('✅ 삭제 알림 전송 완료');
      } catch (error) {
        console.error('❌ 삭제 알림 전송 실패:', error);
      }
    } else {
      console.warn('⚠️ WebSocket 연결되지 않음 또는 연결 중이거나 세션스토리지에 member_idx 없음');
      console.warn('삭제 알림 상태:', { client: !!client, connected, memberIdx, isConnecting: isConnectingRef.current });
    }
  }, [client, connected]);

  return {
    connected,
    subscribeToRoom,
    sendMessage,
    markAsRead,
    sendDeleteNotification
  };
};