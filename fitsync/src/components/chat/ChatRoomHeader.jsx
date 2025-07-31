import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useDebounce } from 'use-debounce';
import { useSelector } from 'react-redux';
import MatchingModal from './MatchingModal';
import chatApi from '../../utils/ChatApi';

const HeaderContainer = styled.div`
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-light);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  width: 100%;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  padding: 15px 20px;
  gap: 15px;
  height: 60px;
  min-height: 60px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 2rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(255,255,255,0.1);
  }
`;

const HeaderMain = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const RoomTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 36px;
  display: flex;
  align-items: center;
  flex-shrink: 1;
`;

const MatchingButton = styled.button`
  background: var(--primary-blue);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 1.2rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
  
  &:hover {
    background: var(--primary-blue-hover);
    transform: scale(1.05);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-medium);
  border-radius: 20px;
  padding: 8px 12px;
  height: 36px;
  box-sizing: border-box;
  flex: 1;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: none;
  color: var(--text-primary);
  font-size: 1.4rem;
  outline: none;
  min-width: 0;
  
  &::placeholder {
    color: var(--text-tertiary);
  }
`;

const SearchResultCounter = styled.div`
  font-size: 1.2rem;
  color: var(--text-secondary);
  white-space: nowrap;
  background: var(--bg-tertiary);
  padding: 2px 8px;
  border-radius: 10px;
`;

const SearchNavigationButtons = styled.div`
  display: flex;
  gap: 4px;
`;

const NavButton = styled.button`
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  color: var(--text-primary);
  width: 28px;
  height: 28px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  font-size: 1.2rem;
  
  &:hover:not(:disabled) {
    background: var(--bg-primary);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SearchToggleButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'isActive'
})`
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-medium);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  transition: all 0.2s;
  flex-shrink: 0;
  
  &:hover {
    border-color: var(--primary-blue);
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(74, 144, 226, 0.3);
  }
`;

