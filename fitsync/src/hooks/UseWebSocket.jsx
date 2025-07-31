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
  
  // 메시지 중복 처리 방지
  const processedMessagesRef = useRef(new Set());
  const messageProcessingTimerRef = useRef(null);
  
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
        reconnectAttemptsRef.current = 0; // 연결 성공 시 재연결 시도 횟수 리셋
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
      
      // 정리 작업 최적화
      if (messageProcessingTimerRef.current) {
        clearTimeout(messageProcessingTimerRef.current);
      }
      processedMessagesRef.current.clear();
      
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
      setClient(null);
      setConnected(false);
    };
  }, []);

  // 메시지 중복 처리 방지 함수
  const isMessageProcessed = useCallback((messageId) => {
    if (!messageId) return false;
    
    if (processedMessagesRef.current.has(messageId)) {
      return true;
    }
    
    processedMessagesRef.current.add(messageId);
    
    // 메모리 누수 방지: 5분 후 메시지 ID 정리
    setTimeout(() => {
      processedMessagesRef.current.delete(messageId);
    }, 5 * 60 * 1000);
    
    return false;
  }, []);

  const subscribeToRoom = useCallback((room_idx, onMessageReceived, onReadReceived, onDeleteReceived) => {
    
    if (client && connected) {
      
      const messageSubscription = client.subscribe(`/topic/room/${room_idx}`, (message) => {
        console.log('🔔 실시간 메시지 수신:', message.body);
        try {
          const messageData = JSON.parse(message.body);
          console.log('📨 파싱된 메시지 데이터:', messageData);
          
          // 중복 메시지 처리 방지
          const messageId = messageData.message_idx || `${messageData.sender_idx}_${messageData.timestamp}`;
          if (isMessageProcessed(messageId)) {
            console.log('⚠️ 중복 메시지 무시:', messageId);
            return;
          }
          
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
  }, [client, connected, isMessageProcessed]);

  // 매칭 상태 업데이트 구독 함수
  const subscribeToMatchingUpdates = useCallback((trainer_idx, onMatchingUpdate) => {
    if (client && connected) {
      console.log('🎯 매칭 상태 업데이트 구독 시작 - 트레이너:', trainer_idx);
      
      // 중복 매칭 업데이트 방지를 위한 Set (일반 변수로 변경)
      const processedMatchingUpdates = new Set();
      
      const processMatchingUpdate = (matchingUpdate) => {
        // 중복 업데이트 방지
        const updateId = `${matchingUpdate.matching_idx}_${matchingUpdate.status_type}_${matchingUpdate.timestamp}`;
        if (processedMatchingUpdates.has(updateId)) {
          console.log('⚠️ 중복 매칭 업데이트 무시:', updateId);
          return;
        }
        
        processedMatchingUpdates.add(updateId);
        
        // 메모리 정리 (30초 후)
        setTimeout(() => {
          processedMatchingUpdates.delete(updateId);
        }, 30000);
        
        onMatchingUpdate && onMatchingUpdate(matchingUpdate);
      };
      
      // 트레이너별 매칭 상태 업데이트 구독
      const matchingSubscription = client.subscribe(`/topic/trainer/${trainer_idx}/matching`, (message) => {
        console.log('🔄 매칭 상태 업데이트 수신:', message.body);
        try {
          const matchingUpdate = JSON.parse(message.body);
          console.log('🎯 파싱된 매칭 업데이트:', matchingUpdate);
          
          processMatchingUpdate(matchingUpdate);
        } catch (error) {
          console.error('❌ 매칭 상태 업데이트 파싱 오류:', error);
        }
      });
      
      // 트레이너의 모든 채팅방에 대한 매칭 상태 브로드캐스트 구독
      const roomsMatchingSubscription = client.subscribe(`/topic/trainer/${trainer_idx}/rooms/matching`, (message) => {
        console.log('🔄 채팅방별 매칭 상태 업데이트 수신:', message.body);
        try {
          const matchingUpdate = JSON.parse(message.body);
          console.log('🎯 파싱된 채팅방 매칭 업데이트:', matchingUpdate);
          
          processMatchingUpdate(matchingUpdate);
        } catch (error) {
          console.error('❌ 채팅방 매칭 상태 업데이트 파싱 오류:', error);
        }
      });
      
      console.log('✅ 매칭 상태 업데이트 구독 완료 - 트레이너:', trainer_idx);
      
      return () => {
        console.log('❌ 매칭 상태 업데이트 구독 해제 - 트레이너:', trainer_idx);
        processedMatchingUpdates.clear();
        matchingSubscription.unsubscribe();
        roomsMatchingSubscription.unsubscribe();
      };
    } else {
      console.warn('⚠️ WebSocket 연결되지 않음 - 매칭 구독 불가');
      return null;
    }
  }, [client, connected]);

  // 메시지 전송 로직 개선
  const sendMessage = useCallback((messageData) => {
    
    const sessionMemberIdx = sessionStorage.getItem('chat_member_idx');
    const memberIdx = sessionMemberIdx ? parseInt(sessionMemberIdx) : null;
    
    if (client && connected && memberIdx && !isConnectingRef.current) {
      const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 중복 전송 방지
      if (isMessageProcessed(uniqueId)) {
        console.warn('⚠️ 중복 메시지 전송 방지:', uniqueId);
        return;
      }
      
      // 기본 메시지 데이터 구성 (타입 안전성 보장)
      const messageWithSender = {
        room_idx: parseInt(messageData.room_idx),
        sender_idx: memberIdx,
        receiver_idx: parseInt(messageData.receiver_idx),
        message_content: String(messageData.message_content),
        message_type: messageData.message_type || 'text',
        parent_idx: messageData.parent_idx ? parseInt(messageData.parent_idx) : null,
        unique_id: uniqueId,
        timestamp: Date.now()
      };

      // 매칭 데이터 처리 개선 (DB 저장 방식)
      if (messageData.matching_data && typeof messageData.matching_data === 'object') {
        console.log('🎯 매칭 데이터 포함된 메시지 전송 (DB 저장 방식):', messageData.matching_data);
        
        // 매칭 데이터 유효성 검증 및 타입 안전성 보장
        const validatedMatchingData = {};
        
        // 필수 필드들 검증 및 변환
        const requiredFields = ['matching_idx', 'trainer_idx', 'user_idx', 'matching_total'];
        const optionalFields = ['matching_remain', 'matching_complete'];
        
        // 필수 필드 검증
        let validationFailed = false;
        for (const field of requiredFields) {
          const value = messageData.matching_data[field];
          if (value !== undefined && value !== null) {
            const numValue = parseInt(value);
            if (!isNaN(numValue)) {
              validatedMatchingData[field] = numValue;
            } else {
              console.error(`❌ 매칭 데이터 필수 필드 변환 실패: ${field} = ${value}`);
              validationFailed = true;
              break;
            }
          } else {
            console.error(`❌ 매칭 데이터 필수 필드 누락: ${field}`);
            validationFailed = true;
            break;
          }
        }
        
        if (validationFailed) {
          console.warn('⚠️ 매칭 데이터 전송 중단 - 검증 실패');
          return;
        }
        
        // 선택 필드 처리
        for (const field of optionalFields) {
          const value = messageData.matching_data[field];
          if (value !== undefined && value !== null) {
            const numValue = parseInt(value);
            if (!isNaN(numValue)) {
              validatedMatchingData[field] = numValue;
            }
          }
        }
        
        console.log('✅ 매칭 데이터 검증 완료 (DB 저장 방식):', validatedMatchingData);
        
        // WebSocket 메시지에 매칭 데이터 추가
        messageWithSender.matching_data = validatedMatchingData;
      }
      
      console.log('📤 최종 메시지 전송 데이터 (DB 저장 방식):', messageWithSender);
      
      try {
        client.publish({
          destination: '/app/chat.send',
          body: JSON.stringify(messageWithSender)
        });
        console.log('✅ 메시지 전송 완료 (DB 저장 방식)');
      } catch (error) {
        console.error('❌ 메시지 전송 실패:', error);
      }
    } else {
      console.warn('⚠️ WebSocket 연결되지 않음 또는 연결 중이거나 세션스토리지에 member_idx 없음');
      console.warn('전송 상태:', { 
        client: !!client, 
        connected, 
        memberIdx, 
        isConnecting: isConnectingRef.current 
      });
    }
  }, [client, connected, isMessageProcessed]);

  // 개별 읽음 처리 로직
  const markAsReadTimeoutRef = useRef(null);
  const markAsRead = useCallback((message_idx, room_idx) => {
    console.log('👁️ 개별 읽음 처리 시도:', { message_idx, room_idx }, '연결 상태:', connected);
    
    const sessionMemberIdx = sessionStorage.getItem('chat_member_idx');
    const memberIdx = sessionMemberIdx ? parseInt(sessionMemberIdx) : null;
    
    if (client && connected && memberIdx && !isConnectingRef.current) {
      
      // 타입 안전성 보장
      const readData = {
        message_idx: parseInt(message_idx),
        room_idx: parseInt(room_idx),
        receiver_idx: memberIdx,
        timestamp: Date.now()
      };
      
      console.log('📖 개별 읽음 처리 데이터 (즉시 전송):', readData);
      
      try {
        client.publish({
          destination: '/app/chat.read',
          body: JSON.stringify(readData)
        });
        console.log('✅ 개별 읽음 처리 완료 (message_idx:', message_idx, ')');
      } catch (error) {
        console.error('❌ 개별 읽음 처리 실패:', error);
      }
      
    } else {
      console.warn('⚠️ WebSocket 연결되지 않음 또는 연결 중이거나 세션스토리지에 member_idx 없음');
      console.warn('개별 읽음 처리 상태:', { client: !!client, connected, memberIdx, isConnecting: isConnectingRef.current });
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

  // 매칭 상태 브로드캐스트 함수
  const lastBroadcastRef = useRef(null);
  const broadcastMatchingStatus = useCallback((statusData) => {
    const sessionMemberIdx = sessionStorage.getItem('chat_member_idx');
    const memberIdx = sessionMemberIdx ? parseInt(sessionMemberIdx) : null;
    
    if (client && connected && memberIdx && !isConnectingRef.current) {
      // 중복 브로드캐스트 방지
      const broadcastKey = `${statusData.matching_idx}_${statusData.status_type}`;
      const now = Date.now();
      
      if (lastBroadcastRef.current && 
          lastBroadcastRef.current.key === broadcastKey && 
          now - lastBroadcastRef.current.timestamp < 1000) {
        console.log('⚠️ 중복 매칭 브로드캐스트 방지:', broadcastKey);
        return;
      }
      
      lastBroadcastRef.current = {
        key: broadcastKey,
        timestamp: now
      };
      
      // 타입 안전성 보장
      const matchingStatusUpdate = {
        type: 'matching_status_changed',
        trainer_idx: parseInt(statusData.trainer_idx),
        user_idx: parseInt(statusData.user_idx),
        status_type: statusData.status_type, // "accepted", "rejected"
        matching_idx: statusData.matching_idx ? parseInt(statusData.matching_idx) : null,
        timestamp: now
      };
      
      console.log('🎯 매칭 상태 브로드캐스트 전송:', matchingStatusUpdate);
      
      try {
        client.publish({
          destination: '/app/matching.status',
          body: JSON.stringify(matchingStatusUpdate)
        });
        console.log('✅ 매칭 상태 브로드캐스트 완료');
      } catch (error) {
        console.error('❌ 매칭 상태 브로드캐스트 실패:', error);
      }
    } else {
      console.warn('⚠️ WebSocket 연결되지 않음 - 매칭 상태 브로드캐스트 불가');
      console.warn('브로드캐스트 상태:', { client: !!client, connected, memberIdx, isConnecting: isConnectingRef.current });
    }
  }, [client, connected]);

  // 정리 함수
  useEffect(() => {
    return () => {
      if (markAsReadTimeoutRef.current) {
        clearTimeout(markAsReadTimeoutRef.current);
      }
      if (messageProcessingTimerRef.current) {
        clearTimeout(messageProcessingTimerRef.current);
      }
    };
  }, []);

  return {
    connected,
    subscribeToRoom,
    subscribeToMatchingUpdates,
    sendMessage,
    markAsRead,
    sendDeleteNotification,
    broadcastMatchingStatus
  };
};