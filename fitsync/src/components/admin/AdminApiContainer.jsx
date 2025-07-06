import React, { useState, useEffect } from 'react';
import { Container, Inner, Title, Button, Select, StatCard, StatTitle, StatValue, Table, Th, Td, StatusTag, ModalOverlay, ModalContent, Section, SectionTitle, RoutineCard, DetailModalHeader, DetailModalTitle, DetailModalSubtitle, DetailModalCloseButton, NavigationContainer, NavigationButton, NavigationInfo, FilteredResultInfo, MetaInfoGrid, MetaInfoItem, MetaInfoLabel, MetaInfoValue, MetaInfoSubValue, FeedbackContainer, FeedbackIcon, FeedbackText, FeedbackReason, UserRequestContainer, UserRequestGrid, UserRequestItem, UserRequestKey, UserRequestValue, SplitMatchBadge, MonospaceContent, RoutineContainer, RoutineHeader, RoutineTitle, RoutineBadge, ExerciseGrid, ExerciseItem, ExerciseIcon, ExerciseContent, ExerciseName, ExerciseDetails, SimilarExercise, InvalidExerciseBadge, ErrorContainer } from '../../styles/chartStyle';
import { getSimilarNamesByMap } from '../../utils/KorUtil';
import { useApiLogs } from '../../hooks/admin/useApiLogs';
import { useWorkoutNames } from '../../hooks/admin/useWorkoutNames';
import { useFilters } from '../../hooks/admin/useFilters';
import { useStatistics } from '../../hooks/admin/useStatistics';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title as ChartTitle, Tooltip, Legend, ArcElement, Filler } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Chart.js 컴포넌트 등록
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ChartTitle,
    Tooltip,
    Legend,
    ArcElement,
    Filler
);

