import React, { useState } from 'react';
import BasicMap from '../map/BasicMap';
import MapTest from '../map/MapTest';
import styled from 'styled-components';
import { ButtonSubmit } from '../../styles/FormStyles';
import { GymUtil } from '../../utils/GymUtils';
import { interpolate } from 'framer-motion';

const Container = styled.div`
  padding-left: 20px;
  padding-right: 20px;
  @media (max-width: 500px) {
    padding-left: 8px;
    padding-right: 8px;
  }
`;

const GymSearchContainer = styled.div`
  margin-bottom: 15px;
  border: 1.5px solid var(--border-light);
  border-radius: 10px;
  padding: 18px 12px 14px 12px;
  background: var(--bg-tertiary);
  box-shadow: 0 0.08rem 0.5rem rgba(74,144,226,0.08);
`;

const SearchForm = styled.form`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 10px 12px;
  border: 1.5px solid var(--border-medium);
  border-radius: 8px;
  font-size: 1.09rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  transition: border 0.18s, background 0.18s;
  &:focus {
    border: 1.5px solid var(--primary-blue);
    background: var(--bg-tertiary);
  }
  &::placeholder {
    color: var(--text-tertiary);
    opacity: 1;
  }
`;

const SearchButton = styled.button`
  padding: 10px 18px;
  background: linear-gradient(90deg, var(--primary-blue) 60%, var(--primary-blue-light) 100%);
  color: var(--text-primary);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.09rem;
  font-weight: 700;
  transition: background 0.18s;
  &:hover {
    background: var(--primary-blue-hover);
    color: #fff;
  }
  &:disabled {
    background: var(--border-medium);
    color: var(--text-tertiary);
    cursor: not-allowed;
  }
`;

const GymListContainer = styled.div`
  overflow-y: auto;
  border: 1.5px solid var(--border-light);
  border-radius: 8px;
  background: var(--bg-secondary);
  margin-top: 8px;
`;

const GymItem = styled.div`
  padding: 13px 10px 10px 10px;
  border-bottom: 1px solid var(--border-light);
  cursor: pointer;
  font-size: 1.09rem;
  background: var(--bg-tertiary);
  transition: background 0.18s;
  &:hover {
    background: var(--primary-blue-light);
  }
  &:last-child {
    border-bottom: none;
  }
  .gym-name {
    font-weight: bold;
    color: var(--primary-blue);
    margin-bottom: 2px;
    font-size: 1.09rem;
  }
  .gym-address {
    color: var(--text-secondary);
    font-size: 0.98rem;
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
  padding: 7px 13px;
  border: 1.5px solid var(--border-light);
  background: ${props => props.active ? 'var(--primary-blue)' : 'var(--bg-tertiary)'};
  color: ${props => props.active ? 'white' : 'var(--text-primary)'};
  border-radius: 7px;
  cursor: pointer;
  font-size: 1.01rem;
  font-weight: 600;
  transition: background 0.18s, color 0.18s;
  &:hover:not(:disabled) {
    background: ${props => props.active ? 'var(--primary-blue)' : 'var(--primary-blue-light)'};
    color: #fff;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const NoResults = styled.div`
  padding: 20px;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 1.01rem;
`;

const MapContainer = styled.div`
  width: 100%;
  height: 300px;
  margin-bottom: 10px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 0.08rem 0.5rem rgba(74,144,226,0.08);
  background: var(--bg-tertiary);
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
        <Container>
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
        </Container>
    );
};

export default TrainerMapContainer;