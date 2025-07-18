import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useWebSocket } from '../../hooks/UseWebSocket';
import chatApi from '../../utils/ChatApi';
import axios from 'axios';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import IsLoading3 from '../../components/IsLoading3';
import ChatRoomHeader from './ChatRoomHeader';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--bg-primary);
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: var(--bg-primary);
  
  /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border-medium);
    border-radius: 3px;
  }
`;

// 개별 채팅방 화면 컴포넌트
const ChatRoom = () => {
  // React Router hooks
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Redux에서 현재 사용자 정보 가져오기
  const { user } = useSelector(state => state.user);

  // 컴포넌트 상태 관리
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomData, setRoomData] = useState(null);
  const [attachments, setAttachments] = useState({});
  const [currentMemberIdx, setCurrentMemberIdx] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [initialUnreadMessages, setInitialUnreadMessages] = useState([]);
  
  // 스크롤 관련 상태 관리 개선
  const [hasPerformedInitialScroll, setHasPerformedInitialScroll] = useState(false);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);

  // ref 관리
  const initialReadDone = useRef(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const scrollAdjustmentTimerRef = useRef(null);

  // WebSocket 연결 및 기능들
  const { connected, subscribeToRoom, sendMessage, markAsRead } = useWebSocket();

  // 읽지 않은 메시지 구분선을 화면 상단에 정확히 위치시키는 함수
  const scrollToUnreadSeparatorTop = useCallback(async (targetMessageIdx, retryCount = 0) => {
    const maxRetries = 10;
    const unreadSeparator = document.querySelector(`#message-${targetMessageIdx}`);
    const container = messagesContainerRef.current;

    if (!unreadSeparator || !container) {
      if (retryCount < maxRetries) {
        console.log(`⏳ 읽지 않은 메시지 구분선 DOM 대기 중... 재시도 ${retryCount + 1}/${maxRetries}`);
        setTimeout(() => scrollToUnreadSeparatorTop(targetMessageIdx, retryCount + 1), 100);
        return false;
      } else {
        console.warn('❌ 읽지 않은 메시지 구분선을 찾을 수 없음 - 맨 아래로 스크롤');
        scrollToBottom(false);
        return false;
      }
    }

    try {
      // 🔧 1단계: 기본 스크롤 (이미지 로딩 대기 없이)
      const performBasicScroll = () => {
        // 고정 헤더 높이 직접 계산 (더 정확한 방법)
        const getActualHeaderHeight = () => {
          let totalHeight = 0;
          
          // Header.jsx 찾기
          const mainHeader = document.querySelector('header');
          if (mainHeader) {
            totalHeight += mainHeader.offsetHeight;
            console.log('🔧 Header.jsx 높이:', mainHeader.offsetHeight);
          }
          
          // ChatRoomHeader.jsx 찾기 (현재 컨테이너의 형제 요소)
          const chatHeader = container.parentElement?.querySelector('[class*="Header"]') || 
                            container.previousElementSibling;
          if (chatHeader && chatHeader !== mainHeader) {
            totalHeight += chatHeader.offsetHeight;
            console.log('🔧 ChatRoomHeader.jsx 높이:', chatHeader.offsetHeight);
          }
          
          // 안전 여백 추가
          const safeMargin = 30;
          totalHeight += safeMargin;
          
          console.log('🔧 총 헤더 높이 (여백 포함):', totalHeight);
          return totalHeight;
        };

        const headerHeight = getActualHeaderHeight();
        const containerRect = container.getBoundingClientRect();
        const separatorRect = unreadSeparator.getBoundingClientRect();
        
        // 🎯 핵심: 정확한 스크롤 위치 계산
        const targetScrollTop = container.scrollTop + 
                              (separatorRect.top - containerRect.top) - 
                              headerHeight;

        const finalScrollTop = Math.max(0, targetScrollTop);

        console.log('🎯 1단계 스크롤 계산:', {
          currentScrollTop: container.scrollTop,
          separatorTop: separatorRect.top,
          containerTop: containerRect.top,
          headerHeight,
          targetScrollTop,
          finalScrollTop
        });

        // 즉시 스크롤 (smooth 없이)
        container.scrollTop = finalScrollTop;
        
        return finalScrollTop;
      };

      // 🔧 2단계: 이미지 로딩 완료 후 정밀 조정
      const performPreciseAdjustment = async () => {
        // 이미지 로딩 대기
        await waitForImagesLoad(container);
        
        // DOM 변화 대기
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        // 다시 정확한 위치 계산
        const headerHeight = container.parentElement?.querySelector('header')?.offsetHeight || 0;
        const chatHeaderHeight = container.previousElementSibling?.offsetHeight || 0;
        const totalHeaderHeight = headerHeight + chatHeaderHeight + 30; // 30px 안전 여백
        
        const containerRect = container.getBoundingClientRect();
        const separatorRect = unreadSeparator.getBoundingClientRect();
        
        const precisTargetScrollTop = container.scrollTop + 
                                    (separatorRect.top - containerRect.top) - 
                                    totalHeaderHeight;

        const preciseFinalScrollTop = Math.max(0, precisTargetScrollTop);

        console.log('🎯 2단계 정밀 조정:', {
          currentScrollTop: container.scrollTop,
          preciseFinalScrollTop,
          difference: Math.abs(container.scrollTop - preciseFinalScrollTop)
        });

        // 차이가 10px 이상일 때만 조정
        if (Math.abs(container.scrollTop - preciseFinalScrollTop) > 10) {
          container.scrollTop = preciseFinalScrollTop;
          console.log('🔧 정밀 조정 적용됨');
        }
      };

      // 🔧 3단계: 최종 검증 및 조정
      const performFinalValidation = () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const containerRect = container.getBoundingClientRect();
            const separatorRect = unreadSeparator.getBoundingClientRect();
            
            // 구분선이 화면 상단에서 30px~150px 범위에 있는지 확인
            const separatorPositionFromTop = separatorRect.top - containerRect.top;
            const isInGoodPosition = separatorPositionFromTop >= 30 && separatorPositionFromTop <= 150;
            
            console.log('🔧 최종 검증:', {
              separatorPositionFromTop,
              isInGoodPosition
            });
            
            if (!isInGoodPosition) {
              // 마지막 수정 시도
              const correctionOffset = separatorPositionFromTop > 150 ? -50 : 50;
              container.scrollTop += correctionOffset;
              console.log('🔧 최종 보정 적용:', correctionOffset);
            }
            
            resolve();
          }, 150); // 150ms 후 최종 검증
        });
      };

      // 🎨 시각적 효과
      const addVisualEffect = () => {
        unreadSeparator.style.backgroundColor = 'rgba(74, 144, 226, 0.15)';
        unreadSeparator.style.transition = 'background-color 0.3s ease';
        setTimeout(() => {
          unreadSeparator.style.backgroundColor = '';
        }, 2000);
      };

      // 단계별 실행
      console.log('🚀 1단계: 기본 스크롤 실행');
      performBasicScroll();
      
      console.log('🚀 2단계: 정밀 조정 실행');
      setTimeout(async () => {
        await performPreciseAdjustment();
        
        console.log('🚀 3단계: 최종 검증 실행');
        await performFinalValidation();
        
        addVisualEffect();
        console.log('✅ 읽지 않은 메시지 구분선 위치 조정 완료');
      }, 100);

      return true;

    } catch (error) {
      console.error('❌ 스크롤 위치 계산 오류:', error);
      scrollToBottom(false);
      return false;
    }
  }, []);

  // 정확한 스크롤 위치 계산 함수 (미세 조정용)
  const calculateAccurateScrollPosition = (element, container) => {
    const elementRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    // 실제 헤더 높이 계산
    const headerHeight = document.querySelector('header')?.offsetHeight || 0;
    const chatHeaderHeight = container.previousElementSibling?.offsetHeight || 0;
    const totalHeaderHeight = headerHeight + chatHeaderHeight + 30;

    const targetScrollTop = container.scrollTop + 
                          (elementRect.top - containerRect.top) - 
                          totalHeaderHeight;

    return Math.max(0, targetScrollTop);
  };

  // 정 요소들의 높이 계산
  const getFixedElementsHeight = () => {
    const selectors = [
      'header',
      '.chat-header', 
      '.chat-room-header',
      '.fixed-toolbar',
      '[data-sticky="true"]'
    ];
    
    return selectors.reduce((total, selector) => {
      const element = document.querySelector(selector);
      const height = element ? element.offsetHeight : 0;
      console.log(`🔧 고정 요소 "${selector}": ${height}px`);
      return total + height;
    }, 0);
  };

  // 이미지 로딩 완료 대기 함수
  const waitForImagesLoad = (container) => {
    return new Promise((resolve) => {
      const images = container.querySelectorAll('img[src]');
      console.log(`📷 이미지 로딩 대기: ${images.length}개`);
      
      if (images.length === 0) {
        resolve();
        return;
      }

      let loadedCount = 0;
      const checkComplete = () => {
        loadedCount++;
        console.log(`📷 이미지 로딩 진행: ${loadedCount}/${images.length}`);
        if (loadedCount === images.length) {
          console.log('✅ 모든 이미지 로딩 완료');
          // 추가 여유 시간
          setTimeout(resolve, 50);
        }
      };

      images.forEach(img => {
        if (img.complete && img.naturalHeight > 0) {
          checkComplete();
        } else {
          img.addEventListener('load', checkComplete);
          img.addEventListener('error', checkComplete);
        }
      });
    });
  };

  // 채팅용 member_idx 조회 및 세션스토리지 저장
  const getMemberIdxForChat = async () => {
    try {
      const response = await axios.get('/api/chat/member-info', {
        withCredentials: true
      });

      if (response.data.success) {
        const memberIdx = response.data.member_idx.toString();
        sessionStorage.setItem('chat_member_idx', memberIdx);
        setCurrentMemberIdx(parseInt(memberIdx));
        return parseInt(memberIdx);
      } else {
        if (response.data.message.includes('로그인')) {
          navigate('/login');
        }
        return null;
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      }
      return null;
    }
  };

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    const initializeChatRoom = async () => {
      if (!user || !user.isLogin) {
        navigate('/login');
        return;
      }

      // 상태 초기화
      setIsInitialLoad(true);
      setHasPerformedInitialScroll(false);
      setShouldScrollToBottom(false);
      setInitialUnreadMessages([]);
      
      console.log('🔄 채팅방 초기화');

      const memberIdx = await getMemberIdxForChat();
      if (!memberIdx) return;

      if (location.state?.roomData) {
        setRoomData(location.state.roomData);
      }

      await loadMessages(memberIdx);
    };

    initializeChatRoom();

    return () => {
      sessionStorage.removeItem('chat_member_idx');
      if (scrollAdjustmentTimerRef.current) {
        clearTimeout(scrollAdjustmentTimerRef.current);
      }
    };
  }, [roomId, user, navigate, location.state]);

  // 메시지 로드 함수 - 읽지 않은 메시지 분석 개선
  const loadMessages = async (memberIdx = null) => {
    try {
      setLoading(true);

      const messageList = await chatApi.readMessageList(parseInt(roomId));
      setMessages(messageList);

      // 읽지 않은 메시지 분석 개선
      if (memberIdx) {
        const unreadMessages = messageList.filter(msg => 
          msg.sender_idx !== memberIdx && !msg.message_readdate
        );
        setInitialUnreadMessages(unreadMessages);

        console.log('📊 메시지 분석 결과:', {
          totalMessages: messageList.length,
          unreadMessages: unreadMessages.length,
          currentUser: memberIdx
        });

        if (unreadMessages.length === 0) {
          console.log('✅ 읽지 않은 메시지 없음 - 맨 아래 스크롤 예정');
          setShouldScrollToBottom(true);
        } else {
          console.log('📍 읽지 않은 메시지', unreadMessages.length, '개 발견 - 첫 번째 읽지 않은 메시지로 스크롤 예정');
          
          // 첫 번째(가장 오래된) 읽지 않은 메시지를 찾아서 로깅
          const oldestUnreadMessage = unreadMessages.reduce((oldest, current) => {
            const oldestTime = new Date(oldest.message_senddate).getTime();
            const currentTime = new Date(current.message_senddate).getTime();
            return currentTime < oldestTime ? current : oldest;
          });
          
          console.log('🎯 가장 오래된 읽지 않은 메시지:', {
            messageIdx: oldestUnreadMessage.message_idx,
            content: oldestUnreadMessage.message_content,
            sendDate: oldestUnreadMessage.message_senddate
          });
          setShouldScrollToBottom(false);
        }
      }

      // 첨부파일은 백그라운드에서 비동기 로드 (스크롤 차단하지 않음)
      const imageMessages = messageList.filter(msg => msg.message_type === 'image');
      if (imageMessages.length > 0) {
        console.log('📷 백그라운드에서 첨부파일 로드 시작...', imageMessages.length, '개');
        loadAttachmentsInBackground(imageMessages);
      }

    } catch (error) {
      console.error('메시지 로드 실패:', error);
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

  // 백그라운드에서 첨부파일 로드 (스크롤 차단하지 않음)
  const loadAttachmentsInBackground = async (imageMessages) => {
    // 비동기로 첨부파일 로드 (await 사용하지 않음)
    imageMessages.forEach(async (message, index) => {
      if (message.attach_idx && message.attach_idx > 0) {
        try {
          const attachment = await chatApi.readFile(message.message_idx);
          
          // 실시간으로 첨부파일 추가
          setAttachments(prev => ({
            ...prev,
            [message.message_idx]: attachment
          }));
          
          console.log(`📷 백그라운드 첨부파일 로드 완료: ${index + 1}/${imageMessages.length} (message_idx: ${message.message_idx})`);
          
          // 각 이미지 로드 완료 시 스크롤 위치 미세 조정
          if (!isInitialLoad) {
            adjustScrollPosition();
          }
          
        } catch (error) {
          console.error(`첨부파일 로드 실패 (message_idx: ${message.message_idx}):`, error);
        }
      }
    });
  };

  // 메시지 로드 완료 후 즉시 스크롤 실행 (이미지 대기하지 않음)
  useEffect(() => {
    if (messages.length > 0 && isInitialLoad && currentMemberIdx && !hasPerformedInitialScroll) {
      console.log('📍 즉시 스크롤 실행 - 이미지 로딩 대기하지 않음');
      
      // DOM 렌더링 완료 대기만 최소한으로
      setTimeout(() => {
        performInitialScroll();
      }, 150); // 100ms → 150ms로 증가
    }
  }, [messages, currentMemberIdx, isInitialLoad, hasPerformedInitialScroll]);

  // 초기 스크롤 실행 - 읽지 않은 메시지를 화면 상단에 위치
  const performInitialScroll = () => {
    console.log('🎯 초기 스크롤 실행:', {
      shouldScrollToBottom,
      unreadCount: initialUnreadMessages.length
    });

    if (shouldScrollToBottom) {
      console.log('📍 맨 아래로 스크롤 (읽지 않은 메시지 없음)');
      scrollToBottom(false);
    } else if (initialUnreadMessages.length > 0) {
      // 가장 오래된 읽지 않은 메시지를 화면 상단에 위치시키기
      const oldestUnreadMessage = initialUnreadMessages.reduce((oldest, current) => {
        const oldestTime = new Date(oldest.message_senddate).getTime();
        const currentTime = new Date(current.message_senddate).getTime();
        return currentTime < oldestTime ? current : oldest;
      });
      
      console.log('🎯 가장 오래된 읽지 않은 메시지를 화면 상단에 위치:', oldestUnreadMessage.message_idx);
      
      // 새로운 스크롤 함수 사용
      scrollToUnreadSeparatorTop(oldestUnreadMessage.message_idx);
    } else {
      console.log('📍 기본: 맨 아래로 스크롤');
      scrollToBottom(false);
    }

    setHasPerformedInitialScroll(true);
    
    // 스크롤 완료 후 읽음 처리
    setTimeout(() => {
      setIsInitialLoad(false);
      performInitialReadMark();
    }, 500); // 300ms → 500ms로 증가
  };

  // 초기 읽음 처리
  const performInitialReadMark = () => {
    if (connected && currentMemberIdx && messages.length > 0 && !initialReadDone.current) {
      initialReadDone.current = true;
      console.log('📖 초기 읽음 처리 시작');

      messages.forEach(msg => {
        if (msg.receiver_idx === currentMemberIdx && !msg.message_readdate) {
          markAsRead(msg.message_idx, parseInt(roomId, 10));
        }
      });
      
      console.log('✅ 초기 읽음 처리 완료');
    }
  };

  // WebSocket 구독 설정
  useEffect(() => {
    if (connected && roomId && currentMemberIdx) {
      const unsubscribe = subscribeToRoom(
        parseInt(roomId),
        // 새 메시지 수신 콜백
        async (newMessage) => {
          setMessages(prev => {
            const existingMessage = prev.find(msg => msg.message_idx === newMessage.message_idx);
            if (existingMessage) return prev;
            return [...prev, newMessage];
          });

          // 새 메시지 수신 시 맨 아래로 스크롤 (조건 없이)
          console.log('📨 새 메시지 수신 - 맨 아래로 스크롤');
          setTimeout(() => {
            scrollToBottom(true);
          }, 100);

          // 이미지 메시지인 경우 첨부파일 정보도 로드
          if (newMessage.message_type === 'image' && newMessage.attach_idx && newMessage.attach_idx > 0) {
            setTimeout(async () => {
              try {
                const attachment = await chatApi.readFile(newMessage.message_idx);
                setAttachments(prev => ({
                  ...prev,
                  [newMessage.message_idx]: attachment
                }));
                
                // 🔧 첨부파일 로드 후 스크롤 재조정
                setTimeout(() => {
                  adjustScrollPosition();
                }, 100);
                
              } catch (error) {
                console.error(`실시간 메시지 ${newMessage.message_idx} 첨부파일 로드 실패:`, error);
              }
            }, 1000);
          }

          // 받은 메시지인 경우 자동으로 읽음 처리
          if (newMessage.receiver_idx === currentMemberIdx) {
            setTimeout(() => {
              markAsRead(newMessage.message_idx, parseInt(roomId));
            }, 100);
          }
        },
        // 읽음 확인 수신 콜백
        (readData) => {
          setMessages(prev => prev.map(msg => {
            if (msg.message_idx === readData.message_idx) {
              return { ...msg, message_readdate: new Date().toISOString() };
            }
            return msg;
          }));
        }
      );

      return unsubscribe;
    }
  }, [connected, roomId, subscribeToRoom, markAsRead, currentMemberIdx]);

  // 특정 메시지로 스크롤 함수 (중앙 위치) - 검색용
  const scrollToMessage = useCallback((messageIdx, retryCount = 0) => {
    const maxRetries = 5;
    const messageElement = document.getElementById(`message-${messageIdx}`);
    
    if (messageElement && messagesContainerRef.current) {
      const containerRect = messagesContainerRef.current.getBoundingClientRect();
      const messageRect = messageElement.getBoundingClientRect();
      
      // 검색 시에는 중앙 위치로 스크롤 (기존 로직 유지)
      const scrollTop = messagesContainerRef.current.scrollTop + 
                       messageRect.top - containerRect.top - 
                       containerRect.height / 2 + messageRect.height / 2;
      
      messagesContainerRef.current.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });

      // 메시지 하이라이트 효과
      messageElement.style.backgroundColor = 'rgba(74, 144, 226, 0.2)';
      setTimeout(() => {
        messageElement.style.backgroundColor = '';
      }, 2000);
      
      console.log('✅ 메시지로 스크롤 완료 (중앙 위치):', messageIdx);
      return true;
    } else if (retryCount < maxRetries) {
      console.log(`⏳ 메시지 DOM 대기 중... 재시도 ${retryCount + 1}/${maxRetries}`);
      setTimeout(() => scrollToMessage(messageIdx, retryCount + 1), 100);
      return false;
    } else {
      console.warn('❌ 메시지 요소를 찾을 수 없음 - 맨 아래로 스크롤:', messageIdx);
      scrollToBottom(false);
      return false;
    }
  }, []);

  // 맨 아래로 스크롤 함수 (재시도 로직 포함)
  const scrollToBottom = useCallback((smooth = true, retryCount = 0) => {
    const maxRetries = 5;
    
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end'
      });
      console.log('✅ 맨 아래로 스크롤 완료');
      return true;
    } else if (retryCount < maxRetries) {
      console.log(`⏳ 스크롤 대상 DOM 대기 중... 재시도 ${retryCount + 1}/${maxRetries}`);
      setTimeout(() => scrollToBottom(smooth, retryCount + 1), 100);
      return false;
    } else {
      console.warn('❌ 스크롤 대상을 찾을 수 없음');
      return false;
    }
  }, []);

  // 스크롤 위치 미세 조정 (이미지 로드 완료 후)
  const adjustScrollPosition = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 150; // 150px 여유
      
      // 맨 아래 근처에 있으면 맨 아래로 조정
      if (isNearBottom) {
        console.log('🔧 스크롤 위치 미세 조정 - 맨 아래로');
        scrollToBottom(false);
      }
    }
  }, [scrollToBottom]);

  // 이미지 로딩 완료 핸들러 (스크롤 조정만)
  const handleImageLoad = useCallback((messageIdx) => {
    console.log('📷 이미지 로딩 완료:', messageIdx);
    
    // 로딩 완료 후 스크롤 위치 조정
    setTimeout(() => {
      adjustScrollPosition();
    }, 50);
  }, [adjustScrollPosition]);

  // 검색 결과 처리 함수
  const handleSearchResults = useCallback((results) => {
    setSearchResults(results);
    console.log('🔍 검색 결과 업데이트:', results.length, '개');
  }, []);

  // 결과에서 특정 메시지로 이동 (중앙 위치 사용)
  const handleScrollToSearchResult = useCallback((messageIdx) => {
    console.log('🔍 검색 결과로 스크롤 이동 (중앙 위치):', messageIdx);
    scrollToMessage(messageIdx); // 검색 시에는 중앙 위치로 스크롤
  }, [scrollToMessage]);

  // 메시지 전송 핸들러 - 무조건 맨 아래로 스크롤
  const handleSendMessage = async (messageContent, messageType = 'text', file = null) => {
    if (!connected || !roomId || !currentMemberIdx) {
      console.warn('WebSocket 연결이 되어있지 않거나 채팅방 ID가 없습니다.');
      return;
    }

    const otherMemberIdx = roomData?.trainer_idx === currentMemberIdx
      ? roomData?.user_idx
      : roomData?.trainer_idx;

    const messageData = {
      room_idx: parseInt(roomId),
      receiver_idx: otherMemberIdx,
      message_content: messageContent,
      message_type: messageType
    };

    sendMessage(messageData);

    // 메시지 전송 즉시 맨 아래로 스크롤 (조건 없이)
    console.log('📤 메시지 전송 - 즉시 맨 아래로 스크롤');
    setTimeout(() => {
      scrollToBottom(true);
    }, 50);

    // 파일 업로드 처리
    if (file && messageType === 'image') {
      console.log('📷 이미지 파일 업로드 시작');
      
      setTimeout(async () => {
        try {
          const messageList = await chatApi.readMessageList(parseInt(roomId));
          const latestMessage = messageList[messageList.length - 1];

          if (latestMessage && latestMessage.sender_idx === currentMemberIdx) {
            const uploadResult = await chatApi.uploadFile(file, latestMessage.message_idx);
            setAttachments(prev => ({
              ...prev,
              [latestMessage.message_idx]: {
                attach_idx: uploadResult.attachIdx,
                original_filename: uploadResult.originalFilename,
                cloudinary_url: uploadResult.cloudinaryUrl,
                file_size_bytes: uploadResult.fileSize,
                mime_type: uploadResult.mimeType
              }
            }));
            
            // 파일 업로드 완료 후 스크롤 재조정
            console.log('📷 이미지 업로드 완료 - 스크롤 재조정');
            setTimeout(() => {
              scrollToBottom(false);
            }, 200);
          }
        } catch (error) {
          console.error('파일 업로드 실패:', error);
          alert('파일 업로드에 실패했습니다.');
        }
      }, 500);
    }
  };

  // 채팅방 표시 이름 생성
  const getRoomDisplayName = () => {
    if (roomData && currentMemberIdx) {
      if (roomData.trainer_idx === currentMemberIdx) {
        const userName = roomData.user_name || '회원';
        return `${userName}님과의 상담`;
      } else {
        const trainerName = roomData.trainer_name || '트레이너';
        return `${trainerName}님과의 상담`;
      }
    }

    if (roomData?.room_name) {
      const nameMatch = roomData.room_name.match(/^(.+)님과의 상담$/);
      if (nameMatch) {
        if (roomData.trainer_idx === currentMemberIdx) {
          return `회원님과의 상담`;
        } else {
          return roomData.room_name;
        }
      }
      return roomData.room_name;
    }

    if (location.state?.trainerInfo?.member_name) {
      const trainerName = location.state.trainerInfo.member_name;
      if (roomData?.trainer_idx === currentMemberIdx) {
        return `회원님과의 상담`;
      } else {
        return `${trainerName}님과의 상담`;
      }
    }

    if (roomData?.trainer_idx === currentMemberIdx) {
      return `회원님과의 상담`;
    } else {
      return `트레이너님과의 상담`;
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
        <ChatRoomHeader 
          roomDisplayName="채팅방" 
          onSearchResults={() => {}} 
          onScrollToSearchResult={() => {}}
          messages={[]}
        />
        <IsLoading3 />
      </Container>
    );
  }

  return (
    <Container>
      <ChatRoomHeader 
        roomDisplayName={getRoomDisplayName()} 
        onSearchResults={handleSearchResults} 
        onScrollToSearchResult={handleScrollToSearchResult}
        messages={messages}
      />

      <MessagesContainer ref={messagesContainerRef}>
        <MessageList
          messages={messages}
          currentMemberIdx={currentMemberIdx}
          attachments={attachments}
          roomData={roomData}
          onImageLoad={handleImageLoad}
        />
        <div ref={messagesEndRef} />
      </MessagesContainer>

      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={!connected}
      />
    </Container>
  );
};

export default ChatRoom;