const AdminApiContainer = () => {
    // API 로그 관련 상태 (커스텀 훅 사용)
    const { apiLogs, loading, fetchApiLogs } = useApiLogs();
    
    // 운동명 관련 상태 (커스텀 훅 사용)
    const { rawData, rawDataMap } = useWorkoutNames();
    
    // 필터링 관련 상태 (커스텀 훅 사용)
    const {
        filter, setFilter,
        dateRange, setDateRange,
        modelFilter, setModelFilter,
        serviceFilter, setServiceFilter,
        versionFilter, setVersionFilter,
        sortBy, setSortBy,
        searchTerm, setSearchTerm,
        filteredLogs
    } = useFilters(apiLogs);
    // 통계 계산 (커스텀 훅 사용)
    const stats = useStatistics(apiLogs, filteredLogs);
    
    // 기타 상태값 관리
    const [selectedLog, setSelectedLog] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [refreshInterval, setRefreshInterval] = useState(null);

    const handleSelectedLog = (direction) => {
        const currentIndex = filteredLogs.findIndex(log => log.apilog_idx === selectedLog?.apilog_idx);
        const newIndex = currentIndex + direction;
        if (newIndex >= 0 && newIndex < filteredLogs.length) {
            setSelectedLog(filteredLogs[newIndex]);
        }
    };

    // 자동 새로고침 기능
    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(() => {
                fetchApiLogs();
            }, 30000); // 30초마다
            setRefreshInterval(interval);
            return () => clearInterval(interval);
        } else if (refreshInterval) {
            clearInterval(refreshInterval);
            setRefreshInterval(null);
        }
    }, [autoRefresh, refreshInterval, fetchApiLogs]); // fetchApiLogs 의존성 추가

    // 컴포넌트 언마운트 시 인터벌 정리
    useEffect(() => {
        return () => {
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
        };
    }, [refreshInterval]);

    return (
        <Container>
            <Inner>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <Title>🚀 API 모니터링 대시보드</Title>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                            <input 
                                type="checkbox" 
                                checked={autoRefresh} 
                                onChange={(e) => setAutoRefresh(e.target.checked)} 
                            />
                            자동 새로고침 (30초)
                        </label>
                    </div>
                </div>

                {/* 탭 네비게이션 */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid #e5e7eb' }}>
                    {[
                        { id: 'overview', label: '📊 개요', icon: '📊' },
                        { id: 'analytics', label: '📈 분석', icon: '📈' },
                        { id: 'logs', label: '📋 로그', icon: '📋' },
                        { id: 'performance', label: '⚡ 성능', icon: '⚡' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '0.75rem 1.5rem',
                                border: 'none',
                                background: activeTab === tab.id ? '#4f46e5' : 'transparent',
                                color: activeTab === tab.id ? 'white' : '#6b7280',
                                borderRadius: '0.5rem 0.5rem 0 0',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: activeTab === tab.id ? '600' : '400',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* 필터 및 검색 영역 */}
                <div style={{ 
                    background: 'white', 
                    padding: '1.5rem', 
                    borderRadius: '0.75rem', 
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
                    marginBottom: '2rem' 
                }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>🔍 필터 및 검색</h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>검색어</label>
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
                        
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>상태</label>
                            <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
                                <option value="all">전체</option>
                                <option value="success">✅ 성공</option>
                                <option value="error">❌ 오류</option>
                                <option value="exception">⚠️ 예외</option>
                            </Select>
                        </div>
                        
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>모델</label>
                            <Select value={modelFilter} onChange={(e) => setModelFilter(e.target.value)}>
                                <option value="all">전체 모델</option>
                                {[...new Set(apiLogs.map(log => log.apilog_model).filter(Boolean))].map(model => (
                                    <option key={model} value={model}>{model}</option>
                                ))}
                            </Select>
                        </div>
                        
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>서비스</label>
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
                        
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>버전</label>
                            <Select value={versionFilter} onChange={(e) => setVersionFilter(e.target.value)}>
                                <option value="all">전체 버전</option>
                                {[...new Set(
                                    apiLogs
                                        .filter(log => serviceFilter === 'all' || log.apilog_service_type === serviceFilter)
                                        .map(log => log.apilog_version)
                                        .filter(Boolean)
                                )]
                                .sort((a, b) => {
                                    // 버전을 숫자로 정렬 (0.0.1, 0.0.2, ..., 0.1.0, 0.1.1)
                                    const parseVersion = (v) => {
                                        const parts = v.split('.').map(Number);
                                        return parts[0] * 10000 + parts[1] * 100 + parts[2];
                                    };
                                    return parseVersion(b) - parseVersion(a); // 최신 버전 먼저
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
                        
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>정렬</label>
                            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value="newest">🆕 최신순</option>
                                <option value="oldest">📅 오래된순</option>
                                <option value="tokens">🪙 토큰순</option>
                                <option value="time">⏱️ 응답시간순</option>
                            </Select>
                        </div>
                        
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>시작일</label>
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
                        
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>종료일</label>
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
                        
                        <div style={{ display: 'flex', alignItems: 'end' }}>
                            <Button onClick={fetchApiLogs} disabled={loading} style={{ width: '100%' }}>
                                {loading ? '🔄 로딩 중...' : '🔄 새로고침'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 현재 적용된 필터 - 모든 탭에서 표시 */}
                {(filter !== 'all' || modelFilter !== 'all' || serviceFilter !== 'all' || versionFilter !== 'all' || 
                searchTerm || dateRange.start || dateRange.end) && (
                    <div style={{ 
                        background: 'white', 
                        padding: '1rem', 
                        borderRadius: '0.75rem', 
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
                        marginBottom: '1.5rem',
                        border: '1px solid #e5e7eb'
                    }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.75rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            🔍 현재 적용된 필터
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {filter !== 'all' && (
                                <span style={{ 
                                    padding: '0.25rem 0.75rem', 
                                    background: '#dbeafe', 
                                    color: '#1e40af', 
                                    borderRadius: '1rem', 
                                    fontSize: '0.75rem',
                                    fontWeight: '500'
                                }}>
                                    상태: {filter === 'success' ? '✅ 성공' : filter === 'error' ? '❌ 오류' : '⚠️ 예외'}
                                </span>
                            )}
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
                            <button 
                                onClick={() => {
                                    setFilter('all');
                                    setModelFilter('all');
                                    setServiceFilter('all');
                                    setVersionFilter('all');
                                    setSearchTerm('');
                                    setDateRange({ start: '', end: '' });
                                }}
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
                )}

                {/* 탭별 컨텐츠 */}
                {activeTab === 'overview' && stats && (
                    <>

                        {/* 주요 지표 카드 */}
                        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '2rem' }}>
                            <StatCard style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                <StatTitle style={{ color: 'white' }}>📊 총 요청 수</StatTitle>
                                <StatValue color="white">{stats.totalRequests.toLocaleString()}</StatValue>
                                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>
                                    전체 {stats.totalApiCalls.toLocaleString()}건 중 필터된 결과
                                </div>
                            </StatCard>
                            
                            <StatCard style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                                <StatTitle style={{ color: 'white' }}>✅ 성공률</StatTitle>
                                <StatValue color="white">{stats.successRate}%</StatValue>
                                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>
                                    성공: {stats.successCount} | 오류: {stats.errorCount} | 예외: {stats.exceptionCount}
                                </div>
                            </StatCard>
                            
                            <StatCard style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                                <StatTitle style={{ color: 'white' }}>💬 토큰 사용량</StatTitle>
                                <StatValue color="white">{stats.totalTokens.toLocaleString()}</StatValue>
                                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>
                                    평균: {stats.avgTokens} | 입력: {stats.totalInputTokens.toLocaleString()} | 출력: {stats.totalOutputTokens.toLocaleString()}
                                </div>
                            </StatCard>
                            
                            <StatCard style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                                <StatTitle style={{ color: 'white' }}>⚡ 응답시간</StatTitle>
                                <StatValue color="white">{stats.avgResponseTime}초</StatValue>
                                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>
                                    총 시간: {stats.totalTime}초 | 고유 사용자: {stats.uniqueUsers}명
                                </div>
                            </StatCard>
                        </div>

                        {/* 피드백 통계 */}
                        {stats.feedbackStats.total > 0 && (
                            <div style={{ 
                                background: 'white', 
                                padding: '1.5rem', 
                                borderRadius: '0.75rem', 
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
                                marginBottom: '2rem' 
                            }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
                                    💬 사용자 피드백 ({stats.feedbackStats.total}건)
                                </h3>
                                <div style={{ display: 'flex', gap: '2rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <span style={{ fontSize: '1.5rem' }}>👍</span>
                                            <span style={{ fontWeight: '600' }}>좋아요</span>
                                        </div>
                                        <div style={{ 
                                            background: '#10b981', 
                                            height: '0.5rem', 
                                            borderRadius: '0.25rem',
                                            width: `${(stats.feedbackStats.like / stats.feedbackStats.total) * 100}%`,
                                            minWidth: '2rem'
                                        }}></div>
                                        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                            {stats.feedbackStats.like}건 ({((stats.feedbackStats.like / stats.feedbackStats.total) * 100).toFixed(1)}%)
                                        </div>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <span style={{ fontSize: '1.5rem' }}>👎</span>
                                            <span style={{ fontWeight: '600' }}>싫어요</span>
                                        </div>
                                        <div style={{ 
                                            background: '#ef4444', 
                                            height: '0.5rem', 
                                            borderRadius: '0.25rem',
                                            width: `${(stats.feedbackStats.dislike / stats.feedbackStats.total) * 100}%`,
                                            minWidth: '2rem'
                                        }}></div>
                                        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                            {stats.feedbackStats.dislike}건 ({((stats.feedbackStats.dislike / stats.feedbackStats.total) * 100).toFixed(1)}%)
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 서비스별 버전 현황 */}
                        <div style={{ 
                            background: 'white', 
                            padding: '1.5rem', 
                            borderRadius: '0.75rem', 
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
                            marginBottom: '2rem' 
                        }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
                                🔧 서비스별 버전 현황
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                {Object.entries(
                                    filteredLogs.reduce((acc, log) => {
                                        const service = log.apilog_service_type || '기타';
                                        const version = log.apilog_version || '알 수 없음';
                                        
                                        if (!acc[service]) {
                                            acc[service] = {};
                                        }
                                        
                                        if (!acc[service][version]) {
                                            acc[service][version] = {
                                                count: 0,
                                                successCount: 0,
                                                totalTime: 0,
                                                totalTokens: 0
                                            };
                                        }
                                        
                                        acc[service][version].count += 1;
                                        if (log.apilog_status === 'success') {
                                            acc[service][version].successCount += 1;
                                        }
                                        acc[service][version].totalTime += log.apilog_total_time || 0;
                                        acc[service][version].totalTokens += (log.apilog_input_tokens || 0) + (log.apilog_output_tokens || 0);
                                        
                                        return acc;
                                    }, {})
                                ).map(([service, versions]) => (
                                    <div key={service} style={{
                                        background: '#f9fafb',
                                        padding: '1rem',
                                        borderRadius: '0.5rem',
                                        border: '1px solid #e5e7eb'
                                    }}>
                                        <h4 style={{ 
                                            fontSize: '1rem', 
                                            fontWeight: '600', 
                                            marginBottom: '0.75rem', 
                                            color: '#374151',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            🎯 {service}
                                            <span style={{ 
                                                fontSize: '0.75rem', 
                                                background: '#e5e7eb', 
                                                color: '#6b7280', 
                                                padding: '0.125rem 0.5rem', 
                                                borderRadius: '0.75rem' 
                                            }}>
                                                {Object.keys(versions).length}개 버전
                                            </span>
                                        </h4>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {Object.entries(versions)
                                                .sort(([a], [b]) => {
                                                    // 버전을 숫자로 정렬 (최신 버전 먼저)
                                                    const parseVersion = (v) => {
                                                        const parts = v.split('.').map(Number);
                                                        return parts[0] * 10000 + parts[1] * 100 + parts[2];
                                                    };
                                                    return parseVersion(b) - parseVersion(a);
                                                })
                                                .slice(0, 5) // 최신 5개 버전만 표시
                                                .map(([version, data]) => {
                                                    const successRate = ((data.successCount / data.count) * 100).toFixed(1);
                                                    const avgResponseTime = (data.totalTime / data.count).toFixed(2);
                                                    const avgTokens = Math.round(data.totalTokens / data.count);
                                                    
                                                    return (
                                                        <div key={version} style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            padding: '0.5rem',
                                                            background: 'white',
                                                            borderRadius: '0.375rem',
                                                            fontSize: '0.875rem'
                                                        }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <span style={{ 
                                                                    fontWeight: '600', 
                                                                    color: version.startsWith('0.1') ? '#7c3aed' : '#2563eb' 
                                                                }}>
                                                                    v{version}
                                                                </span>
                                                                <span style={{ 
                                                                    fontSize: '0.75rem', 
                                                                    color: '#6b7280',
                                                                    background: '#f3f4f6',
                                                                    padding: '0.125rem 0.375rem',
                                                                    borderRadius: '0.375rem'
                                                                }}>
                                                                    {data.count}건
                                                                </span>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem' }}>
                                                                <span style={{ 
                                                                    color: successRate >= 95 ? '#10b981' : successRate >= 85 ? '#f59e0b' : '#ef4444',
                                                                    fontWeight: '500'
                                                                }}>
                                                                    {successRate}%
                                                                </span>
                                                                <span style={{ color: '#6b7280' }}>
                                                                    {avgResponseTime}초
                                                                </span>
                                                                <span style={{ color: '#6b7280' }}>
                                                                    {avgTokens.toLocaleString()}토큰
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            {Object.keys(versions).length > 5 && (
                                                <div style={{ 
                                                    textAlign: 'center', 
                                                    color: '#6b7280', 
                                                    fontSize: '0.75rem', 
                                                    marginTop: '0.25rem' 
                                                }}>
                                                    ... 및 {Object.keys(versions).length - 5}개 더
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'analytics' && stats && (
                    <>
                        {/* 모델별 분석 */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>🤖 모델별 사용량</h3>
                                {Object.entries(stats.modelCounts).map(([model, count]) => (
                                    <div key={model} style={{ marginBottom: '0.75rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                            <span style={{ fontWeight: '500' }}>{model}</span>
                                            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{count}건</span>
                                        </div>
                                        <div style={{ background: '#f3f4f6', height: '0.5rem', borderRadius: '0.25rem', overflow: 'hidden' }}>
                                            <div style={{ 
                                                background: model.includes('gpt-4') ? '#8b5cf6' : '#06b6d4', 
                                                height: '100%', 
                                                width: `${(count / Math.max(...Object.values(stats.modelCounts))) * 100}%`,
                                                transition: 'width 0.3s ease'
                                            }}></div>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                            평균 토큰: {stats.avgTokensPerModel[model]} | 평균 시간: {stats.avgTimePerModel[model]}초
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>🎯 서비스별 성공률</h3>
                                {Object.entries(stats.serviceSuccessRates).map(([service, rates]) => {
                                    const successRate = (rates.success / rates.total * 100).toFixed(1);
                                    return (
                                        <div key={service} style={{ marginBottom: '0.75rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                                <span style={{ fontWeight: '500' }}>{service}</span>
                                                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{successRate}%</span>
                                            </div>
                                            <div style={{ background: '#f3f4f6', height: '0.5rem', borderRadius: '0.25rem', overflow: 'hidden' }}>
                                                <div style={{ 
                                                    background: successRate > 90 ? '#10b981' : successRate > 70 ? '#f59e0b' : '#ef4444', 
                                                    height: '100%', 
                                                    width: `${successRate}%`,
                                                    transition: 'width 0.3s ease'
                                                }}></div>
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                                성공: {rates.success}/{rates.total}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 버전별 상세 분석 */}
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>📦 버전별 상세 분석</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                                {Object.entries(stats.versionStats || {})
                                    .sort(([a], [b]) => {
                                        // 버전을 숫자로 정렬 (0.0.1, 0.0.2, ..., 0.1.0, 0.1.1)
                                        const parseVersion = (v) => {
                                            const parts = v.split('.').map(Number);
                                            return parts[0] * 10000 + parts[1] * 100 + parts[2];
                                        };
                                        return parseVersion(b) - parseVersion(a); // 최신 버전 먼저
                                    })
                                    .map(([version, data]) => (
                                    <div key={version} style={{
                                        padding: '1rem',
                                        background: '#f9fafb',
                                        borderRadius: '0.5rem',
                                        border: '1px solid #e5e7eb'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                            <span style={{ 
                                                fontWeight: '600', 
                                                fontSize: '1rem',
                                                color: '#374151'
                                            }}>
                                                v{version}
                                            </span>
                                            <span style={{ 
                                                background: data.successRate >= 95 ? '#10b981' : data.successRate >= 85 ? '#f59e0b' : '#ef4444', 
                                                color: 'white', 
                                                padding: '0.25rem 0.5rem', 
                                                borderRadius: '0.375rem',
                                                fontSize: '0.75rem',
                                                fontWeight: '500'
                                            }}>
                                                {data.successRate}% 성공률
                                            </span>
                                        </div>
                                        
                                        <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.875rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: '#6b7280' }}>총 호출:</span>
                                                <span style={{ fontWeight: '500' }}>{data.count}건</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: '#6b7280' }}>평균 응답시간:</span>
                                                <span style={{ fontWeight: '500' }}>{data.avgResponseTime}초</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: '#6b7280' }}>평균 토큰:</span>
                                                <span style={{ fontWeight: '500' }}>{data.avgTokens.toLocaleString()}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: '#6b7280' }}>총 토큰:</span>
                                                <span style={{ fontWeight: '500' }}>{data.totalTokens.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        {/* 성능 지표 바 */}
                                        <div style={{ marginTop: '0.75rem' }}>
                                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                                                성능 점수: {Math.round((data.successRate * 0.4) + ((5 - Math.min(data.avgResponseTime, 5)) * 20 * 0.3) + (Math.min(data.count, 100) * 0.3))}점
                                            </div>
                                            <div style={{ background: '#e5e7eb', height: '0.5rem', borderRadius: '0.25rem', overflow: 'hidden' }}>
                                                <div style={{ 
                                                    background: data.successRate >= 95 && data.avgResponseTime <= 2 ? '#10b981' : 
                                                               data.successRate >= 85 && data.avgResponseTime <= 3 ? '#f59e0b' : '#ef4444', 
                                                    height: '100%', 
                                                    width: `${Math.min(100, Math.round((data.successRate * 0.4) + ((5 - Math.min(data.avgResponseTime, 5)) * 20 * 0.3) + (Math.min(data.count, 100) * 0.3)))}%`,
                                                    transition: 'width 0.3s ease'
                                                }}></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'performance' && stats && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                        {/* 1. 시간대별 API 사용량 - Line Chart */}
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                ⏰ 시간대별 API 사용량 (최근 24시간)
                            </h3>
                            <div style={{ height: '300px' }}>
                                <Line
                                    data={{
                                        labels: stats.hourlyData.map((_, index) => {
                                            const hour = (new Date().getHours() - 23 + index + 24) % 24;
                                            return `${hour}시`;
                                        }),
                                        datasets: [{
                                            label: 'API 호출 횟수',
                                            data: stats.hourlyData,
                                            borderColor: '#6366f1',
                                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                            borderWidth: 3,
                                            fill: true,
                                            tension: 0.4,
                                            pointBackgroundColor: '#6366f1',
                                            pointBorderColor: '#ffffff',
                                            pointBorderWidth: 2,
                                            pointRadius: 5,
                                            pointHoverRadius: 7
                                        }]
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                display: false
                                            },
                                            tooltip: {
                                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                                titleColor: '#ffffff',
                                                bodyColor: '#ffffff',
                                                borderColor: '#6366f1',
                                                borderWidth: 1
                                            }
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                grid: {
                                                    color: 'rgba(0,0,0,0.1)'
                                                },
                                                ticks: {
                                                    color: '#6b7280'
                                                }
                                            },
                                            x: {
                                                grid: {
                                                    display: false
                                                },
                                                ticks: {
                                                    color: '#6b7280'
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280', textAlign: 'center', marginTop: '1rem', background: '#f9fafb', padding: '0.5rem', borderRadius: '0.375rem' }}>
                                총 {stats.hourlyData.reduce((sum, count) => sum + count, 0)}건의 API 호출
                            </div>
                        </div>

                        {/* 2. 모델별 성능 비교 - Bar + Line Chart */}
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                🤖 모델별 성능 비교
                            </h3>
                            <div style={{ height: '300px' }}>
                                <Bar
                                    data={{
                                        labels: Object.keys(stats.modelStats || {}),
                                        datasets: [
                                            {
                                                label: '호출 횟수',
                                                data: Object.values(stats.modelStats || {}).map(stat => stat.count),
                                                backgroundColor: 'rgba(34, 197, 94, 0.7)',
                                                borderColor: '#22c55e',
                                                borderWidth: 1,
                                                yAxisID: 'y'
                                            },
                                            {
                                                type: 'line',
                                                label: '평균 응답시간 (초)',
                                                data: Object.values(stats.modelStats || {}).map(stat => stat.avgResponseTime),
                                                borderColor: '#f59e0b',
                                                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                                borderWidth: 3,
                                                tension: 0.4,
                                                yAxisID: 'y1'
                                            }
                                        ]
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'top',
                                                labels: {
                                                    boxWidth: 12,
                                                    font: {
                                                        size: 12
                                                    }
                                                }
                                            },
                                            tooltip: {
                                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                                titleColor: '#ffffff',
                                                bodyColor: '#ffffff'
                                            }
                                        },
                                        scales: {
                                            y: {
                                                type: 'linear',
                                                display: true,
                                                position: 'left',
                                                beginAtZero: true,
                                                title: {
                                                    display: true,
                                                    text: '호출 횟수',
                                                    color: '#6b7280'
                                                },
                                                ticks: {
                                                    color: '#6b7280'
                                                }
                                            },
                                            y1: {
                                                type: 'linear',
                                                display: true,
                                                position: 'right',
                                                title: {
                                                    display: true,
                                                    text: '응답시간 (초)',
                                                    color: '#6b7280'
                                                },
                                                ticks: {
                                                    color: '#6b7280'
                                                },
                                                grid: {
                                                    drawOnChartArea: false,
                                                }
                                            },
                                            x: {
                                                ticks: {
                                                    color: '#6b7280'
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* 3. 서비스별 성공률 - Doughnut Chart */}
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                ✅ 서비스별 성공률
                            </h3>
                            <div style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Doughnut
                                    data={{
                                        labels: Object.keys(stats.serviceStats || {}),
                                        datasets: [{
                                            data: Object.values(stats.serviceStats || {}).map(stat => stat.successRate),
                                            backgroundColor: [
                                                '#10b981',
                                                '#6366f1',
                                                '#f59e0b',
                                                '#ef4444',
                                                '#8b5cf6',
                                                '#06b6d4'
                                            ],
                                            borderColor: '#ffffff',
                                            borderWidth: 3,
                                            hoverBackgroundColor: [
                                                '#059669',
                                                '#4f46e5',
                                                '#d97706',
                                                '#dc2626',
                                                '#7c3aed',
                                                '#0891b2'
                                            ]
                                        }]
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'bottom',
                                                labels: {
                                                    padding: 20,
                                                    font: {
                                                        size: 12
                                                    }
                                                }
                                            },
                                            tooltip: {
                                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                                titleColor: '#ffffff',
                                                bodyColor: '#ffffff',
                                                callbacks: {
                                                    label: function(context) {
                                                        return `${context.label}: ${context.parsed}%`;
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* 4. 응답시간 분포 - Bar Chart (Histogram) */}
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                ⚡ 응답시간 분포
                            </h3>
                            <div style={{ height: '300px' }}>
                                <Bar
                                    data={{
                                        labels: ['0-1초', '1-2초', '2-5초', '5-10초', '10초+'],
                                        datasets: [{
                                            label: '요청 수',
                                            data: stats.responseTimeDistribution || [0, 0, 0, 0, 0],
                                            backgroundColor: [
                                                '#10b981',
                                                '#22c55e',
                                                '#f59e0b',
                                                '#f97316',
                                                '#ef4444'
                                            ],
                                            borderColor: [
                                                '#059669',
                                                '#16a34a',
                                                '#d97706',
                                                '#ea580c',
                                                '#dc2626'
                                            ],
                                            borderWidth: 1
                                        }]
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                display: false
                                            },
                                            tooltip: {
                                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                                titleColor: '#ffffff',
                                                bodyColor: '#ffffff'
                                            }
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                title: {
                                                    display: true,
                                                    text: '요청 수',
                                                    color: '#6b7280'
                                                },
                                                ticks: {
                                                    color: '#6b7280'
                                                }
                                            },
                                            x: {
                                                title: {
                                                    display: true,
                                                    text: '응답시간 범위',
                                                    color: '#6b7280'
                                                },
                                                ticks: {
                                                    color: '#6b7280'
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* 5. 피드백 만족도 - Doughnut Chart */}
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                😊 피드백 만족도
                            </h3>
                            <div style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Doughnut
                                    data={{
                                        labels: ['매우 만족', '만족', '보통', '불만족', '매우 불만족'],
                                        datasets: [{
                                            data: stats.feedbackDistribution || [20, 30, 25, 15, 10],
                                            backgroundColor: [
                                                '#10b981',
                                                '#22c55e',
                                                '#f59e0b',
                                                '#f97316',
                                                '#ef4444'
                                            ],
                                            borderColor: '#ffffff',
                                            borderWidth: 3,
                                            hoverBackgroundColor: [
                                                '#059669',
                                                '#16a34a',
                                                '#d97706',
                                                '#ea580c',
                                                '#dc2626'
                                            ]
                                        }]
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'bottom',
                                                labels: {
                                                    padding: 15,
                                                    font: {
                                                        size: 11
                                                    }
                                                }
                                            },
                                            tooltip: {
                                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                                titleColor: '#ffffff',
                                                bodyColor: '#ffffff',
                                                callbacks: {
                                                    label: function(context) {
                                                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                                        const percentage = ((context.parsed / total) * 100).toFixed(1);
                                                        return `${context.label}: ${context.parsed}건 (${percentage}%)`;
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280', textAlign: 'center', marginTop: '1rem', background: '#f9fafb', padding: '0.5rem', borderRadius: '0.375rem' }}>
                                평균 만족도: {stats.averageSatisfaction || '4.2'}/5.0
                            </div>
                        </div>

                        {/* 6. 버전별 성능 비교 - Bar Chart */}
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                📦 버전별 성능 비교
                            </h3>
                            <div style={{ height: '300px' }}>
                                <Bar
                                    data={{
                                        labels: Object.keys(stats.versionStats || {}).sort((a, b) => {
                                            // 버전을 숫자로 정렬 (0.0.1, 0.0.2, ..., 0.1.0, 0.1.1)
                                            const parseVersion = (v) => {
                                                const parts = v.split('.').map(Number);
                                                return parts[0] * 10000 + parts[1] * 100 + parts[2];
                                            };
                                            return parseVersion(a) - parseVersion(b);
                                        }),
                                        datasets: [
                                            {
                                                label: '호출 횟수',
                                                data: Object.keys(stats.versionStats || {})
                                                    .sort((a, b) => {
                                                        const parseVersion = (v) => {
                                                            const parts = v.split('.').map(Number);
                                                            return parts[0] * 10000 + parts[1] * 100 + parts[2];
                                                        };
                                                        return parseVersion(a) - parseVersion(b);
                                                    })
                                                    .map(version => stats.versionStats[version].count),
                                                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                                                borderColor: '#3b82f6',
                                                borderWidth: 1,
                                                yAxisID: 'y'
                                            },
                                            {
                                                type: 'line',
                                                label: '성공률 (%)',
                                                data: Object.keys(stats.versionStats || {})
                                                    .sort((a, b) => {
                                                        const parseVersion = (v) => {
                                                            const parts = v.split('.').map(Number);
                                                            return parts[0] * 10000 + parts[1] * 100 + parts[2];
                                                        };
                                                        return parseVersion(a) - parseVersion(b);
                                                    })
                                                    .map(version => stats.versionStats[version].successRate),
                                                borderColor: '#10b981',
                                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                borderWidth: 3,
                                                tension: 0.4,
                                                yAxisID: 'y1'
                                            },
                                            {
                                                type: 'line',
                                                label: '평균 응답시간 (초)',
                                                data: Object.keys(stats.versionStats || {})
                                                    .sort((a, b) => {
                                                        const parseVersion = (v) => {
                                                            const parts = v.split('.').map(Number);
                                                            return parts[0] * 10000 + parts[1] * 100 + parts[2];
                                                        };
                                                        return parseVersion(a) - parseVersion(b);
                                                    })
                                                    .map(version => stats.versionStats[version].avgResponseTime),
                                                borderColor: '#f59e0b',
                                                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                                borderWidth: 2,
                                                tension: 0.4,
                                                yAxisID: 'y2'
                                            }
                                        ]
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'top',
                                                labels: {
                                                    boxWidth: 12,
                                                    font: {
                                                        size: 12
                                                    }
                                                }
                                            },
                                            tooltip: {
                                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                                titleColor: '#ffffff',
                                                bodyColor: '#ffffff',
                                                callbacks: {
                                                    afterTitle: function(context) {
                                                        const version = context[0].label;
                                                        const versionData = stats.versionStats[version];
                                                        return `토큰: ${versionData?.avgTokens || 0}`;
                                                    }
                                                }
                                            }
                                        },
                                        scales: {
                                            y: {
                                                type: 'linear',
                                                display: true,
                                                position: 'left',
                                                beginAtZero: true,
                                                title: {
                                                    display: true,
                                                    text: '호출 횟수',
                                                    color: '#6b7280'
                                                },
                                                ticks: {
                                                    color: '#6b7280'
                                                }
                                            },
                                            y1: {
                                                type: 'linear',
                                                display: true,
                                                position: 'right',
                                                min: 0,
                                                max: 100,
                                                title: {
                                                    display: true,
                                                    text: '성공률 (%)',
                                                    color: '#6b7280'
                                                },
                                                ticks: {
                                                    color: '#6b7280'
                                                },
                                                grid: {
                                                    drawOnChartArea: false,
                                                }
                                            },
                                            y2: {
                                                type: 'linear',
                                                display: false,
                                                position: 'right',
                                                title: {
                                                    display: false,
                                                    text: '응답시간 (초)',
                                                    color: '#6b7280'
                                                }
                                            },
                                            x: {
                                                ticks: {
                                                    color: '#6b7280',
                                                    maxRotation: 45
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* 최근 활동 요약 */}
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', gridColumn: 'span 2' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                🔥 최근 활동 요약
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                                {stats.recentLogs.slice(0, 6).map((log, index) => (
                                    <div key={log.apilog_idx} style={{ 
                                        padding: '1rem', 
                                        background: '#f9fafb',
                                        borderRadius: '0.5rem',
                                        border: '1px solid #e5e7eb',
                                        fontSize: '0.875rem'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <span style={{ fontWeight: '600', color: '#374151' }}>#{log.apilog_idx}</span>
                                            <StatusTag status={log.apilog_status}>{log.apilog_status}</StatusTag>
                                        </div>
                                        <div style={{ color: '#6b7280', fontSize: '0.75rem', lineHeight: '1.4' }}>
                                            <div>📅 {new Date(log.apilog_request_time).toLocaleString()}</div>
                                            <div>🤖 {log.apilog_model}</div>
                                            <div>🎯 {(log.apilog_input_tokens || 0) + (log.apilog_output_tokens || 0)} 토큰</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'logs' && (
                    <div style={{ background: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>📋 API 로그 목록</h3>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                {filteredLogs.length}건 / 전체 {apiLogs.length}건
                            </div>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <Table>
                                <thead>
                                    <tr>
                                        <Th>ID</Th><Th>모델</Th><Th>서비스</Th><Th>버전</Th><Th>상태</Th><Th>토큰</Th><Th>시간</Th><Th>피드백</Th><Th>액션</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLogs.map(log => (
                                        <tr key={log.apilog_idx}>
                                            <Td>{log.apilog_idx}</Td>
                                            <Td>
                                                <span style={{ 
                                                    padding: '0.25rem 0.5rem', 
                                                    background: log.apilog_model?.includes('gpt-4') ? '#ede9fe' : '#dbeafe',
                                                    color: log.apilog_model?.includes('gpt-4') ? '#7c3aed' : '#2563eb',
                                                    borderRadius: '0.375rem',
                                                    fontSize: '0.75rem'
                                                }}>
                                                    {log.apilog_model || 'N/A'}
                                                </span>
                                            </Td>
                                            <Td>{log.apilog_service_type || 'N/A'}</Td>
                                            <Td>
                                                <span style={{ 
                                                    padding: '0.25rem 0.5rem', 
                                                    background: '#f3f4f6',
                                                    borderRadius: '0.375rem',
                                                    fontSize: '0.75rem'
                                                }}>
                                                    v{log.apilog_version}
                                                </span>
                                            </Td>
                                            <Td><StatusTag status={log.apilog_status}>{log.apilog_status}</StatusTag></Td>
                                            <Td>
                                                <div style={{ fontSize: '0.875rem' }}>
                                                    <div>{(log.apilog_input_tokens || 0) + (log.apilog_output_tokens || 0)}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                                        입력: {log.apilog_input_tokens || 0} | 출력: {log.apilog_output_tokens || 0}
                                                    </div>
                                                </div>
                                            </Td>
                                            <Td>
                                                <div style={{ fontSize: '0.875rem' }}>
                                                    <div style={{ fontWeight: '500' }}>{log.apilog_total_time}초</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                                        {new Date(log.apilog_request_time).toLocaleTimeString()}
                                                    </div>
                                                </div>
                                            </Td>
                                            <Td>
                                                {log.apilog_feedback ? (
                                                    <span style={{ fontSize: '1.5rem' }}>
                                                        {log.apilog_feedback.toLowerCase() === 'like' ? '👍' : '👎'}
                                                    </span>
                                                ) : '—'}
                                            </Td>
                                            <Td>
                                                <button 
                                                    onClick={() => setSelectedLog(log)} 
                                                    style={{ 
                                                        color: '#4f46e5', 
                                                        background: 'none', 
                                                        border: 'none', 
                                                        cursor: 'pointer',
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: '0.375rem',
                                                        fontSize: '0.875rem'
                                                    }}
                                                    onMouseOver={(e) => e.target.style.background = '#f3f4f6'}
                                                    onMouseOut={(e) => e.target.style.background = 'none'}
                                                >
                                                    상세보기
                                                </button>
                                            </Td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </div>
                )}

                {/* 모달은 기존 코드 유지 */}

                {selectedLog && (
                    <ModalOverlay>
                        <ModalContent style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
                            <DetailModalHeader>
                                <div>
                                    <DetailModalTitle>
                                        🔍 API 로그 상세 - ID: {selectedLog.apilog_idx}
                                    </DetailModalTitle>
                                    <DetailModalSubtitle>
                                        {new Date(selectedLog.apilog_request_time).toLocaleString()} | 
                                        사용자: {selectedLog.member_idx} | 
                                        모델: {selectedLog.apilog_model}
                                    </DetailModalSubtitle>
                                </div>
                                <DetailModalCloseButton onClick={() => setSelectedLog(null)}>
                                    ✕
                                </DetailModalCloseButton>
                            </DetailModalHeader>

                            {/* 네비게이션 버튼 */}
                            <NavigationContainer>
                                <NavigationButton 
                                    onClick={() => handleSelectedLog(-1)} 
                                    disabled={filteredLogs.findIndex(log => log.apilog_idx === selectedLog?.apilog_idx) <= 0}
                                >
                                    ⬅️ 이전
                                </NavigationButton>
                                
                                <NavigationInfo>
                                    {filteredLogs.findIndex(log => log.apilog_idx === selectedLog?.apilog_idx) + 1} / {filteredLogs.length}
                                    {filteredLogs.length !== apiLogs.length && (
                                        <FilteredResultInfo>
                                            (필터링된 결과)
                                        </FilteredResultInfo>
                                    )}
                                </NavigationInfo>
                                
                                <NavigationButton 
                                    onClick={() => handleSelectedLog(1)} 
                                    disabled={filteredLogs.findIndex(log => log.apilog_idx === selectedLog?.apilog_idx) >= filteredLogs.length - 1}
                                >
                                    다음 ➡️
                                </NavigationButton>
                            </NavigationContainer>

                            {/* 로그 메타 정보 */}
                            <MetaInfoGrid>
                                <MetaInfoItem>
                                    <MetaInfoLabel>상태</MetaInfoLabel>
                                    <StatusTag status={selectedLog.apilog_status}>{selectedLog.apilog_status}</StatusTag>
                                </MetaInfoItem>
                                <MetaInfoItem>
                                    <MetaInfoLabel>토큰 사용량</MetaInfoLabel>
                                    <MetaInfoValue>
                                        {(selectedLog.apilog_input_tokens || 0) + (selectedLog.apilog_output_tokens || 0)}
                                    </MetaInfoValue>
                                    <MetaInfoSubValue>
                                        입력: {selectedLog.apilog_input_tokens || 0} | 출력: {selectedLog.apilog_output_tokens || 0}
                                    </MetaInfoSubValue>
                                </MetaInfoItem>
                                <MetaInfoItem>
                                    <MetaInfoLabel>응답시간</MetaInfoLabel>
                                    <MetaInfoValue>{selectedLog.apilog_total_time}초</MetaInfoValue>
                                </MetaInfoItem>
                                <MetaInfoItem>
                                    <MetaInfoLabel>서비스 타입</MetaInfoLabel>
                                    <MetaInfoValue>{selectedLog.apilog_service_type || 'N/A'}</MetaInfoValue>
                                </MetaInfoItem>
                                {selectedLog.apilog_feedback && (
                                    <MetaInfoItem>
                                        <MetaInfoLabel>사용자 피드백</MetaInfoLabel>
                                        <FeedbackContainer>
                                            <FeedbackIcon>
                                                {selectedLog.apilog_feedback.toLowerCase() === 'like' ? '👍' : '👎'}
                                            </FeedbackIcon>
                                            <FeedbackText>{selectedLog.apilog_feedback}</FeedbackText>
                                        </FeedbackContainer>
                                        {selectedLog.apilog_feedback_reason && (
                                            <FeedbackReason>
                                                이유: {selectedLog.apilog_feedback_reason}
                                            </FeedbackReason>
                                        )}
                                    </MetaInfoItem>
                                )}
                                {selectedLog.apilog_exception_reason && (
                                    <MetaInfoItem>
                                        <MetaInfoLabel>예외 원인</MetaInfoLabel>
                                        <MetaInfoValue color="#ef4444">{selectedLog.apilog_exception_reason}</MetaInfoValue>
                                    </MetaInfoItem>
                                )}
                            </MetaInfoGrid>

                            <Section>
                                <SectionTitle>📝 사용자 요청:</SectionTitle>
                                <UserRequestContainer>
                                    {selectedLog.parsed_userMassage ? (
                                        <UserRequestGrid>
                                            {Object.entries(selectedLog.parsed_userMassage).map(([key, value]) => (
                                                <UserRequestItem key={key}>
                                                    <UserRequestKey>{key}:</UserRequestKey> 
                                                    <UserRequestValue>{String(value)}</UserRequestValue>
                                                    {key === 'isSplit' && value && (
                                                        <SplitMatchBadge>
                                                            ✅ 분할 일치
                                                        </SplitMatchBadge>
                                                    )}
                                                </UserRequestItem>
                                            ))}
                                        </UserRequestGrid>
                                    ) : (
                                        <MonospaceContent>
                                            {selectedLog.parsed_prompt?.messages?.[1]?.content || '파싱 오류'}
                                        </MonospaceContent>
                                    )}
                                </UserRequestContainer>
                            </Section>

                            {(selectedLog.apilog_status === 'success' || selectedLog.apilog_status === 'exception') && selectedLog.parsed_response && (
                                <Section>
                                    <SectionTitle>🤖 AI 응답 (운동 루틴):</SectionTitle>
                                    <RoutineContainer>
                                        {Array.isArray(selectedLog.parsed_response) ? selectedLog.parsed_response.map((routine, idx) => (
                                            <RoutineCard key={idx} style={{ 
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '0.5rem',
                                                padding: '1rem'
                                            }}>
                                                <RoutineHeader>
                                                    <RoutineTitle>
                                                        🏋️ {routine.routine_name}
                                                    </RoutineTitle>
                                                    <RoutineBadge>
                                                        {routine.exercises?.length || 0}개 운동
                                                    </RoutineBadge>
                                                </RoutineHeader>
                                                <ExerciseGrid>
                                                    {routine.exercises?.map((ex, i) => {
                                                        const isValid = rawData.includes(ex.pt_name?.replace(/\s+/g, ''));
                                                        return (
                                                            <ExerciseItem key={i} isValid={isValid}>
                                                                <ExerciseIcon>
                                                                    {isValid ? '✅' : '❌'}
                                                                </ExerciseIcon>
                                                                <ExerciseContent>
                                                                    <ExerciseName>
                                                                        {/** 유사 운동명 추천 */}
                                                                        {isValid ? ex.pt_name : getSimilarNamesByMap(ex.pt_name, rawDataMap).map((item, index) => (
                                                                            <SimilarExercise key={index}>
                                                                                {ex.pt_name} 👉 {item.name}
                                                                            </SimilarExercise>
                                                                        ))}     
                                                                    </ExerciseName>
                                                                    <ExerciseDetails>
                                                                        {ex.set_volume}kg × {ex.set_count}회 × {ex.set_num}세트
                                                                    </ExerciseDetails>
                                                                </ExerciseContent>
                                                                {!isValid && (
                                                                    <InvalidExerciseBadge>
                                                                        유효하지 않은 운동
                                                                    </InvalidExerciseBadge>
                                                                )}
                                                            </ExerciseItem>
                                                        );
                                                    })}
                                                </ExerciseGrid>
                                            </RoutineCard>
                                        )) : (
                                            <ErrorContainer>
                                                ⚠️ 루틴 정보가 없거나 형식이 잘못되었습니다.
                                            </ErrorContainer>
                                        )}
                                    </RoutineContainer>
                                </Section>
                            )}
                        </ModalContent>
                    </ModalOverlay>
                )}
            </Inner>
        </Container>
    );
};

export default AdminApiContainer;
