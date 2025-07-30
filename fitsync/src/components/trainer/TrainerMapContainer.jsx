import React, { useState } from 'react';
import BasicMap from '../map/BasicMap';
import MapTest from '../map/MapTest';
import styled from 'styled-components';
import { ButtonSubmit } from '../../styles/FormStyles';
import { GymUtil } from '../../utils/GymUtils';
import { interpolate } from 'framer-motion';

const MapContainer = styled.div`
  width: 100%;
  height: 300px;
  margin-bottom: 10px;
`;

const GymSearchContainer = styled.div`
  margin-bottom: 15px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 15px;
  background: var(--bg-secondary);
`;

const SearchForm = styled.form`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 8px;
  border: 1px solid var(--border-light);
  border-radius: 4px;
  font-size: 14px;
`;

const SearchButton = styled.button`
  padding: 8px 16px;
  background: var(--primary-blue);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background: var(--primary-blue-hover);
  }
`;

const GymListContainer = styled.div`
  overflow-y: auto;
  border: 1px solid var(--border-light);
  border-radius: 4px;
  background: white;
`;

const GymItem = styled.div`
  padding: 10px;
  border-bottom: 1px solid var(--border-light);
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background: var(--bg-tertiary);
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  .gym-name {
    font-weight: bold;
    color: var(--text-primary);
    margin-bottom: 2px;
  }
  
  .gym-address {
    color: var(--text-secondary);
    font-size: 12px;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  padding: 10px;
`;

const PageButton = styled.button`
  padding: 5px 10px;
  border: 1px solid var(--border-light);
  background: ${props => props.active ? 'var(--primary-blue)' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--text-primary)'};
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  
  &:hover:not(:disabled) {
    background: ${props => props.active ? 'var(--primary-blue)' : 'var(--bg-tertiary)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const NoResults = styled.div`
  padding: 20px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 14px;
`;

const TrainerMapContainer = ({gymInfo, isEdit, onChange}) => {
    const position = {lat : gymInfo?.gym_latitude, lng : gymInfo?.gym_longitude} || null;

    const [keyword, setKeyword] = useState('');
    const [gymList, setGymList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [isSearching, setIsSearching] = useState(false);
    const pageSize = 5; // 페이지당 5개씩 표시

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        if (!keyword.trim()) return;
        
        setCurrentPage(1);
        await searchGyms(1, keyword.trim());
    };

    const searchGyms = async (page, searchKeyword) => {
        try {
            setIsSearching(true);
            const response = await GymUtil.getGyms({
                keyword: searchKeyword,
                page: page,
                pageSize: pageSize
            });
            
            if (response.success && response.data) {
                setGymList(response.data);
                setTotalCount(response.totalCount || 0);
                setTotalPages(Math.ceil((response.totalCount || 0) / pageSize));
                setCurrentPage(page);
            } else {
                setGymList([]);
                setTotalCount(0);
                setTotalPages(1);
            }
        } catch (error) {
            console.error('체육관 검색 실패:', error);
            setGymList([]);
            setTotalCount(0);
            setTotalPages(1);
        } finally {
            setIsSearching(false);
        }
    };

    const handlePageChange = async (page) => {
        if (page >= 1 && page <= totalPages && keyword.trim()) {
            await searchGyms(page, keyword.trim());
        }
    };

    const handleGymSelect = (selectedGym) => {
        if (onChange) {
            // 상위 컴포넌트의 onChange 함수를 통해 선택된 체육관 정보 전달
            onChange('gymInfo', {
                gym_idx: selectedGym.gym_idx,
                gym_name: selectedGym.gym_name,
                gym_address: selectedGym.gym_address,
                gym_latitude: selectedGym.gym_latitude,
                gym_longitude: selectedGym.gym_longitude
            });
        }
        
        // 검색 결과 초기화
        setGymList([]);
        setKeyword('');
        setCurrentPage(1);
        setTotalPages(1);
        setTotalCount(0);
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const buttons = [];
        const maxVisible = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        // 이전 버튼
        buttons.push(
            <PageButton
                key="prev"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isSearching}
            >
                이전
            </PageButton>
        );

        // 페이지 번호들
        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <PageButton
                    key={i}
                    active={i === currentPage}
                    onClick={() => handlePageChange(i)}
                    disabled={isSearching}
                >
                    {i}
                </PageButton>
            );
        }

        // 다음 버튼
        buttons.push(
            <PageButton
                key="next"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isSearching}
            >
                다음
            </PageButton>
        );

        return (
            <PaginationContainer>
                {buttons}
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '10px' }}>
                    {totalCount}개 중 {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalCount)}개
                </span>
            </PaginationContainer>
        );
    };

    return (
        <div>
            <div>
                {/* 이름 */}
                {gymInfo?.gym_name}
            </div>
            <div>
                {/* 주소 */}
                {gymInfo?.gym_address}
            </div>
            {isEdit && (
                <GymSearchContainer>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--text-primary)' }}>
                        체육관 변경
                    </h4>
                    {/* 체육관 검색 */}
                    <SearchForm onSubmit={handleSearchSubmit}>
                        <SearchInput
                            type="text"
                            placeholder="체육관 이름을 입력하세요"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                        <SearchButton type="submit" disabled={isSearching}>
                            {isSearching ? '검색' : '검색'}
                        </SearchButton>
                    </SearchForm>
                    
                    {/* 체육관 검색 결과 */}
                    {gymList.length > 0 && (
                        <>
                            <GymListContainer>
                                {gymList.map((gym) => (
                                    <GymItem 
                                        key={gym.gym_idx}
                                        onClick={() => handleGymSelect(gym)}
                                    >
                                        <div className="gym-name">{gym.gym_name}</div>
                                        <div className="gym-address">{gym.gym_address}</div>
                                    </GymItem>
                                ))}
                            </GymListContainer>
                            {renderPagination()}
                        </>
                    )}
                    
                    {/* 검색 결과가 없을 때 */}
                    {keyword && gymList.length === 0 && !isSearching && (
                        <NoResults>
                            검색 결과가 없습니다.
                        </NoResults>
                    )}
                </GymSearchContainer>
            )}
            
            {gymInfo !== null ? (
                <MapContainer>
                    <MapTest position={position}/>
                </MapContainer>
            ) : (<></>)}
        </div>
    );
};

export default TrainerMapContainer;