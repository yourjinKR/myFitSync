import React from 'react';

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
        <div style={{ 
            background: 'white', 
            padding: '1rem', 
            borderRadius: '0.75rem', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
            marginBottom: '1.5rem',
            border: '1px solid #e5e7eb'
        }}>
            <h4 style={{ 
                fontSize: '0.9rem', 
                fontWeight: '600', 
                marginBottom: '0.75rem', 
                color: '#374151', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem' 
            }}>
                🔍 현재 적용된 필터
            </h4>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {/* 상태 필터 */}
                {filter !== 'all' && (
                    <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        background: '#dbeafe', 
                        color: '#1e40af', 
                        borderRadius: '1rem', 
                        fontSize: '0.75rem',
                        fontWeight: '500'
                    }}>
                        상태: {getStatusLabel(filter)}
                    </span>
                )}
                
                {/* 모델 필터 */}
                {modelFilter !== 'all' && (
                    <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        background: '#dcfce7', 
                        color: '#166534', 
                        borderRadius: '1rem', 
                        fontSize: '0.75rem',
                        fontWeight: '500'
                    }}>
                        모델: {modelFilter}
                    </span>
                )}
                
                {/* 서비스 필터 */}
                {serviceFilter !== 'all' && (
                    <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        background: '#fef3c7', 
                        color: '#92400e', 
                        borderRadius: '1rem', 
                        fontSize: '0.75rem',
                        fontWeight: '500'
                    }}>
                        서비스: {serviceFilter}
                    </span>
                )}
                
                {/* 버전 필터 */}
                {versionFilter !== 'all' && (
                    <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        background: '#ede9fe', 
                        color: '#7c3aed', 
                        borderRadius: '1rem', 
                        fontSize: '0.75rem',
                        fontWeight: '500'
                    }}>
                        버전: v{versionFilter}
                    </span>
                )}
                
                {/* 검색어 필터 */}
                {searchTerm && (
                    <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        background: '#f3e8ff', 
                        color: '#6b21a8', 
                        borderRadius: '1rem', 
                        fontSize: '0.75rem',
                        fontWeight: '500'
                    }}>
                        검색: "{searchTerm}"
                    </span>
                )}
                
                {/* 날짜 범위 필터 */}
                {(dateRange.start || dateRange.end) && (
                    <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        background: '#fecaca', 
                        color: '#991b1b', 
                        borderRadius: '1rem', 
                        fontSize: '0.75rem',
                        fontWeight: '500'
                    }}>
                        기간: {dateRange.start || '처음'} ~ {dateRange.end || '마지막'}
                    </span>
                )}
                
                {/* 모든 필터 제거 버튼 */}
                <button 
                    onClick={clearAllFilters}
                    style={{ 
                        padding: '0.25rem 0.75rem', 
                        background: '#f3f4f6', 
                        color: '#374151', 
                        border: '1px solid #d1d5db',
                        borderRadius: '1rem', 
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        cursor: 'pointer'
                    }}
                >
                    ❌ 모든 필터 제거
                </button>
            </div>
        </div>
    );
};

export default ActiveFilters;
