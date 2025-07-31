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

  // 매칭 상태 관리 수정 - 기본값 변경 및 로딩 상태 분리
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

  useEffect(() => {
    console.log('🏗️ ChatRoom 컴포넌트 마운트됨');
    return () => {
      console.log('🏗️ ChatRoom 컴포넌트 언마운트됨');
    };
  }, []);

  // roomData 생성 함수 - 성별 정보 강화
  const createTemporaryRoomData = useCallback(() => {
    if (!user || !roomId) return null;

    // location.state에서 트레이너 정보 가져오기
    const trainerInfo = location.state?.trainerInfo;
    
    if (trainerInfo) {
      // TrainerInfo에서 온 경우
      const isCurrentUserTrainer = user.member_type === 'trainer';
      
      if (isCurrentUserTrainer) {
        // 현재 사용자가 트레이너인 경우
        const roomData = {
          room_idx: parseInt(roomId),
          trainer_idx: user.member_idx,
          user_idx: null, // 실제로는 채팅방 생성 시 설정됨
          trainer_name: user.member_name,
          trainer_image: user.member_image,
          trainer_gender: user.member_gender,
          trainer_email: user.member_email,
          user_name: '회원',
          user_image: null,
          user_gender: null,
          user_email: null
        };
        console.log('✅ 트레이너 계정 roomData 생성:', roomData);
        return roomData;
      } else {
        // 현재 사용자가 일반 회원인 경우
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
        console.log('✅ 일반 회원 계정 roomData 생성:', roomData);
        return roomData;
      }
    }

    // fallback 데이터 - 성별 정보 포함
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
    
    console.log('⚠️ fallback roomData 생성:', fallbackRoomData);
    return fallbackRoomData;
  }, [user, roomId, location.state]);

  // 매칭 상태 확인 함수 수정
  const checkCompletedMatchingWithTrainer = useCallback(async () => {
    if (!roomData || !user?.member_idx || user?.member_type !== 'user') {
      console.log('❌ 매칭 확인 조건 불충족:', {
        hasRoomData: !!roomData,
        hasMemberIdx: !!user?.member_idx,
        isUser: user?.member_type === 'user'
      });
      setIsMatchingCheckComplete(true);
      return;
    }

    setIsMatchingCheckLoading(true);
    setIsMatchingCheckComplete(false);

    try {
      const currentTrainerIdx = roomData.trainer_idx;
      
      console.log('🔍 매칭 확인 파라미터:', {
        currentTrainerIdx,
        userMemberIdx: user.member_idx,
        roomData
      });
      
      if (!currentTrainerIdx) {
        console.log('❌ 트레이너 IDX 없음');
        setHasCompletedMatchingWithTrainer(false);
        return;
      }
      
      const result = await chatApi.checkCompletedMatchingBetween(currentTrainerIdx, user.member_idx);
      
      console.log('✅ 매칭 확인 결과:', result);
      
      if (result.success) {
        setHasCompletedMatchingWithTrainer(result.hasCompletedMatching);
        console.log('🎯 매칭 상태 업데이트:', {
          hasCompletedMatching: result.hasCompletedMatching,
          trainerIdx: currentTrainerIdx,
          userIdx: user.member_idx
        });
      } else {
        setHasCompletedMatchingWithTrainer(false);
      }
      
    } catch (error) {
      console.error('❌ 매칭 확인 중 오류:', error);
      setHasCompletedMatchingWithTrainer(false);
    } finally {
      setIsMatchingCheckComplete(true);
      setIsMatchingCheckLoading(false);
    }
  }, [roomData, user?.member_idx, user?.member_type]);

  // 읽지 않은 메시지 스크롤 함수
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
          console.log('이미지 로딩으로 인한 높이 변화 감지:', heightDifference);
          
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
          
          console.log('이미지 로딩 후 스크롤 위치 재조정 완료');
        }
      };

      const addVisualEffect = () => {
        unreadSeparator.style.backgroundColor = 'rgba(74, 144, 226, 0.15)';
        unreadSeparator.style.transition = 'background-color 0.3s ease';
        setTimeout(() => {
          unreadSeparator.style.backgroundColor = '';
        }, 2000);
      };

      console.log('🚀 읽지 않은 메시지 스크롤 실행');
      performBasicScroll();
      
      setTimeout(async () => {
        await performPreciseAdjustment();
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
    console.log('📷 첨부파일 로드 시작 - 총', imageMessages.length, '개');
    
    const attachmentPromises = imageMessages.map(async (message, index) => {
      if (!message.attach_idx || message.attach_idx <= 0) {
        console.log(`⚠️ attach_idx 없음: message_idx=${message.message_idx}`);
        return { message_idx: message.message_idx, attachment: null, index };
      }

      try {
        console.log(`📷 첨부파일 로드 시작: ${index + 1}/${imageMessages.length} - message_idx=${message.message_idx}, attach_idx=${message.attach_idx}`);
        
        const attachment = await chatApi.readFile(message.message_idx);
        
        if (attachment && attachment.cloudinary_url) {
          console.log(`✅ 첨부파일 로드 성공: ${message.message_idx} - ${attachment.original_filename}`);
          return { message_idx: message.message_idx, attachment, index };
        } else {
          console.warn(`⚠️ 첨부파일 데이터 누락: message_idx=${message.message_idx}`);
          return { message_idx: message.message_idx, attachment: null, index };
        }
        
      } catch (error) {
        console.error(`❌ 첨부파일 로드 실패: message_idx=${message.message_idx}`, error);
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
      
      console.log(`📷 첨부파일 로드 완료: ${successCount}/${imageMessages.length}개 성공`);
      console.log('📷 로드된 첨부파일들:', newAttachments);
      
      setAttachments(prev => ({
        ...prev,
        ...newAttachments
      }));
      
      setImageLoadingCount(0);
      
    } catch (error) {
      console.error('❌ 첨부파일 로드 전체 실패:', error);
      setImageLoadingCount(0);
    }
  };

  // 메시지 로드 함수
  const loadMessages = async (memberIdx = null) => {
    try {
      setLoading(true);
      console.log('📨 메시지 로드 시작...');

      const messageList = await chatApi.readMessageList(parseInt(roomId));
      console.log('📨 메시지 로드 완료:', messageList.length, '개');
      
      setMessages(messageList);

      const imageMessages = messageList.filter(msg => 
        msg.message_type === 'image' && msg.attach_idx && msg.attach_idx > 0
      );

      setTotalImageCount(imageMessages.length);
      setImageLoadingCount(imageMessages.length);

      if (memberIdx) {
        const unreadMessages = messageList.filter(msg => 
          msg.sender_idx !== memberIdx && !msg.message_readdate
        );
        setInitialUnreadMessages(unreadMessages);

        if (unreadMessages.length === 0) {
          console.log('✅ 읽지 않은 메시지 없음 - 맨 아래 스크롤 예정');
          setShouldScrollToBottom(true);
        } else {
          console.log('📍 읽지 않은 메시지', unreadMessages.length, '개 발견');
          setShouldScrollToBottom(false);
        }
      }

      if (imageMessages.length > 0) {
        console.log('📷 백그라운드에서 첨부파일 로드 시작...', imageMessages.length, '개');
        await loadAttachmentsInBackground(imageMessages);
      } else {
        console.log('📷 이미지 메시지 없음 - 첨부파일 로드 건너뜀');
        setImageLoadingCount(0);
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

  // 컴포넌트 마운트 시 초기화 - 성별 정보 강화
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
      
      // 매칭 상태 초기화 수정
      setHasCompletedMatchingWithTrainer(false);
      setIsMatchingCheckComplete(true);
      setIsMatchingCheckLoading(false);
      
      console.log('🔄 채팅방 초기화');

      const memberIdx = await getMemberIdxForChat();
      if (!memberIdx) return;

      // roomData 설정
      if (location.state?.roomData) {      
        console.log('📋 기존 roomData 사용 (성별 정보 강화):', location.state.roomData);
        
        // DB에서 조회한 roomData가 있다면 성별 정보가 이미 포함되어 있음
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
        } else {
          console.log('✅ DB에서 성별 정보 이미 조회됨');
        }
        
        setRoomData(enhancedRoomData);
      } else {
        console.log('🔧 임시 roomData 생성...');
        const tempRoomData = createTemporaryRoomData();
        console.log('✅ 임시 roomData 생성 완료:', tempRoomData);
        setRoomData(tempRoomData);
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
  }, [roomId, user, navigate, location.state, createTemporaryRoomData]);

  // roomData가 설정된 후 매칭 상태 확인 수정
  useEffect(() => {
    if (roomData && user?.member_type === 'user' && isMatchingCheckComplete) {
      console.log('🔍 회원 계정 - 매칭 상태 확인 시작');
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
      
      console.log('📍 모든 이미지 로딩 완료 - 초기 스크롤 실행');
      
      setTimeout(() => {
        performInitialScroll();
      }, 300);
    }
  }, [messages, currentMemberIdx, isInitialLoad, hasPerformedInitialScroll, imageLoadingCount]);

  // 초기 스크롤 실행
  const performInitialScroll = () => {
    console.log('🎯 초기 스크롤 실행:', {
      shouldScrollToBottom,
      unreadCount: initialUnreadMessages.length,
      attachmentsCount: Object.keys(attachments).length
    });

    if (shouldScrollToBottom) {
      console.log('📍 맨 아래로 스크롤 (읽지 않은 메시지 없음)');
      scrollToBottom(false);
    } else if (initialUnreadMessages.length > 0) {
      const oldestUnreadMessage = initialUnreadMessages.reduce((oldest, current) => {
        const oldestTime = new Date(oldest.message_senddate).getTime();
        const currentTime = new Date(current.message_senddate).getTime();
        return currentTime < oldestTime ? current : oldest;
      });
      
      console.log('🎯 가장 오래된 읽지 않은 메시지를 화면 상단에 위치:', oldestUnreadMessage.message_idx);
      scrollToUnreadSeparatorTop(oldestUnreadMessage.message_idx);
    } else {
      console.log('📍 기본: 맨 아래로 스크롤');
      scrollToBottom(false);
    }

    setHasPerformedInitialScroll(true);
    
    setTimeout(() => {
      setIsInitialLoad(false);
      performInitialReadMark();
    }, 500);
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
        async (newMessage) => {
          console.log('📨 새 메시지 수신:', newMessage);
          
          setMessages(prev => {
            const existingMessage = prev.find(msg => msg.message_idx === newMessage.message_idx);
            if (existingMessage) return prev;
            return [...prev, newMessage];
          });

          setTimeout(() => {
            scrollToBottom(true);
          }, 100);

          if (newMessage.message_type === 'image' && newMessage.attach_idx && newMessage.attach_idx > 0) {
            console.log('📷 실시간 이미지 메시지 - 첨부파일 즉시 로드');
            
            const tryLoadAttachment = async (retryCount = 0) => {
              const maxRetries = 5;
              
              try {
                const attachment = await chatApi.readFile(newMessage.message_idx);
                console.log('📷 실시간 첨부파일 로드 완료:', attachment);
                
                setAttachments(prev => ({
                  ...prev,
                  [newMessage.message_idx]: attachment
                }));
                
                setTimeout(() => {
                  adjustScrollPosition();
                }, 100);
                
              } catch (error) {
                console.error(`첨부파일 로드 시도 ${retryCount + 1} 실패:`, error);
                
                if (retryCount < maxRetries) {
                  const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 5000);
                  console.log(`📷 ${retryDelay}ms 후 재시도...`);
                  setTimeout(() => tryLoadAttachment(retryCount + 1), retryDelay);
                } else {
                  console.error('📷 첨부파일 로드 최종 실패 - 최대 재시도 횟수 초과');
                }
              }
            };
            
            setTimeout(() => tryLoadAttachment(), 300);
          }

          if (newMessage.receiver_idx === currentMemberIdx) {
            setTimeout(() => {
              markAsRead(newMessage.message_idx, parseInt(roomId));
            }, 100);
          }
        },
        (readData) => {
          console.log('📖 읽음 확인 수신:', readData);
          setMessages(prev => prev.map(msg => {
            if (msg.message_idx === readData.message_idx) {
              return { ...msg, message_readdate: new Date().toISOString() };
            }
            return msg;
          }));
        },
        (deleteData) => {
          console.log('🗑️ 실시간 삭제 알림 수신:', deleteData);
          
          if (deleteData.deleted_by !== currentMemberIdx) {
            console.log('🗑️ 상대방이 삭제한 메시지 - 실시간 제거:', deleteData.message_idx);
            
            setMessages(prev => prev.filter(msg => msg.message_idx !== deleteData.message_idx));
            
            setAttachments(prev => {
              const newAttachments = { ...prev };
              delete newAttachments[deleteData.message_idx];
              return newAttachments;
            });
            
            console.log('✅ 상대방 삭제 메시지 실시간 제거 완료');
          }
        }
      );

      return unsubscribe;
    }
  }, [connected, roomId, subscribeToRoom, markAsRead, currentMemberIdx]);

  // 매칭 상태 업데이트 구독 수정
  useEffect(() => {
    if (connected && roomData && user?.member_type === 'user') {
      const trainerIdx = roomData.trainer_idx;
      
      if (trainerIdx) {
        console.log('🎯 매칭 상태 업데이트 구독 시작 - 트레이너:', trainerIdx);
        
        const unsubscribeMatching = subscribeToMatchingUpdates(
          trainerIdx,
          (matchingUpdate) => {
            console.log('🔄 매칭 상태 업데이트 수신:', matchingUpdate);
            
            // 매칭이 수락된 경우 상태 업데이트
            if (matchingUpdate.status_type === 'accepted') {
              console.log('✅ 매칭 수락됨 - 실시간 상태 업데이트');
              
              // 실시간으로 매칭 상태 업데이트
              if (matchingUpdate.user_idx === user.member_idx) {
                console.log('🎉 내가 수락한 매칭 - 상태 즉시 업데이트');
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
          console.log('🔧 스크롤 위치 재조정:', { 
            expected: expectedScrollTop, 
            actual: scrollTop, 
            difference 
          });
          container.scrollTop = expectedScrollTop;
        }
        
        lastScrollHeight.current = scrollHeight;
      }, 100);
      
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

  // 스크롤 위치 미세 조정
  const adjustScrollPosition = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
      
      const currentScrollHeight = scrollHeight;
      const heightDifference = currentScrollHeight - lastScrollHeight.current;
      
      if (isNearBottom && Math.abs(heightDifference) > 50) {
        console.log('🔧 이미지 로딩으로 스크롤 위치 미세 조정:', heightDifference);
        scrollToBottom(false);
        lastScrollHeight.current = currentScrollHeight;
      }
    }
  }, [scrollToBottom]);

  // 이미지 로딩 완료 핸들러
  const handleImageLoad = useCallback((messageIdx) => {
    console.log('📷 이미지 로딩 완료:', messageIdx);
    
    setTimeout(() => {
      adjustScrollPosition();
    }, 50);
  }, [adjustScrollPosition]);

  // 검색 결과 처리 함수
  const handleSearchResults = useCallback((results) => {
    setSearchResults(results);
    console.log('🔍 검색 결과 업데이트:', results.length, '개');
  }, []);

  // 검색 결과에서 특정 메시지로 이동
  const handleScrollToSearchResult = useCallback((messageIdx) => {
    console.log('🔍 검색 결과로 스크롤 이동 (중앙 위치):', messageIdx);
    scrollToMessage(messageIdx);
  }, [scrollToMessage]);

  // 답장 핸들러
  const handleReply = useCallback((message) => {
    console.log('💬 답장 모드 활성화:', message);
    setReplyToMessage(message);
  }, []);

  // 답장 취소 핸들러
  const handleCancelReply = useCallback(() => {
    console.log('❌ 답장 모드 취소');
    setReplyToMessage(null);
  }, []);

  // 메시지 삭제 핸들러
  const handleDeleteMessage = useCallback(async (message) => {
    console.log('🗑️ 메시지 삭제 요청:', message);
    
    try {
      const response = await axios.delete(`/api/chat/message/${message.message_idx}`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        console.log('✅ 메시지 삭제 완료');
        
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
            
            console.log('📡 실시간 삭제 알림 전송:', deleteData);
            sendDeleteNotification(deleteData);
            console.log('✅ 실시간 삭제 알림 전송 완료');
          } catch (error) {
            console.error('❌ 실시간 삭제 알림 전송 실패:', error);
          }
        }
        
      } else {
        console.error('❌ 메시지 삭제 실패:', response.data.message);
        alert(response.data.message);
      }
    } catch (error) {
      console.error('❌ 메시지 삭제 API 호출 실패:', error);
      
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
    console.log('🚨 메시지 신고 요청:', { message, reportContent });
    
    try {
      const response = await axios.post(`/api/chat/message/${message.message_idx}/report`, {
        reportContent: reportContent
      }, {
        withCredentials: true
      });
      
      if (response.data.success) {
        console.log('✅ 메시지 신고 완료');
        alert('신고가 접수되었습니다.');
      } else {
        console.error('❌ 메시지 신고 실패:', response.data.message);
        alert(response.data.message);
      }
    } catch (error) {
      console.error('❌ 메시지 신고 API 호출 실패:', error);
      
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
      console.warn('WebSocket 연결이 되어있지 않거나 채팅방 ID가 없습니다.');
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
          console.log('🎯 매칭 데이터 포함하여 메시지 전송:', messageData);
        }

        console.log('📤 메시지 전송 시작 (답장 + 매칭 지원):', messageData);
        sendMessage(messageData);

        setTimeout(() => {
          scrollToBottom(true);
        }, 50);

        if (file && messageType === 'image') {
          console.log('📷 이미지 파일 업로드 시작:', file.name);
          
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

            console.log('📷 업로드 대상 메시지 찾음:', targetMessage.message_idx);
            
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
            
            console.log('✅ 이미지 업로드 완료 및 로컬 업데이트:', uploadResult.originalFilename);
            
            setTimeout(() => {
              scrollToBottom(false);
            }, 200);
            
            resolve(targetMessage);
            
          } catch (uploadError) {
            console.error('❌ 파일 업로드 실패:', uploadError);
            reject(uploadError);
          }
        } else {
          setTimeout(() => {
            resolve({ content: messageContent, type: messageType, parent_idx: parentIdx, matching_data: matchingData });
          }, 100);
        }
      } catch (error) {
        console.error('❌ 메시지 전송 실패:', error);
        reject(error);
      }
    });
  };

  // 채팅방 표시 이름 생성 함수 - 이메일 마스킹 적용
  const getRoomDisplayName = () => {
    if (roomData && currentMemberIdx) {
      
      if (roomData.trainer_idx === currentMemberIdx) {
        // 내가 트레이너인 경우 -> 회원 정보 표시
        const userName = roomData.user_name || '회원';
        const userEmail = roomData.user_email || '';
        
        if (userEmail) {
          // 이메일 마스킹 적용
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
        if (roomData.trainer_idx === 141) { // 관리자 member_idx
          return '관리자 문의';
        }
        
        if (trainerEmail) {
          // 이메일 마스킹 적용
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
          // 이메일 마스킹 적용
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