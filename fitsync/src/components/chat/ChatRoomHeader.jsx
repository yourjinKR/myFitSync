import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useDebounce } from 'use-debounce'; // npm install use-debounce

const HeaderContainer = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-light);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  padding: 15px 20px;
  gap: 15px;
  height: 60px; /* 고정 높이 설정 */
  min-height: 60px; /* 최소 높이 유지 */
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
  min-width: 0; /* flex 아이템이 줄어들 수 있도록 */
`;

const RoomTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 36px; /* SearchContainer와 동일한 높이 */
  display: flex;
  align-items: center; /* 수직 중앙 정렬 */
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-medium);
  border-radius: 20px;
  padding: 8px 12px;
  height: 36px; /* 고정 높이 설정 */
  box-sizing: border-box; /* 패딩과 보더 포함한 크기 계산 */
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
  width: 28px; /* 크기 조정 */
  height: 28px; /* 크기 조정 */
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  font-size: 1.2rem; /* 폰트 크기도 조정 */
  
  &:hover:not(:disabled) {
    background: var(--bg-primary);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/* SearchToggleButton - DOM prop 전달 방지 */
const SearchToggleButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'isActive'
})`
  background: var(--bg-secondary); /* 항상 동일한 배경색 */
  color: var(--text-primary);
  border: 1px solid var(--border-medium); /* 기본 테두리 색상 */
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
  
  /* 호버 시에만 파란 테두리 */
  &:hover {
    border-color: var(--primary-blue);
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(74, 144, 226, 0.3); /* 파란색 그림자 효과 */
  }
`;

const ChatRoomHeader = ({ roomDisplayName, onSearchResults, onScrollToSearchResult, messages = [], attachments = {} }) => {
  // 검색 관련 상태
  const [isSearchMode, setIsSearchMode] = useState(false); // 검색 모드 활성화 여부
  const [searchQuery, setSearchQuery] = useState(''); // 검색어
  const [searchResults, setSearchResults] = useState([]); // 검색 결과
  const [currentResultIndex, setCurrentResultIndex] = useState(-1); // 현재 선택된 검색 결과 인덱스
  
  const searchInputRef = useRef(null);
  
  // 디바운스된 검색어 (300ms 지연)
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);

  // 검색 모드 토글 함수
  const toggleSearchMode = useCallback(() => {
    setIsSearchMode(prev => {
      const newSearchMode = !prev;
      
      if (newSearchMode) {
        // 검색 모드 활성화 시
        console.log('🔍 검색 모드 활성화');
        // 다음 렌더링 후 input에 포커스
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 0);
      } else {
        // 검색 모드 비활성화 시
        console.log('❌ 검색 모드 비활성화');
        setSearchQuery('');
        setSearchResults([]);
        setCurrentResultIndex(-1);
        onSearchResults?.([]); // 부모 컴포넌트에 빈 결과 전달
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

    // 텍스트 메시지와 이미지 파일명 모두 검색
    const results = messages
      .filter(message => {
        // 1. 텍스트 메시지: message_content가 있고 '[이미지]'가 아닌 경우
        if (message.message_content && 
            message.message_content !== '[이미지]' && 
            message.message_content.toLowerCase().includes(query.toLowerCase())) {
          return true;
        }
        
        // 2. 이미지 메시지: original_filename으로 검색
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

    console.log(`🔍 검색 결과: "${query}" → ${results.length}개 발견 (텍스트 + 이미지 파일명)`);
  }, [messages, attachments, onSearchResults]);

  // 디바운스된 검색어 변경 시 검색 수행
  useEffect(() => {
    if (isSearchMode) {
      performSearch(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, isSearchMode, performSearch]);

  // 다음/이전 검색 결과로 이동 - 수정된 부분
  const navigateToResult = useCallback((direction) => {
    if (searchResults.length === 0) return;

    let newIndex;
    if (direction === 'next') {
      newIndex = currentResultIndex < searchResults.length - 1 
        ? currentResultIndex + 1 
        : 0; // 마지막에서 처음으로
    } else {
      newIndex = currentResultIndex > 0 
        ? currentResultIndex - 1 
        : searchResults.length - 1; // 처음에서 마지막으로
    }

    setCurrentResultIndex(newIndex);
    
    // 해당 메시지로 스크롤 - onScrollToSearchResult 사용
    const targetMessage = searchResults[newIndex];
    if (targetMessage && onScrollToSearchResult) {
      console.log('📍 검색 결과로 이동:', targetMessage.message_idx);
      onScrollToSearchResult(targetMessage.message_idx); // 부모 컴포넌트의 스크롤 함수 호출
    }
  }, [searchResults, currentResultIndex, onScrollToSearchResult]);

  // 키보드 단축키 처리
  const handleKeyDown = useCallback((e) => {
    if (!isSearchMode) return;

    switch (e.key) {
      case 'Escape':
        toggleSearchMode();
        break;
      case 'Enter':
        if (e.shiftKey) {
          navigateToResult('prev'); // Shift + Enter: 이전 결과
        } else {
          navigateToResult('next'); // Enter: 다음 결과
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

        {/* 채팅방 이름 또는 검색바 */}
        <HeaderMain>
          {!isSearchMode ? (
            // 일반 모드: 채팅방 이름 표시
            <RoomTitle>{roomDisplayName}</RoomTitle>
          ) : (
            // 검색 모드: 검색바 표시
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

    </HeaderContainer>
  );
};

export default ChatRoomHeader;