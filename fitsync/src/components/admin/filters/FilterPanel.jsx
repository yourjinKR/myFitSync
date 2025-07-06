import React from 'react';
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
        <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '0.75rem', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
            marginBottom: '2rem' 
        }}>
            <h3 style={{ 
                fontSize: '1rem', 
                fontWeight: '600', 
                marginBottom: '1rem', 
                color: '#374151' 
            }}>
                🔍 필터 및 검색
            </h3>
            
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '1rem' 
            }}>
                {/* 검색어 */}
                <div>
                    <label style={{ 
                        display: 'block', 
                        fontSize: '0.875rem', 
                        color: '#6b7280', 
                        marginBottom: '0.25rem' 
                    }}>
                        검색어
                    </label>
                    <input
                        type="text"
                        placeholder="ID, 모델명 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem'
                        }}
                    />
                </div>
                
                {/* 상태 필터 */}
                <div>
                    <label style={{ 
                        display: 'block', 
                        fontSize: '0.875rem', 
                        color: '#6b7280', 
                        marginBottom: '0.25rem' 
                    }}>
                        상태
                    </label>
                    <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="all">전체</option>
                        <option value="success">✅ 성공</option>
                        <option value="error">❌ 오류</option>
                        <option value="exception">⚠️ 예외</option>
                    </Select>
                </div>
                
                {/* 모델 필터 */}
                <div>
                    <label style={{ 
                        display: 'block', 
                        fontSize: '0.875rem', 
                        color: '#6b7280', 
                        marginBottom: '0.25rem' 
                    }}>
                        모델
                    </label>
                    <Select value={modelFilter} onChange={(e) => setModelFilter(e.target.value)}>
                        <option value="all">전체 모델</option>
                        {[...new Set(apiLogs.map(log => log.apilog_model).filter(Boolean))].map(model => (
                            <option key={model} value={model}>{model}</option>
                        ))}
                    </Select>
                </div>
                
                {/* 서비스 필터 */}
                <div>
                    <label style={{ 
                        display: 'block', 
                        fontSize: '0.875rem', 
                        color: '#6b7280', 
                        marginBottom: '0.25rem' 
                    }}>
                        서비스
                    </label>
                    <Select value={serviceFilter} onChange={(e) => {
                        setServiceFilter(e.target.value);
                        setVersionFilter('all'); // 서비스 변경 시 버전 필터 초기화
                    }}>
                        <option value="all">전체 서비스</option>
                        {[...new Set(apiLogs.map(log => log.apilog_service_type).filter(Boolean))].map(service => (
                            <option key={service} value={service}>{service}</option>
                        ))}
                    </Select>
                </div>
                
                {/* 버전 필터 */}
                <div>
                    <label style={{ 
                        display: 'block', 
                        fontSize: '0.875rem', 
                        color: '#6b7280', 
                        marginBottom: '0.25rem' 
                    }}>
                        버전
                    </label>
                    <Select value={versionFilter} onChange={(e) => setVersionFilter(e.target.value)}>
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
                    </Select>
                </div>
                
                {/* 정렬 */}
                <div>
                    <label style={{ 
                        display: 'block', 
                        fontSize: '0.875rem', 
                        color: '#6b7280', 
                        marginBottom: '0.25rem' 
                    }}>
                        정렬
                    </label>
                    <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="newest">🆕 최신순</option>
                        <option value="oldest">📅 오래된순</option>
                        <option value="tokens">🪙 토큰순</option>
                        <option value="time">⏱️ 응답시간순</option>
                    </Select>
                </div>
                
                {/* 시작일 */}
                <div>
                    <label style={{ 
                        display: 'block', 
                        fontSize: '0.875rem', 
                        color: '#6b7280', 
                        marginBottom: '0.25rem' 
                    }}>
                        시작일
                    </label>
                    <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem'
                        }}
                    />
                </div>
                
                {/* 종료일 */}
                <div>
                    <label style={{ 
                        display: 'block', 
                        fontSize: '0.875rem', 
                        color: '#6b7280', 
                        marginBottom: '0.25rem' 
                    }}>
                        종료일
                    </label>
                    <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem'
                        }}
                    />
                </div>
                
                {/* 새로고침 버튼 */}
                <div style={{ display: 'flex', alignItems: 'end' }}>
                    <Button onClick={fetchApiLogs} disabled={loading} style={{ width: '100%' }}>
                        {loading ? '🔄 로딩 중...' : '🔄 새로고침'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default FilterPanel;
