import React from 'react';
import styled from 'styled-components';
import { Button, Select } from '../../../styles/chartStyle';

/**
 * 필터 및 검색 패널 컴포넌트
 * @param {Object} props
 * @param {Object} props.filters - 필터 상태들
 * @param {Object} props.setFilters - 필터 상태 변경 함수들
 * @param {Array} props.apiLogs - 전체 API 로그 데이터
 * @param {boolean} props.loading - 로딩 상태
 * @param {Function} props.fetchApiLogs - API 로그 새로고침 함수
 */
const FilterPanel = ({ 
    filters, 
    setFilters, 
    apiLogs, 
    loading, 
    fetchApiLogs 
}) => {
    const {
        searchTerm, setSearchTerm,
        filter, setFilter,
        modelFilter, setModelFilter,
        serviceFilter, setServiceFilter,
        versionFilter, setVersionFilter,
        sortBy, setSortBy,
        dateRange, setDateRange
    } = filters;

    return (
        <FilterContainer>
            <FilterHeader>
                🔍 필터 및 검색
            </FilterHeader>
            
            <FilterGrid>
                {/* 검색어 */}
                <FilterGroup>
                    <FilterLabel>검색어</FilterLabel>
                    <SearchInput
                        type="text"
                        placeholder="ID, 모델명 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </FilterGroup>
                
                {/* 상태 필터 */}
                <FilterGroup>
                    <FilterLabel>상태</FilterLabel>
                    <StyledSelect value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="all">전체</option>
                        <option value="success">✅ 성공</option>
                        <option value="error">❌ 오류</option>
                        <option value="exception">⚠️ 예외</option>
                    </StyledSelect>
                </FilterGroup>
                
                {/* 모델 필터 */}
                <FilterGroup>
                    <FilterLabel>모델</FilterLabel>
                    <StyledSelect value={modelFilter} onChange={(e) => setModelFilter(e.target.value)}>
                        <option value="all">전체 모델</option>
                        {[...new Set(apiLogs.map(log => log.apilog_model).filter(Boolean))].map(model => (
                            <option key={model} value={model}>{model}</option>
                        ))}
                    </StyledSelect>
                </FilterGroup>
                
                {/* 서비스 필터 */}
                <FilterGroup>
                    <FilterLabel>서비스</FilterLabel>
                    <StyledSelect value={serviceFilter} onChange={(e) => {
                        setServiceFilter(e.target.value);
                        setVersionFilter('all'); // 서비스 변경 시 버전 필터 초기화
                    }}>
                        <option value="all">전체 서비스</option>
                        {[...new Set(apiLogs.map(log => log.apilog_service_type).filter(Boolean))].map(service => (
                            <option key={service} value={service}>{service}</option>
                        ))}
                    </StyledSelect>
                </FilterGroup>
                
                {/* 버전 필터 */}
                <FilterGroup>
                    <FilterLabel>버전</FilterLabel>
                    <StyledSelect value={versionFilter} onChange={(e) => setVersionFilter(e.target.value)}>
                        <option value="all">전체 버전</option>
                        {[...new Set(
                            apiLogs
                                .filter(log => serviceFilter === 'all' || log.apilog_service_type === serviceFilter)
                                .map(log => log.apilog_version)
                                .filter(Boolean)
                        )]
                        .sort((a, b) => {
                            const aParts = a.split('.').map(Number);
                            const bParts = b.split('.').map(Number);
                            for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
                                const aPart = aParts[i] || 0;
                                const bPart = bParts[i] || 0;
                                if (aPart !== bPart) return bPart - aPart;
                            }
                            return 0;
                        })
                        .map(version => (
                            <option key={version} value={version}>
                                v{version}
                                {serviceFilter !== 'all' && (
                                    ` (${apiLogs.filter(log => 
                                        log.apilog_service_type === serviceFilter && 
                                        log.apilog_version === version
                                    ).length}건)`
                                )}
                            </option>
                        ))}
                    </StyledSelect>
                </FilterGroup>
                
                {/* 정렬 */}
                <FilterGroup>
                    <FilterLabel>정렬</FilterLabel>
                    <StyledSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="newest">최신순</option>
                        <option value="oldest">오래된순</option>
                        <option value="tokens">토큰순</option>
                        <option value="time">응답시간순</option>
                    </StyledSelect>
                </FilterGroup>
                
                {/* 시작일 */}
                <FilterGroup>
                    <FilterLabel>시작일</FilterLabel>
                    <DateInput
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    />
                </FilterGroup>
                
                {/* 종료일 */}
                <FilterGroup>
                    <FilterLabel>종료일</FilterLabel>
                    <DateInput
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    />
                </FilterGroup>
                
                {/* 새로고침 버튼 */}
                <RefreshButtonGroup>
                    <RefreshButton onClick={fetchApiLogs} disabled={loading}>
                        {loading ? '🔄 로딩 중...' : '🔄 새로고침'}
                    </RefreshButton>
                </RefreshButtonGroup>
            </FilterGrid>
        </FilterContainer>
    );
};

// Styled Components
const FilterContainer = styled.div`
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  margin-bottom: 2rem;
  border: 1px solid var(--border-light);
`;

const FilterHeader = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-primary);
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const FilterLabel = styled.label`
  display: block;
  font-size: 1.5rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
  font-weight: 500;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-light);
  border-radius: 0.375rem;
  font-size: 1.5rem;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: var(--primary-blue);
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.1);
  }
  
  &::placeholder {
    color: var(--text-tertiary);
  }
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-light);
  border-radius: 0.375rem;
  font-size: 1.5rem;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: var(--primary-blue);
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.1);
  }
  
  option {
    background: var(--bg-tertiary);
    color: var(--text-primary);
  }
`;

const DateInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-light);
  border-radius: 0.375rem;
  font-size: 1.5rem;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: var(--primary-blue);
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.1);
  }
`;

const RefreshButtonGroup = styled.div`
  display: flex;
  align-items: end;
`;

const RefreshButton = styled.button`
  width: 100%;
  padding: 0.5rem 1rem;
  background: var(--primary-blue);
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 1.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: var(--primary-blue-hover);
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

export default FilterPanel;
