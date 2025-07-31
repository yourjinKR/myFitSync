import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useWebSocket } from '../../hooks/UseWebSocket';
import chatApi from '../../utils/ChatApi';
import axios from 'axios';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ChatLoading from '../../components/ChatLoading';
import ChatRoomHeader from './ChatRoomHeader';
import BarbellLoading from '../BarbellLoading';
import { maskEmail } from '../../utils/EmailMasking';

const Container = styled.div`
  position: fixed;
  top: 65px;
  left: 0;
  width: 100%;
  height: calc(100vh - 65px - 85px);
  max-width: 750px;
  margin: 0 auto;
  background-color: var(--bg-primary);
  display: flex;
  flex-direction: column;
  z-index: 10;
  
  @media (min-width: 751px) {
    left: 50%;
    transform: translateX(-50%);
  }
`;

const HeaderContainer = styled.div`
  flex-shrink: 0;
  position: relative;
  z-index: 20;
`;

const MessagesWrapper = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  background-color: var(--bg-primary);
  min-height: 0;
`;

const MessagesContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  padding: 20px;
  
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

const InputWrapper = styled.div`
  flex-shrink: 0;
  position: relative;
  z-index: 20;
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border-medium);
  width: 100%;
`;

const OldMessagesButton = styled.button`
  width: calc(100% - 40px);
  margin: 10px 20px;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-medium);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 1.4rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover:not(:disabled) {
    background: var(--bg-tertiary);
    border-color: var(--primary-blue);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(74, 144, 226, 0.2);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  &:focus {
    outline: 2px solid var(--primary-blue);
    outline-offset: 2px;
  }
`;

const OldMessagesText = styled.span`
  font-weight: 500;
`;

// 채팅방 메인 컴포넌트 - 실시간 메시지 송수신, 이미지 업로드, 매칭 시스템 등을 담당
const ChatRoom = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
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
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [hasPerformedInitialScroll, setHasPerformedInitialScroll] = useState(false);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  const [imageLoadingCount, setImageLoadingCount] = useState(0);
  const [totalImageCount, setTotalImageCount] = useState(0);

  // 지난 대화 관련 상태
  const [hasOldMessages, setHasOldMessages] = useState(false);
  const [isLoadingOldMessages, setIsLoadingOldMessages] = useState(false);
  const [allOldMessagesLoaded, setAllOldMessagesLoaded] = useState(false);
  const [roomEnterTime] = useState(new Date()); // 채팅방 접속 시간 고정

  // 매칭 상태 관리
  const [hasCompletedMatchingWithTrainer, setHasCompletedMatchingWithTrainer] = useState(false);
  const [isMatchingCheckComplete, setIsMatchingCheckComplete] = useState(true);
  const [isMatchingCheckLoading, setIsMatchingCheckLoading] = useState(false);

  // ref 관리
  const initialReadDone = useRef(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const scrollAdjustmentTimerRef = useRef(null);
  const lastScrollHeight = useRef(0);

  // WebSocket 연결 및 기능들
  const { connected, subscribeToRoom, sendMessage, markAsRead, sendDeleteNotification, subscribeToMatchingUpdates } = useWebSocket();

  // 최근 메시지 필터링 함수 - 채팅방 입장 시간을 기준으로 오래된 메시지와 최근 메시지를 구분
  const filterRecentMessages = useCallback((messageList, enterTime) => {
    const OLD_MESSAGE_THRESHOLD = 3 * 30 * 24 * 60 * 60 * 1000; // 3달
    
    const recentMessages = [];
    let hasOldMessagesFound = false;
    
    messageList.forEach(msg => {
      // 읽지 않은 메시지는 항상 포함
      if (!msg.message_readdate) {
        recentMessages.push(msg);
        return;
      }
      
      // 읽음 처리된 메시지는 시간 기준으로 필터링
      const readTime = new Date(msg.message_readdate);
      const timeDifference = enterTime.getTime() - readTime.getTime();
      
      if (timeDifference <= OLD_MESSAGE_THRESHOLD) {
        recentMessages.push(msg);
      } else {
        hasOldMessagesFound = true;
      }
    });
    
    return { recentMessages, hasOldMessages: hasOldMessagesFound };
  }, []);

  // roomData 생성 함수 - 성별 정보 포함
  const createTemporaryRoomData = useCallback(() => {
    if (!user || !roomId) return null;

    const trainerInfo = location.state?.trainerInfo;
    
    if (trainerInfo) {
      const isCurrentUserTrainer = user.member_type === 'trainer';
      
      if (isCurrentUserTrainer) {
        const roomData = {
          room_idx: parseInt(roomId),
          trainer_idx: user.member_idx,
          user_idx: null,
          trainer_name: user.member_name,
          trainer_image: user.member_image,
          trainer_gender: user.member_gender,
          trainer_email: user.member_email,
          user_name: '회원',
          user_image: null,
          user_gender: null,
          user_email: null
        };
        return roomData;
      } else {
        const roomData = {
          room_idx: parseInt(roomId),
          trainer_idx: trainerInfo.member_idx,
          user_idx: user.member_idx,
          trainer_name: trainerInfo.member_name,
          trainer_image: trainerInfo.member_image,
          trainer_gender: trainerInfo.member_gender,
          trainer_email: trainerInfo.member_email,
          user_name: user.member_name,
          user_image: user.member_image,
          user_gender: user.member_gender,
          user_email: user.member_email
        };
        return roomData;
      }
    }

    // fallback 데이터
    const isCurrentUserTrainer = user.member_type === 'trainer';
    
    const fallbackRoomData = {
      room_idx: parseInt(roomId),
      trainer_idx: isCurrentUserTrainer ? user.member_idx : null,
      user_idx: isCurrentUserTrainer ? null : user.member_idx,
      trainer_name: isCurrentUserTrainer ? user.member_name : '트레이너',
      trainer_image: isCurrentUserTrainer ? user.member_image : null,
      trainer_gender: isCurrentUserTrainer ? user.member_gender : null,
      trainer_email: isCurrentUserTrainer ? user.member_email : null,
      user_name: isCurrentUserTrainer ? '회원' : user.member_name,
      user_image: isCurrentUserTrainer ? null : user.member_image,
      user_gender: isCurrentUserTrainer ? null : user.member_gender,
      user_email: isCurrentUserTrainer ? null : user.member_email
    };
    
    return fallbackRoomData;
  }, [user, roomId, location.state]);

  // 매칭 상태 확인 함수
  const checkCompletedMatchingWithTrainer = useCallback(async () => {
    if (!roomData || !user?.member_idx || user?.member_type !== 'user') {
      setIsMatchingCheckComplete(true);
      return;
    }

    setIsMatchingCheckLoading(true);
    setIsMatchingCheckComplete(false);

    try {
      const currentTrainerIdx = roomData.trainer_idx;
      
      if (!currentTrainerIdx) {
        setHasCompletedMatchingWithTrainer(false);
        return;
      }
      
      const result = await chatApi.checkCompletedMatchingBetween(currentTrainerIdx, user.member_idx);
      
      if (result.success) {
        setHasCompletedMatchingWithTrainer(result.hasCompletedMatching);
      } else {
        setHasCompletedMatchingWithTrainer(false);
      }
      
    } catch (error) {
      setHasCompletedMatchingWithTrainer(false);
    } finally {
      setIsMatchingCheckComplete(true);
      setIsMatchingCheckLoading(false);
    }
  }, [roomData, user?.member_idx, user?.member_type]);

  // 읽지 않은 메시지 위치로 스크롤하는 함수
  const scrollToUnreadSeparatorTop = useCallback(async (targetMessageIdx, retryCount = 0) => {
    const maxRetries = 10;
    const unreadSeparator = document.querySelector(`#message-${targetMessageIdx}`);
    const container = messagesContainerRef.current;

    if (!unreadSeparator || !container) {
      if (retryCount < maxRetries) {
        setTimeout(() => scrollToUnreadSeparatorTop(targetMessageIdx, retryCount + 1), 100);
        return false;
      } else {
        scrollToBottom(false);
        return false;
      }
    }

    try {
      const performBasicScroll = () => {
        const getActualHeaderHeight = () => {
          let totalHeight = 0;
          
          const mainHeader = document.querySelector('header');
          if (mainHeader) {
            totalHeight += mainHeader.offsetHeight;
          }
          
          const chatHeader = container.parentElement?.querySelector('[class*="Header"]') || 
                            container.previousElementSibling;
          if (chatHeader && chatHeader !== mainHeader) {
            totalHeight += chatHeader.offsetHeight;
          }
          
          const safeMargin = 30;
          totalHeight += safeMargin;
          
          return totalHeight;
        };

        const headerHeight = getActualHeaderHeight();
        const containerRect = container.getBoundingClientRect();
        const separatorRect = unreadSeparator.getBoundingClientRect();
        
        const targetScrollTop = container.scrollTop + 
                              (separatorRect.top - containerRect.top) - 
                              headerHeight;

        const finalScrollTop = Math.max(0, targetScrollTop);
        container.scrollTop = finalScrollTop;
        lastScrollHeight.current = container.scrollHeight;
        
        return finalScrollTop;
      };

      const performPreciseAdjustment = async () => {
        await waitForImagesLoad(container);
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        const currentScrollHeight = container.scrollHeight;
        const heightDifference = currentScrollHeight - lastScrollHeight.current;
        
        if (Math.abs(heightDifference) > 50) {
          const headerHeight = container.parentElement?.querySelector('header')?.offsetHeight || 0;
          const chatHeaderHeight = container.previousElementSibling?.offsetHeight || 0;
          const totalHeaderHeight = headerHeight + chatHeaderHeight + 30;
          
          const containerRect = container.getBoundingClientRect();
          const separatorRect = unreadSeparator.getBoundingClientRect();
          
          const precisTargetScrollTop = container.scrollTop + 
                                      (separatorRect.top - containerRect.top) - 
                                      totalHeaderHeight;

          const preciseFinalScrollTop = Math.max(0, precisTargetScrollTop);
          container.scrollTop = preciseFinalScrollTop;
          
          lastScrollHeight.current = currentScrollHeight;
        }
      };

      const addVisualEffect = () => {
        unreadSeparator.style.backgroundColor = 'rgba(74, 144, 226, 0.15)';
        unreadSeparator.style.transition = 'background-color 0.3s ease';
        setTimeout(() => {
          unreadSeparator.style.backgroundColor = '';
        }, 2000);
      };

      performBasicScroll();
      
      setTimeout(async () => {
        await performPreciseAdjustment();
        addVisualEffect();
      }, 100);

      return true;

    } catch (error) {
      scrollToBottom(false);
      return false;
    }
  }, []);

  // 이미지 로딩 완료 대기 함수
  const waitForImagesLoad = (container) => {
    return new Promise((resolve) => {
      const images = container.querySelectorAll('img[src]');
      
      if (images.length === 0) {
        resolve();
        return;
      }

      let loadedCount = 0;
      const checkComplete = () => {
        loadedCount++;
        if (loadedCount === images.length) {
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

  // 백그라운드에서 첨부파일 로드
  const loadAttachmentsInBackground = async (imageMessages) => {
    const attachmentPromises = imageMessages.map(async (message, index) => {
      if (!message.attach_idx || message.attach_idx <= 0) {
        return { message_idx: message.message_idx, attachment: null, index };
      }

      try {
        const attachment = await chatApi.readFile(message.message_idx);
        
        if (attachment && attachment.cloudinary_url) {
          return { message_idx: message.message_idx, attachment, index };
        } else {
          return { message_idx: message.message_idx, attachment: null, index };
        }
        
      } catch (error) {
        return { message_idx: message.message_idx, attachment: null, index };
      }
    });

    try {
      const results = await Promise.all(attachmentPromises);
      
      const newAttachments = {};
      let successCount = 0;
      
      results.forEach(({ message_idx, attachment }) => {
        if (attachment) {
          newAttachments[message_idx] = attachment;
          successCount++;
        }
      });
      
      setAttachments(prev => ({
        ...prev,
        ...newAttachments
      }));
      
      setImageLoadingCount(0);
      
    } catch (error) {
      setImageLoadingCount(0);
    }
  };

  // 메시지 로드 함수 - 필터링 적용
  const loadMessages = async (memberIdx = null, loadAll = false) => {
    try {
      setLoading(true);

      const messageList = await chatApi.readMessageList(parseInt(roomId));
      
      let finalMessages;
      let hasOldMessagesResult = false;
      
      if (loadAll) {
        // 지난 대화 보기 클릭 시 전체 메시지 로드
        finalMessages = messageList;
        setAllOldMessagesLoaded(true);
      } else {
        // 초기 로드 시 최근 메시지만 필터링
        const { recentMessages, hasOldMessages } = filterRecentMessages(messageList, roomEnterTime);
        finalMessages = recentMessages;
        hasOldMessagesResult = hasOldMessages;
      }
      
      setMessages(finalMessages);
      setHasOldMessages(hasOldMessagesResult);

      const imageMessages = finalMessages.filter(msg => 
        msg.message_type === 'image' && msg.attach_idx && msg.attach_idx > 0
      );

      setTotalImageCount(imageMessages.length);
      setImageLoadingCount(imageMessages.length);

      if (memberIdx) {
        const unreadMessages = finalMessages.filter(msg => 
          msg.sender_idx !== memberIdx && !msg.message_readdate
        );
        setInitialUnreadMessages(unreadMessages);

        if (unreadMessages.length === 0) {
          setShouldScrollToBottom(true);
        } else {
          setShouldScrollToBottom(false);
        }
      }

      if (imageMessages.length > 0) {
        await loadAttachmentsInBackground(imageMessages);
      } else {
        setImageLoadingCount(0);
      }

    } catch (error) {
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

  // 지난 대화 보기 핸들러
  const handleLoadOldMessages = async () => {
    if (isLoadingOldMessages || allOldMessagesLoaded) {
      return;
    }

    setIsLoadingOldMessages(true);

    try {
      // 현재 스크롤 위치 저장
      const container = messagesContainerRef.current;
      const currentScrollHeight = container ? container.scrollHeight : 0;
      const currentScrollTop = container ? container.scrollTop : 0;

      // 전체 메시지 다시 로드
      await loadMessages(currentMemberIdx, true);

      // 스크롤 위치 복원
      setTimeout(() => {
        if (container) {
          const newScrollHeight = container.scrollHeight;
          const heightDifference = newScrollHeight - currentScrollHeight;
          
          if (heightDifference > 0) {
            container.scrollTop = currentScrollTop + heightDifference;
          }
        }
      }, 100);
      
    } catch (error) {
      alert('지난 대화를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingOldMessages(false);
    }
  };

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    const initializeChatRoom = async () => {
      if (!user || !user.isLogin) {
        navigate('/login');
        return;
      }

      setIsInitialLoad(true);
      setHasPerformedInitialScroll(false);
      setShouldScrollToBottom(false);
      setInitialUnreadMessages([]);
      setImageLoadingCount(0);
      setTotalImageCount(0);
      setAttachments({});
      
      // 지난 대화 관련 상태 초기화
      setHasOldMessages(false);
      setAllOldMessagesLoaded(false);
      setIsLoadingOldMessages(false);
      
      // 매칭 상태 초기화
      setHasCompletedMatchingWithTrainer(false);
      setIsMatchingCheckComplete(true);
      setIsMatchingCheckLoading(false);

      const memberIdx = await getMemberIdxForChat();
      if (!memberIdx) return;

      // roomData 설정
      if (location.state?.roomData) {      
        let enhancedRoomData = { ...location.state.roomData };
        
        // 성별 정보가 DB에서 조회되지 않은 경우에만 보완
        if (!enhancedRoomData.trainer_gender && !enhancedRoomData.user_gender) {
          // 현재 사용자 정보로 보완
          if (enhancedRoomData.trainer_idx === user.member_idx) {
            enhancedRoomData.trainer_gender = user.member_gender;
          } else if (enhancedRoomData.user_idx === user.member_idx) {
            enhancedRoomData.user_gender = user.member_gender;
          }
          
          // location.state에서 trainerInfo가 있다면 성별 정보 추가
          if (location.state?.trainerInfo?.member_gender) {
            if (user.member_type !== 'trainer') {
              enhancedRoomData.trainer_gender = location.state.trainerInfo.member_gender;
            }
          }
        }
        
        setRoomData(enhancedRoomData);
      } else {
        const tempRoomData = createTemporaryRoomData();
        setRoomData(tempRoomData);
      }

      // 필터링된 메시지 로드 (초기 로드)
      await loadMessages(memberIdx, false);
    };

    initializeChatRoom();

    return () => {
      sessionStorage.removeItem('chat_member_idx');
      if (scrollAdjustmentTimerRef.current) {
        clearTimeout(scrollAdjustmentTimerRef.current);
      }
    };
  }, [roomId, user, navigate, location.state, createTemporaryRoomData, filterRecentMessages, roomEnterTime]);

  // roomData가 설정된 후 매칭 상태 확인
  useEffect(() => {
    if (roomData && user?.member_type === 'user' && isMatchingCheckComplete) {
      checkCompletedMatchingWithTrainer();
    }
  }, [roomData, user?.member_type, checkCompletedMatchingWithTrainer]);

  // 모든 이미지 로딩 완료 후 스크롤 실행
  useEffect(() => {
    if (messages.length > 0 && 
        isInitialLoad && 
        currentMemberIdx && 
        !hasPerformedInitialScroll && 
        imageLoadingCount === 0) {
      
      setTimeout(() => {
        performInitialScroll();
      }, 300);
    }
  }, [messages, currentMemberIdx, isInitialLoad, hasPerformedInitialScroll, imageLoadingCount]);

  // 초기 스크롤 실행
  const performInitialScroll = () => {
    if (shouldScrollToBottom) {
      scrollToBottom(false);
    } else if (initialUnreadMessages.length > 0) {
      const oldestUnreadMessage = initialUnreadMessages.reduce((oldest, current) => {
        const oldestTime = new Date(oldest.message_senddate).getTime();
        const currentTime = new Date(current.message_senddate).getTime();
        return currentTime < oldestTime ? current : oldest;
      });
      
      scrollToUnreadSeparatorTop(oldestUnreadMessage.message_idx);
    } else {
      scrollToBottom(false);
    }

    setHasPerformedInitialScroll(true);
    
    setTimeout(() => {
      setIsInitialLoad(false);
      performInitialReadMark();
    }, 500);
  };

  // 개별 읽음 처리 함수
  const performInitialReadMark = () => {
    if (connected && currentMemberIdx && messages.length > 0 && !initialReadDone.current) {
      initialReadDone.current = true;

      // 읽지 않은 메시지들을 모두 찾아서 개별적으로 읽음 처리
      const unreadMessages = messages.filter(msg => 
        msg.receiver_idx === currentMemberIdx && !msg.message_readdate
      );

      // 각 메시지에 대해 개별적으로 읽음 처리
      unreadMessages.forEach((msg, index) => {
        setTimeout(() => {
          markAsRead(msg.message_idx, parseInt(roomId, 10));
        }, index * 50); // 50ms 간격으로 순차 처리
      });
    }
  };

  // WebSocket 구독 설정
  useEffect(() => {
    if (connected && roomId && currentMemberIdx) {
      const unsubscribe = subscribeToRoom(
        parseInt(roomId),
        async (newMessage) => {
          setMessages(prev => {
            const existingMessage = prev.find(msg => msg.message_idx === newMessage.message_idx);
            if (existingMessage) return prev;
            return [...prev, newMessage];
          });

          setTimeout(() => {
            scrollToBottom(true);
          }, 100);

          if (newMessage.message_type === 'image' && newMessage.attach_idx && newMessage.attach_idx > 0) {
            const tryLoadAttachment = async (retryCount = 0) => {
              const maxRetries = 5;
              
              try {
                const attachment = await chatApi.readFile(newMessage.message_idx);
                
                setAttachments(prev => ({
                  ...prev,
                  [newMessage.message_idx]: attachment
                }));
                
                setTimeout(() => {
                  adjustScrollPosition();
                }, 100);
                
              } catch (error) {
                if (retryCount < maxRetries) {
                  const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 5000);
                  setTimeout(() => tryLoadAttachment(retryCount + 1), retryDelay);
                } 
              }
            };
            
            setTimeout(() => tryLoadAttachment(), 300);
          }

          // 실시간 메시지 개별 읽음 처리
          if (newMessage.receiver_idx === currentMemberIdx) {
            setTimeout(() => {
              markAsRead(newMessage.message_idx, parseInt(roomId));
            }, 100);
          }
        },
        (readData) => {
          setMessages(prev => prev.map(msg => {
            if (msg.message_idx === readData.message_idx) {
              return { ...msg, message_readdate: new Date().toISOString() };
            }
            return msg;
          }));
        },
        (deleteData) => {
          if (deleteData.deleted_by !== currentMemberIdx) {
            setMessages(prev => prev.filter(msg => msg.message_idx !== deleteData.message_idx));
            
            setAttachments(prev => {
              const newAttachments = { ...prev };
              delete newAttachments[deleteData.message_idx];
              return newAttachments;
            });
          }
        }
      );

      return unsubscribe;
    }
  }, [connected, roomId, subscribeToRoom, markAsRead, currentMemberIdx]);

  // 매칭 상태 업데이트 구독
  useEffect(() => {
    if (connected && roomData && user?.member_type === 'user') {
      const trainerIdx = roomData.trainer_idx;
      
      if (trainerIdx) {
        const unsubscribeMatching = subscribeToMatchingUpdates(
          trainerIdx,
          (matchingUpdate) => {
            // 매칭이 수락된 경우 상태 업데이트
            if (matchingUpdate.status_type === 'accepted') {
              // 실시간으로 매칭 상태 업데이트
              if (matchingUpdate.user_idx === user.member_idx) {
                setHasCompletedMatchingWithTrainer(true);
                
                // 다른 매칭 요청 메시지들도 즉시 업데이트되도록 메시지 리스트 갱신
                setMessages(prevMessages => [...prevMessages]);
              }
            }
          }
        );

        return unsubscribeMatching;
      }
    }
  }, [connected, roomData, user?.member_type, user?.member_idx, subscribeToMatchingUpdates]);

  // 특정 메시지로 스크롤 함수 (검색용)
  const scrollToMessage = useCallback((messageIdx, retryCount = 0) => {
    const maxRetries = 5;
    const messageElement = document.getElementById(`message-${messageIdx}`);
    
    if (messageElement && messagesContainerRef.current) {
      const containerRect = messagesContainerRef.current.getBoundingClientRect();
      const messageRect = messageElement.getBoundingClientRect();
      
      const scrollTop = messagesContainerRef.current.scrollTop + 
                       messageRect.top - containerRect.top - 
                       containerRect.height / 2 + messageRect.height / 2;
      
      messagesContainerRef.current.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });

      messageElement.style.backgroundColor = 'rgba(74, 144, 226, 0.2)';
      setTimeout(() => {
        messageElement.style.backgroundColor = '';
      }, 2000);
      
      return true;
    } else if (retryCount < maxRetries) {
      setTimeout(() => scrollToMessage(messageIdx, retryCount + 1), 100);
      return false;
    } else {
      scrollToBottom(false);
      return false;
    }
  }, []);

  // 맨 아래로 스크롤 함수
  const scrollToBottom = useCallback((smooth = true, retryCount = 0) => {
    const maxRetries = 5;
    
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      
      const scrollToBottomPosition = () => {
        const { scrollHeight, clientHeight } = container;
        const targetScrollTop = scrollHeight - clientHeight;
        
        if (smooth) {
          container.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth'
          });
        } else {
          container.scrollTop = targetScrollTop;
        }
      };
      
      scrollToBottomPosition();
      
      setTimeout(() => {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const expectedScrollTop = scrollHeight - clientHeight;
        const difference = Math.abs(expectedScrollTop - scrollTop);
        
        if (difference > 10) {
          container.scrollTop = expectedScrollTop;
        }
        
        lastScrollHeight.current = scrollHeight;
      }, 100);
      
      return true;
    } else if (retryCount < maxRetries) {
      setTimeout(() => scrollToBottom(smooth, retryCount + 1), 100);
      return false;
    } else {
      return false;
    }
  }, []);

  // 스크롤 위치 미세 조정
  const adjustScrollPosition = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
      
      const currentScrollHeight = scrollHeight;
      const heightDifference = currentScrollHeight - lastScrollHeight.current;
      
      if (isNearBottom && Math.abs(heightDifference) > 50) {
        scrollToBottom(false);
        lastScrollHeight.current = currentScrollHeight;
      }
    }
  }, [scrollToBottom]);

  // 이미지 로딩 완료 핸들러
  const handleImageLoad = useCallback((messageIdx) => {
    setTimeout(() => {
      adjustScrollPosition();
    }, 50);
  }, [adjustScrollPosition]);

  // 검색 결과 처리 함수
  const handleSearchResults = useCallback((results) => {
    setSearchResults(results);
  }, []);

  // 검색 결과에서 특정 메시지로 이동
  const handleScrollToSearchResult = useCallback((messageIdx) => {
    scrollToMessage(messageIdx);
  }, [scrollToMessage]);

  // 답장 핸들러
  const handleReply = useCallback((message) => {
    setReplyToMessage(message);
  }, []);

  // 답장 취소 핸들러
  const handleCancelReply = useCallback(() => {
    setReplyToMessage(null);
  }, []);

  // 메시지 삭제 핸들러
  const handleDeleteMessage = useCallback(async (message) => {
    try {
      const response = await axios.delete(`/api/chat/message/${message.message_idx}`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setMessages(prev => prev.filter(msg => msg.message_idx !== message.message_idx));
        
        setAttachments(prev => {
          const newAttachments = { ...prev };
          delete newAttachments[message.message_idx];
          return newAttachments;
        });
        
        if (connected && sendDeleteNotification) {
          try {
            const deleteData = {
              room_idx: roomId,
              message_idx: message.message_idx
            };
            
            sendDeleteNotification(deleteData);
          } catch (error) {
            // 브로드캐스트 실패는 무시
          }
        }
        
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        alert('로그인이 필요합니다.');
        navigate('/login');
      } else if (error.response?.status === 400) {
        alert(error.response.data.message || '메시지를 삭제할 수 없습니다.');
      } else {
        alert('메시지 삭제 중 오류가 발생했습니다.');
      }
    }
  }, [navigate, connected, sendDeleteNotification, roomId]);

  // 메시지 신고 핸들러
  const handleReportMessage = useCallback(async (message, reportContent) => {
    try {
      const response = await axios.post(`/api/chat/message/${message.message_idx}/report`, {
        reportContent: reportContent
      }, {
        withCredentials: true
      });
      
      if (response.data.success) {
        alert('신고가 접수되었습니다.');
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        alert('로그인이 필요합니다.');
        navigate('/login');
      } else if (error.response?.status === 400) {
        alert(error.response.data.message || '신고 처리 중 오류가 발생했습니다.');
      } else {
        alert('신고 처리 중 오류가 발생했습니다.');
      }
    }
  }, [navigate]);

  // 메시지 전송 핸들러
  const handleSendMessage = async (messageContent, messageType = 'text', file = null, parentIdx = null, matchingData = null) => {
    if (!connected || !roomId || !currentMemberIdx) {
      return Promise.reject('WebSocket 연결 오류');
    }

    return new Promise(async (resolve, reject) => {
      try {
        const otherMemberIdx = roomData?.trainer_idx === currentMemberIdx
          ? roomData?.user_idx
          : roomData?.trainer_idx;

        const messageTimestamp = Date.now();
        const messageId = `${messageTimestamp}_${Math.random().toString(36).substr(2, 9)}`;

        const messageData = {
          room_idx: parseInt(roomId),
          receiver_idx: otherMemberIdx,
          message_content: messageContent,
          message_type: messageType,
          unique_id: messageId,
          parent_idx: parentIdx
        };

        // 매칭 데이터가 있는 경우
        if (matchingData) {
          messageData.matching_data = matchingData;
        }

        sendMessage(messageData);

        setTimeout(() => {
          scrollToBottom(true);
        }, 50);

        if (file && messageType === 'image') {
          await new Promise(resolve => setTimeout(resolve, 800));
          
          try {
            const messageList = await chatApi.readMessageList(parseInt(roomId));
            
            const targetMessage = messageList
              .filter(msg => 
                msg.sender_idx === currentMemberIdx && 
                msg.message_content === messageContent &&
                msg.message_type === 'image' &&
                (!msg.attach_idx || msg.attach_idx === 0) &&
                (parentIdx ? msg.parent_idx === parentIdx : !msg.parent_idx)
              )
              .sort((a, b) => new Date(b.message_senddate) - new Date(a.message_senddate))[0];

            if (!targetMessage) {
              throw new Error('업로드할 메시지를 찾을 수 없습니다.');
            }
            
            const uploadResult = await chatApi.uploadFile(file, targetMessage.message_idx);
            
            const attachmentInfo = {
              attach_idx: uploadResult.attachIdx,
              original_filename: uploadResult.originalFilename,
              cloudinary_url: uploadResult.cloudinaryUrl,
              file_size_bytes: uploadResult.fileSize,
              mime_type: uploadResult.mimeType
            };
            
            setAttachments(prev => ({
              ...prev,
              [targetMessage.message_idx]: attachmentInfo
            }));
            
            setTimeout(() => {
              scrollToBottom(false);
            }, 200);
            
            resolve(targetMessage);
            
          } catch (uploadError) {
            reject(uploadError);
          }
        } else {
          setTimeout(() => {
            resolve({ content: messageContent, type: messageType, parent_idx: parentIdx, matching_data: matchingData });
          }, 100);
        }
      } catch (error) {
        reject(error);
      }
    });
  };

  // 채팅방 표시 마스킹된 이름 생성 함수
  const getRoomDisplayName = () => {
    if (roomData && currentMemberIdx) {
      
      if (roomData.trainer_idx === currentMemberIdx) {
        // 내가 트레이너인 경우 -> 회원 정보 표시
        const userName = roomData.user_name || '회원';
        const userEmail = roomData.user_email || '';
        
        if (userEmail) {
          const maskedEmail = maskEmail(userEmail);
          return `${userName}(${maskedEmail})`;
        } else {
          return `${userName}님과의 상담`;
        }
      } else {
        // 내가 회원인 경우 -> 트레이너 정보 표시
        const trainerName = roomData.trainer_name || '트레이너';
        const trainerEmail = roomData.trainer_email || '';
        
        // 관리자인 경우 특별 처리
        if (roomData.trainer_idx === 141) {
          return '관리자 문의';
        }
        
        if (trainerEmail) {
          const maskedEmail = maskEmail(trainerEmail);
          return `${trainerName}(${maskedEmail})`;
        } else {
          return `${trainerName}님과의 상담`;
        }
      }
    }

    // fallback 로직
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
      const trainerEmail = location.state.trainerInfo.member_email;
      
      if (roomData?.trainer_idx === currentMemberIdx) {
        return `회원님과의 상담`;
      } else {
        if (trainerEmail) {
          const maskedEmail = maskEmail(trainerEmail);
          return `${trainerName}(${maskedEmail})`;
        } else {
          return `${trainerName}님과의 상담`;
        }
      }
    }

    if (roomData?.trainer_idx === currentMemberIdx) {
      return `회원님과의 상담`;
    } else {
      return `트레이너님과의 상담`;
    }
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
          attachments={{}}
          roomData={null}
          onSendMessage={null}
        />
        <BarbellLoading />
      </Container>
    );
  }

  return (
    <Container>
      <HeaderContainer>
        <ChatRoomHeader 
          roomDisplayName={getRoomDisplayName()} 
          onSearchResults={handleSearchResults} 
          onScrollToSearchResult={handleScrollToSearchResult}
          messages={messages}
          attachments={attachments}
          roomData={roomData}
          onSendMessage={handleSendMessage}
        />
      </HeaderContainer>

      <MessagesWrapper>
        <MessagesContainer ref={messagesContainerRef}>
          {hasOldMessages && !allOldMessagesLoaded && (
            <OldMessagesButton
              onClick={handleLoadOldMessages}
              disabled={isLoadingOldMessages}
              aria-label="지난 대화 보기"
            >
              <OldMessagesText>
                {isLoadingOldMessages ? '불러오는 중...' : '지난 대화 보기'}
              </OldMessagesText>
            </OldMessagesButton>
          )}

          <MessageList
            messages={messages}
            currentMemberIdx={currentMemberIdx}
            attachments={attachments}
            roomData={roomData}
            onImageLoad={handleImageLoad}
            onReply={handleReply}
            onDelete={handleDeleteMessage}
            onReport={handleReportMessage}
            onScrollToMessage={scrollToMessage}
            hasCompletedMatchingWithTrainer={hasCompletedMatchingWithTrainer}
            isMatchingCheckComplete={isMatchingCheckComplete}
            isMatchingCheckLoading={isMatchingCheckLoading}
          />
          <div ref={messagesEndRef} />
        </MessagesContainer>
      </MessagesWrapper>

      <InputWrapper>
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={!connected}
          replyToMessage={replyToMessage}
          onCancelReply={handleCancelReply}
          attachments={attachments}
        />
      </InputWrapper>
    </Container>
  );
};

export default ChatRoom;