const ChatRoomHeader = ({ 
  roomDisplayName, 
  onSearchResults, 
  onScrollToSearchResult, 
  messages = [], 
  attachments = {},
  roomData = null,
  onSendMessage = null
}) => {
  // 검색 관련 상태
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(-1);
  
  // 매칭 관련 상태
  const { user } = useSelector(state => state.user);
  const [showMatchingModal, setShowMatchingModal] = useState(false);
  const [isMatchingLoading, setIsMatchingLoading] = useState(false);
  
  const searchInputRef = useRef(null);
  
  // 디바운스된 검색어 (300ms 지연)
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);

  // 트레이너 여부 확인
  const isTrainer = user?.member_type === 'trainer';

  // 관리자 매칭 버튼 비활성화 조건
  const isAdminChat = () => {
    // 상대방이 관리자인지 확인
    if (!roomData || !user) return false;
    
    // 관리자(member_idx: 141)가 채팅방에 포함되어 있는지 확인
    if (roomData.trainer_idx === 141 || roomData.user_idx === 141) {
      console.log('🚫 관리자와의 채팅 - 매칭 버튼 비활성화');
      return true;
    }
    
    return false;
  };

  // 매칭하기 버튼 표시 조건 수정
  const shouldShowMatchingButton = isTrainer && !isAdminChat();

  // 상대방 정보 가져오기 함수
  const getOtherPersonInfo = () => {
    if (!roomData || !user) {
      return null;
    }
      
    const currentMemberIdx = user.member_idx;
      
    if (roomData.trainer_idx === currentMemberIdx) {
      // 내가 트레이너인 경우 → 회원 정보 반환
      return {
        member_idx: roomData.user_idx,
        name: roomData.user_name || '회원',
        type: 'user'
      };
    } else {
      // 내가 일반 사용자인 경우 → 트레이너 정보 반환
      return {
        member_idx: roomData.trainer_idx,
        name: roomData.trainer_name || '트레이너',
        type: 'trainer'
      };
    }
  };

  // 매칭 요청 처리 함수 개선 (DB 저장 방식)
  const handleMatchingRequest = async (matchingTotal) => {
    
    setIsMatchingLoading(true);
      
    try {
      const otherPerson = getOtherPersonInfo();
      
      if (!otherPerson) {
        alert('상대방 정보를 찾을 수 없습니다.');
        return;
      }

      // 백엔드에서 매칭 생성
      const result = await chatApi.createMatching(otherPerson.member_idx, matchingTotal);
        
      if (result.success) {
        // 매칭 데이터를 깔끔하게 구성
        const matchingData = {
          matching_idx: result.matching.matching_idx,
          trainer_idx: result.matching.trainer_idx,
          user_idx: result.matching.user_idx,
          matching_total: result.matching.matching_total,
          matching_remain: result.matching.matching_remain,
          matching_complete: result.matching.matching_complete
        };
        
        // 표시용 메시지 내용 (매칭 데이터 분리)
        const displayMessage = `PT ${matchingTotal}회 매칭 요청`;
          
        // 메시지 전송 (매칭 데이터는 별도 Map으로)
        if (onSendMessage) {
          await onSendMessage(
            displayMessage,           // 표시용 메시지 내용
            'matching_request',       // 메시지 타입
            null,                     // 파일 없음
            null,                     // 답장 없음
            matchingData              // 매칭 데이터 (Map 형태로 전달)
          );
          
          console.log('✅ 매칭 요청 메시지 전송 완료 (DB 저장 방식)');
        }
          
        setShowMatchingModal(false);
          
      } else {
        console.error('❌ 매칭 생성 실패:', result.message);
        alert(result.message || '매칭 요청 생성에 실패했습니다.');
      }
        
    } catch (error) {
      console.error('❌ 매칭 요청 중 오류:', error);
      alert('매칭 요청 중 오류가 발생했습니다.');
    } finally {
      setIsMatchingLoading(false);
    }
  };

  // 검색 모드 토글 함수
  const toggleSearchMode = useCallback(() => {
    setIsSearchMode(prev => {
      const newSearchMode = !prev;
      
      if (newSearchMode) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 0);
      } else {
        setSearchQuery('');
        setSearchResults([]);
        setCurrentResultIndex(-1);
        onSearchResults?.([]);
      }
      
      return newSearchMode;
    });
  }, [onSearchResults]);

  // 이미지 메시지도 original_filename으로 검색 가능하게 개선
  const performSearch = useCallback((query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setCurrentResultIndex(-1);
      onSearchResults?.([]);
      return;
    }

    const results = messages
      .filter(message => {
        if (message.message_content && 
            message.message_content !== '[이미지]' && 
            message.message_content.toLowerCase().includes(query.toLowerCase())) {
          return true;
        }
        
        if (message.message_type === 'image') {
          const attachment = attachments[message.message_idx];
          if (attachment && attachment.original_filename) {
            return attachment.original_filename.toLowerCase().includes(query.toLowerCase());
          }
        }
        
        return false;
      })
      .map((message, index) => ({
        ...message,
        resultIndex: index
      }));

    setSearchResults(results);
    setCurrentResultIndex(results.length > 0 ? 0 : -1);
    onSearchResults?.(results);
  }, [messages, attachments, onSearchResults]);

  // 디바운스된 검색어 변경 시 검색 수행
  useEffect(() => {
    if (isSearchMode) {
      performSearch(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, isSearchMode, performSearch]);

  // 다음/이전 검색 결과로 이동
  const navigateToResult = useCallback((direction) => {
    if (searchResults.length === 0) return;

    let newIndex;
    if (direction === 'next') {
      newIndex = currentResultIndex < searchResults.length - 1 
        ? currentResultIndex + 1 
        : 0;
    } else {
      newIndex = currentResultIndex > 0 
        ? currentResultIndex - 1 
        : searchResults.length - 1;
    }

    setCurrentResultIndex(newIndex);
    
    const targetMessage = searchResults[newIndex];
    if (targetMessage && onScrollToSearchResult) {
      onScrollToSearchResult(targetMessage.message_idx);
    }
  }, [searchResults, currentResultIndex, onScrollToSearchResult]);

  // 키보드 단축키 처리
  const handleKeyDown = useCallback((e) => {
    if (!isSearchMode) return;

    // eslint-disable-next-line default-case
    switch (e.key) {
      case 'Escape':
        toggleSearchMode();
        break;
      case 'Enter':
        if (e.shiftKey) {
          navigateToResult('prev');
        } else {
          navigateToResult('next');
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        navigateToResult('prev');
        break;
      case 'ArrowDown':
        e.preventDefault();
        navigateToResult('next');
        break;
    }
  }, [isSearchMode, toggleSearchMode, navigateToResult]);

  // 전역 키보드 이벤트 리스너
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <HeaderContainer>
      <HeaderContent>
        {/* 뒤로가기 버튼 */}
        <BackButton onClick={() => window.history.back()}>
          ←
        </BackButton>

        {/* 채팅방 이름과 매칭 버튼 */}
        <HeaderMain>
          {!isSearchMode ? (
            <>
              {/* 채팅방 이름 */}
              <RoomTitle>{roomDisplayName}</RoomTitle>
              
              {/* 매칭하기 버튼 */}
              {shouldShowMatchingButton && (
                <MatchingButton 
                  onClick={() => setShowMatchingModal(true)} 
                  disabled={isMatchingLoading}
                >
                  매칭하기
                </MatchingButton>
              )}
            </>
          ) : (
            /* 검색 모드: 검색바가 전체 공간 차지 */
            <SearchContainer>
              <SearchInput
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="메시지 검색..."
                autoComplete="off"
              />
              {searchResults.length > 0 && (
                <SearchResultCounter>
                  {currentResultIndex + 1} / {searchResults.length}
                </SearchResultCounter>
              )}
              <SearchNavigationButtons>
                <NavButton
                  onClick={() => navigateToResult('prev')}
                  disabled={searchResults.length === 0}
                  title="이전 결과 (↑)"
                >
                  ▲
                </NavButton>
                <NavButton
                  onClick={() => navigateToResult('next')}
                  disabled={searchResults.length === 0}
                  title="다음 결과 (↓)"
                >
                  ▼
                </NavButton>
              </SearchNavigationButtons>
            </SearchContainer>
          )}
        </HeaderMain>

        {/* 검색 토글 버튼 */}
        <SearchToggleButton
          onClick={toggleSearchMode}
          isActive={isSearchMode}
          aria-label={isSearchMode ? '검색 종료' : '메시지 검색'}
        >
          {isSearchMode ? ('✕') : (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
            >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
        )}
        </SearchToggleButton>
      </HeaderContent>

      {/* 매칭 모달 */}
      <MatchingModal
        isOpen={showMatchingModal}
        onClose={() => setShowMatchingModal(false)}
        onSubmit={handleMatchingRequest}
        isLoading={isMatchingLoading}
      />
    </HeaderContainer>
  );
};

export default ChatRoomHeader;