import React from 'react';
import styled from 'styled-components';

// 스타일 컴포넌트 정의
const FilterContainer = styled.div`
    background: var(--bg-secondary);
    padding: 1.5rem;
    border-radius: 0.75rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    margin-bottom: 1.5rem;
    border: 1px solid var(--border-light);
    
    @media (max-width: 768px) {
        padding: 1.25rem;
        margin-bottom: 1.25rem;
    }
`;

const FilterTitle = styled.h4`
    font-size: 1.4rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    @media (max-width: 768px) {
        font-size: 1.3rem;
        margin-bottom: 1rem;
    }
`;

const FilterTagsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    
    @media (max-width: 768px) {
        gap: 0.75rem;
    }
`;

const FilterTag = styled.span`
    padding: 0.4rem 1rem;
    border-radius: 1rem;
    font-size: 1.2rem;
    font-weight: 500;
    white-space: nowrap;
    
    ${props => {
        switch (props.type) {
            case 'status':
                return `
                    background-color: var(--primary-blue-light);
                    color: var(--text-primary);
                `;
            case 'model':
                return `
                    background-color: var(--success);
                    color: var(--text-primary);
                `;
            case 'service':
                return `
                    background-color: #f59e0b;
                    color: var(--text-primary);
                `;
            case 'version':
                return `
                    background-color: #8b5cf6;
                    color: var(--text-primary);
                `;
            case 'search':
                return `
                    background-color: #a855f7;
                    color: var(--text-primary);
                `;
            case 'date':
                return `
                    background-color: var(--warning);
                    color: var(--text-primary);
                `;
            default:
                return `
                    background-color: var(--bg-tertiary);
                    color: var(--text-secondary);
                `;
        }
    }}
    
    @media (max-width: 768px) {
        padding: 0.45rem 1.1rem;
        font-size: 1.1rem;
    }
`;

const ClearButton = styled.button`
    padding: 0.4rem 1rem;
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    border: 1px solid var(--border-light);
    border-radius: 1rem;
    font-size: 1.2rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
        background: var(--bg-secondary);
        color: var(--text-primary);
    }
    
    @media (max-width: 768px) {
        padding: 0.45rem 1.1rem;
        font-size: 1.1rem;
    }
`;

/**
 * 적용된 필터 표시 컴포넌트
 * @param {Object} props
 * @param {Object} props.filters - 필터 상태들
 * @param {Function} props.clearAllFilters - 모든 필터 제거 함수
 */
const ActiveFilters = ({ filters, clearAllFilters }) => {
    const {
        filter,
        modelFilter,
        serviceFilter,
        versionFilter,
        searchTerm,
        dateRange
    } = filters;

    // 활성 필터가 있는지 확인
    const hasActiveFilters = (
        filter !== 'all' || 
        modelFilter !== 'all' || 
        serviceFilter !== 'all' || 
        versionFilter !== 'all' || 
        searchTerm || 
        dateRange.start || 
        dateRange.end
    );

    if (!hasActiveFilters) {
        return null;
    }

    const getStatusLabel = (status) => {
        switch (status) {
            case 'success': return '✅ 성공';
            case 'error': return '❌ 오류';
            case 'exception': return '⚠️ 예외';
            default: return status;
        }
    };

    return (
        <FilterContainer>
            <FilterTitle>
                🔍 현재 적용된 필터
            </FilterTitle>
            
            <FilterTagsContainer>
                {/* 상태 필터 */}
                {filter !== 'all' && (
                    <FilterTag type="status">
                        상태: {getStatusLabel(filter)}
                    </FilterTag>
                )}
                
                {/* 모델 필터 */}
                {modelFilter !== 'all' && (
                    <FilterTag type="model">
                        모델: {modelFilter}
                    </FilterTag>
                )}
                
                {/* 서비스 필터 */}
                {serviceFilter !== 'all' && (
                    <FilterTag type="service">
                        서비스: {serviceFilter}
                    </FilterTag>
                )}
                
                {/* 버전 필터 */}
                {versionFilter !== 'all' && (
                    <FilterTag type="version">
                        버전: v{versionFilter}
                    </FilterTag>
                )}
                
                {/* 검색어 필터 */}
                {searchTerm && (
                    <FilterTag type="search">
                        검색: "{searchTerm}"
                    </FilterTag>
                )}
                
                {/* 날짜 범위 필터 */}
                {(dateRange.start || dateRange.end) && (
                    <FilterTag type="date">
                        기간: {dateRange.start || '처음'} ~ {dateRange.end || '마지막'}
                    </FilterTag>
                )}
                
                {/* 모든 필터 제거 버튼 */}
                <ClearButton onClick={clearAllFilters}>
                    ❌ 모든 필터 제거
                </ClearButton>
            </FilterTagsContainer>
        </FilterContainer>
    );
};

export default ActiveFilters;
