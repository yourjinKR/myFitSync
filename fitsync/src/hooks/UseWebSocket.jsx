import { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// WebSocket 연결 및 실시간 채팅을 위한 커스텀 훅
export const useWebSocket = (shouldConnect = true) => {
  // 연결 상태 관리
  const [client, setClient] = useState(null);
  const [connected, setConnected] = useState(false);
  
  // 연결 관리용 ref
  const clientRef = useRef(null);
  const isConnectingRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const shouldReconnectRef = useRef(true); // 재연결 여부 제어
  const isManuallyDisconnectedRef = useRef(false); // 수동 해제 여부
  
  // 메시지 중복 처리 방지용 ref
  const processedMessagesRef = useRef(new Set());
  const messageProcessingTimerRef = useRef(null);

  // 인증 상태 확인 함수
  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await fetch('/member/check', {
        credentials: 'include',
        timeout: 5000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      // 401 에러
      if (!response.ok) {
        if (response.status === 401) {
          return false; // 로그인하지 않은 상태
        }
        console.warn('인증 확인 응답 오류:', response.status, response.statusText);
        return false;
      }
      
      // Content-Type 헤더 확인
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return false;
      }
      
      // 응답 텍스트 먼저 가져와서 검증
      const responseText = await response.text();
      
      // HTML 응답인지 확인 (< 문자로 시작하면 HTML)
      if (responseText.trim().startsWith('<')) {
        return false;
      }
      
      // JSON 파싱 시도
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        return false;
      }
      
      return data.isLogin === true;
    } catch (error) {
      return false;
    }
  }, []);

  // 연결 해제 함수
  const forceDisconnect = useCallback(() => {
    // 재연결 방지
    shouldReconnectRef.current = false;
    isManuallyDisconnectedRef.current = true;
    isConnectingRef.current = false;
    reconnectAttemptsRef.current = maxReconnectAttempts; // 재연결 시도 최대치로 설정
    
    // 기존 클라이언트 정리
    if (clientRef.current) {
      try {
        // STOMP 클라이언트 해제
        if (clientRef.current.active) {
          clientRef.current.deactivate();
        }
        // deactivate()가 내부적으로 disconnect와 forceDisconnect를 처리함
      } catch (error) {
        console.warn('클라이언트 강제 해제 중 오류:', error);
      }
      clientRef.current = null;
    }
    
    // 상태 초기화
    setClient(null);
    setConnected(false);
  }, []);

  // WebSocket 연결 설정 및 초기화 - 컴포넌트 마운트 시 자동으로 연결 시도
  useEffect(() => {
    // shouldConnect가 false면 아예 실행하지 않음
    if (!shouldConnect) {
      return;
    }

    // 중복 연결 방지
    if (isConnectingRef.current || connected || clientRef.current) {
      return;
    }

    const connect = async () => {
      // 로그인 상태 체크
      const isAuthenticated = await checkAuthStatus();
      if (!isAuthenticated) {
        // 연결 중단
        shouldReconnectRef.current = false;
        return;
      }

      if (!shouldReconnectRef.current || isManuallyDisconnectedRef.current) {
        return;
      }

      // 재연결 시도 횟수 체크
      if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        shouldReconnectRef.current = false;
        return;
      }

      isConnectingRef.current = true;
      
      // 동적 WebSocket URL 생성 - 개발/프로덕션 환경에 따라 적절한 URL 반환
      const getWebSocketUrl = () => {
        const currentHost = window.location.hostname;
        const protocol = window.location.protocol;
        
        return `${protocol}//${currentHost}:7070/chat`;
      };
      
      const websocketUrl = getWebSocketUrl();
      
      // STOMP 클라이언트 생성 및 설정
      const stompClient = new Client({
        webSocketFactory: () => {
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
        reconnectDelay: 5000,        // 재연결 지연 시간
        heartbeatIncoming: 4000,     // 서버로부터 하트비트 간격
        heartbeatOutgoing: 4000,     // 서버로 하트비트 간격
        
        // WebSocket 연결 종료 시 처리
        onWebSocketClose: async () => {
          setConnected(false);
          isConnectingRef.current = false;
          
          // 수동 해제인 경우 재연결하지 않음
          if (isManuallyDisconnectedRef.current || !shouldReconnectRef.current) {
            return;
          }
          
          // 재연결 시도 횟수 체크
          if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
            shouldReconnectRef.current = false;
            forceDisconnect();
            return;
          }
          
          // 재연결 전 인증 상태 확인
          const isAuthenticated = await checkAuthStatus();
          if (!isAuthenticated) {
            shouldReconnectRef.current = false;
            forceDisconnect();
            return;
          }
          
          // 재연결 시도
          reconnectAttemptsRef.current += 1;
          setTimeout(() => {
            if (!connected && !isConnectingRef.current && shouldReconnectRef.current) {
              connect();
            }
          }, 3000);
        },

        // WebSocket 에러 처리
        onWebSocketError: async (event) => {
          console.error('WebSocket 에러:', event);
          isConnectingRef.current = false;
          setConnected(false);
          
          // 인증 오류인 경우 재연결 중단
          const isAuthenticated = await checkAuthStatus();
          if (!isAuthenticated) {
            shouldReconnectRef.current = false;
            forceDisconnect();
          }
        }
      });

      // 연결 성공 시 처리
      stompClient.onConnect = (frame) => {
        isConnectingRef.current = false;
        setConnected(true);
        setClient(stompClient);
        clientRef.current = stompClient;
        reconnectAttemptsRef.current = 0; // 재연결 카운터 리셋
      };

      // STOMP 에러 처리
      stompClient.onStompError = async (frame) => {
        console.error('STOMP 에러:', frame.headers['message']);
        isConnectingRef.current = false;
        setConnected(false);
        
        // 인증 관련 에러인 경우 재연결 중단
        const errorMessage = frame.headers['message'] || '';
        if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
          shouldReconnectRef.current = false;
          forceDisconnect();
        }
      };

      // 연결 해제 시 처리
      stompClient.onDisconnect = () => {
        isConnectingRef.current = false;
        setConnected(false);
      };

      try {
        stompClient.activate();
      } catch (error) {
        console.error('STOMP 클라이언트 활성화 실패:', error);
        isConnectingRef.current = false;
        setConnected(false);
        
        // 활성화 실패 시에도 인증 상태 확인
        const isAuthenticated = await checkAuthStatus();
        if (!isAuthenticated) {
          shouldReconnectRef.current = false;
          forceDisconnect();
        }
      }
    };

    // 초기 연결 시 인증 상태 확인
    shouldReconnectRef.current = true;
    isManuallyDisconnectedRef.current = false;
    
    connect();

    // 컴포넌트 언마운트 시 정리 작업
    return () => {
      // 재연결 방지
      shouldReconnectRef.current = false;
      isManuallyDisconnectedRef.current = true;
      isConnectingRef.current = false;
      
      if (messageProcessingTimerRef.current) {
        clearTimeout(messageProcessingTimerRef.current);
      }
      processedMessagesRef.current.clear();
      
      if (clientRef.current) {
        try {
          // STOMP 클라이언트 정리
          if (clientRef.current.active) {
            clientRef.current.deactivate();
          }
          // forceDisconnect는 이미 deactivate()에 포함되어 있으므로 중복 호출 방지
        } catch (error) {
          console.warn('정리 중 오류:', error);
        }
        clientRef.current = null;
      }
      setClient(null);
      setConnected(false);
    };
  }, [checkAuthStatus, forceDisconnect, shouldConnect]);

  // 메시지 중복 처리 방지 함수 - 동일한 메시지 ID로 여러 번 처리되는 것을 방지
  const isMessageProcessed = useCallback((messageId) => {
    if (!messageId) return false;
    
    if (processedMessagesRef.current.has(messageId)) {
      return true;
    }
    
    processedMessagesRef.current.add(messageId);
    
    // 5분 후 메시지 ID 정리 (메모리 누수 방지)
    setTimeout(() => {
      processedMessagesRef.current.delete(messageId);
    }, 5 * 60 * 1000);
    
    return false;
  }, []);

  // 🔥 핵심 수정: 채팅방 구독 함수 - 첨부파일 업로드 완료 구독 추가 및 콜백 개선
  const subscribeToRoom = useCallback((room_idx, onMessageReceived, onReadReceived, onDeleteReceived, onAttachmentReceived) => {
    
    if (client && connected) {
      
      // 새 메시지 구독 - 실시간 이미지 메시지 처리 개선
      const messageSubscription = client.subscribe(`/topic/room/${room_idx}`, (message) => {
        try {
          const messageData = JSON.parse(message.body);
          
          // 중복 메시지 처리 방지
          const messageId = messageData.message_idx || `${messageData.sender_idx}_${messageData.timestamp}`;
          if (isMessageProcessed(messageId)) {
            return;
          }
          
          // 실시간 이미지 메시지 로깅
          if (messageData.message_type === 'image') {
            console.log(`[WebSocket] 실시간 이미지 메시지 수신:`, messageData);
            console.log(`- message_idx: ${messageData.message_idx}`);
            console.log(`- attach_idx: ${messageData.attach_idx}`);
            console.log(`- sender_idx: ${messageData.sender_idx}`);
          }
          
          onMessageReceived(messageData);
        } catch (error) {
          console.error('메시지 파싱 오류:', error);
        }
      });
      
      // 읽음 확인 구독
      const readSubscription = client.subscribe(`/topic/room/${room_idx}/read`, (message) => {
        try {
          const readData = JSON.parse(message.body);
          onReadReceived && onReadReceived(readData);
        } catch (error) {
          console.error('읽음 확인 파싱 오류:', error);
        }
      });
      
      // 삭제 알림 구독
      const deleteSubscription = client.subscribe(`/topic/room/${room_idx}/delete`, (message) => {
        try {
          const deleteData = JSON.parse(message.body);
          onDeleteReceived && onDeleteReceived(deleteData);
        } catch (error) {
          console.error('삭제 알림 파싱 오류:', error);
        }
      });
      
      // 🔥 핵심 수정: 첨부파일 업로드 완료 알림 구독 강화
      const attachmentSubscription = client.subscribe(`/topic/room/${room_idx}/attachment`, (message) => {
        try {
          const attachmentData = JSON.parse(message.body);
          console.log(`[WebSocket] 첨부파일 업로드 완료 알림 수신:`, attachmentData);
          
          if (attachmentData.type === 'attachment_uploaded') {
            // 첨부파일 업로드 완료 시 콜백 호출
            console.log(`[WebSocket] 첨부파일 업로드 완료: message_idx ${attachmentData.message_idx}`);
            
            // 🔥 새로 추가: 첨부파일 업로드 완료 콜백 호출
            if (onAttachmentReceived) {
              onAttachmentReceived(attachmentData);
            }
          }
        } catch (error) {
          console.error('첨부파일 알림 파싱 오류:', error);
        }
      });
      
      // 구독 해제 함수 반환
      return () => {
        try {
          messageSubscription.unsubscribe();
          readSubscription.unsubscribe();
          deleteSubscription.unsubscribe();
          attachmentSubscription.unsubscribe(); // 첨부파일 구독 해제 추가
        } catch (error) {
          console.warn('구독 해제 중 오류:', error);
        }
      };
    } else {
      console.warn('WebSocket 연결되지 않음 - 구독 불가');
      return null;
    }
  }, [client, connected, isMessageProcessed]);

  // 매칭 상태 업데이트 구독 함수 - 특정 트레이너의 매칭 상태 변경을 실시간으로 받음
  const subscribeToMatchingUpdates = useCallback((trainer_idx, onMatchingUpdate) => {
    if (client && connected) {
      
      // 중복 매칭 업데이트 방지를 위한 Set
      const processedMatchingUpdates = new Set();
      
      const processMatchingUpdate = (matchingUpdate) => {
        // 중복 업데이트 방지
        const updateId = `${matchingUpdate.matching_idx}_${matchingUpdate.status_type}_${matchingUpdate.timestamp}`;
        if (processedMatchingUpdates.has(updateId)) {
          return;
        }
        
        processedMatchingUpdates.add(updateId);
        
        // 30초 후 메모리 정리
        setTimeout(() => {
          processedMatchingUpdates.delete(updateId);
        }, 30000);
        
        onMatchingUpdate && onMatchingUpdate(matchingUpdate);
      };
      
      // 트레이너별 매칭 상태 업데이트 구독
      const matchingSubscription = client.subscribe(`/topic/trainer/${trainer_idx}/matching`, (message) => {
        try {
          const matchingUpdate = JSON.parse(message.body);
          processMatchingUpdate(matchingUpdate);
        } catch (error) {
          console.error('매칭 상태 업데이트 파싱 오류:', error);
        }
      });
      
      // 트레이너의 모든 채팅방에 대한 매칭 상태 브로드캐스트 구독
      const roomsMatchingSubscription = client.subscribe(`/topic/trainer/${trainer_idx}/rooms/matching`, (message) => {
        try {
          const matchingUpdate = JSON.parse(message.body);
          processMatchingUpdate(matchingUpdate);
        } catch (error) {
          console.error('채팅방 매칭 상태 업데이트 파싱 오류:', error);
        }
      });
      
      // 구독 해제 함수 반환
      return () => {
        try {
          processedMatchingUpdates.clear();
          matchingSubscription.unsubscribe();
          roomsMatchingSubscription.unsubscribe();
        } catch (error) {
          console.warn('매칭 구독 해제 중 오류:', error);
        }
      };
    } else {
      console.warn('WebSocket 연결되지 않음 - 매칭 구독 불가');
      return null;
    }
  }, [client, connected]);

  // 메시지 전송 함수 - 텍스트, 이미지, 매칭 요청 등 다양한 타입의 메시지 전송 지원
  const sendMessage = useCallback((messageData) => {
    
    const sessionMemberIdx = sessionStorage.getItem('chat_member_idx');
    const memberIdx = sessionMemberIdx ? parseInt(sessionMemberIdx) : null;
    
    if (client && connected && memberIdx && !isConnectingRef.current) {
      const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 중복 전송 방지
      if (isMessageProcessed(uniqueId)) {
        console.warn('중복 메시지 전송 방지:', uniqueId);
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

      // 매칭 데이터 처리 (DB 저장 방식)
      if (messageData.matching_data && typeof messageData.matching_data === 'object') {
        
        // 매칭 데이터 유효성 검증 및 타입 안전성 보장
        const validatedMatchingData = {};
        
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
              console.error(`매칭 데이터 필수 필드 변환 실패: ${field} = ${value}`);
              validationFailed = true;
              break;
            }
          } else {
            console.error(`매칭 데이터 필수 필드 누락: ${field}`);
            validationFailed = true;
            break;
          }
        }
        
        if (validationFailed) {
          console.warn('매칭 데이터 전송 중단 - 검증 실패');
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
        
        // WebSocket 메시지에 매칭 데이터 추가
        messageWithSender.matching_data = validatedMatchingData;
      }
      
      // 이미지 메시지 전송 로깅
      if (messageData.message_type === 'image') {
        console.log(`[WebSocket] 이미지 메시지 전송:`, messageWithSender);
      }
      
      try {
        client.publish({
          destination: '/app/chat.send',
          body: JSON.stringify(messageWithSender)
        });
      } catch (error) {
        console.error('메시지 전송 실패:', error);
      }
    } else {
      console.warn('WebSocket 연결되지 않음 또는 연결 중이거나 세션스토리지에 member_idx 없음');
    }
  }, [client, connected, isMessageProcessed]);

  // 개별 메시지 읽음 처리 함수 - 특정 메시지를 읽음 상태로 표시
  const markAsRead = useCallback((message_idx, room_idx) => {
    
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
      
      try {
        client.publish({
          destination: '/app/chat.read',
          body: JSON.stringify(readData)
        });
      } catch (error) {
        console.error('읽음 처리 실패:', error);
      }
      
    } else {
      console.warn('WebSocket 연결되지 않음 - 읽음 처리 불가');
    }
  }, [client, connected]);

  //메시지 삭제 알림 전송 함수 - 다른 사용자에게 메시지 삭제를 알림
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
      
      try {
        client.publish({
          destination: '/app/chat.delete',
          body: JSON.stringify(deleteNotification)
        });
      } catch (error) {
        console.error('삭제 알림 전송 실패:', error);
      }
    } else {
      console.warn('WebSocket 연결되지 않음 - 삭제 알림 불가');
    }
  }, [client, connected]);

  //매칭 상태 브로드캐스트 함수 - 매칭 수락/거절 상태를 실시간으로 브로드캐스트
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
      
      try {
        client.publish({
          destination: '/app/matching.status',
          body: JSON.stringify(matchingStatusUpdate)
        });
      } catch (error) {
        console.error('매칭 상태 브로드캐스트 실패:', error);
      }
    } else {
      console.warn('WebSocket 연결되지 않음 - 매칭 상태 브로드캐스트 불가');
    }
  }, [client, connected]);

  // 타이머 정리 (메모리 누수 방지)
  useEffect(() => {
    return () => {
      if (messageProcessingTimerRef.current) {
        clearTimeout(messageProcessingTimerRef.current);
      }
    };
  }, []);

  // 수동 연결 해제 함수(외부에서 호출 가능)
  const disconnect = useCallback(() => {
    forceDisconnect();
  }, [forceDisconnect]);

  // WebSocket 연결이 비활성화된 경우 기본값 반환
  if (!shouldConnect) {
    return {
      connected: false,
      subscribeToRoom: () => null,
      subscribeToMatchingUpdates: () => null,
      sendMessage: () => {},
      markAsRead: () => {},
      sendDeleteNotification: () => {},
      broadcastMatchingStatus: () => {},
      disconnect: () => {}
    };
  }

  // 훅에서 제공하는 API 반환
  return {
    connected,                    // WebSocket 연결 상태
    subscribeToRoom,             // 채팅방 구독
    subscribeToMatchingUpdates,  // 매칭 상태 구독
    sendMessage,                 // 메시지 전송
    markAsRead,                  // 읽음 처리
    sendDeleteNotification,      // 삭제 알림
    broadcastMatchingStatus,     // 매칭 상태 브로드캐스트
    disconnect                   // 수동 연결 해제 함수
  };
};