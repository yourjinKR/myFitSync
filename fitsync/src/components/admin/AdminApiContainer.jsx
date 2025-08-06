import React, { useState, useEffect } from 'react';
import { Container, Inner } from '../../styles/chartStyle';
import { useApiLogs } from '../../hooks/admin/useApiLogs';
import { useFilters } from '../../hooks/admin/useFilters';
import { useStatistics } from '../../hooks/admin/useStatistics';
import { useWorkoutNames } from '../../hooks/admin/useWorkoutNames';
import DashboardHeader from './dashboard/DashboardHeader';
import TabNavigation from './dashboard/TabNavigation';
import FilterPanel from './filters/FilterPanel';
import ActiveFilters from './filters/ActiveFilters';
import OverviewTab from './tabs/OverviewTab';
import AnalyticsTab from './tabs/AnalyticsTab';
import PerformanceTab from './tabs/PerformanceTab';
import LogsTab from './tabs/LogsTab';
import TokenAnalyticsTab from './tabs/TokenAnalyticsTab';
import LogDetailModal from './logs/LogDetailModal';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { PaymentUtil } from '../../utils/PaymentUtil';

const AdminApiContainer = () => {
    const user = useSelector(state => state.user);

    // API 로그 관련 상태 (커스텀 훅 사용)
    const { apiLogs, loading, fetchApiLogs } = useApiLogs();
    
    // 운동명 데이터 (커스텀 훅 사용)
    const { rawDataMap, rawData, rawDataIdx } = useWorkoutNames();

    // 구독자 정보 상태
    const [subscriberInfo, setSubscriberInfo] = useState({total : 0});

    // 구독자 정보 불러오기
    const fetchSubscriberInfo = async () => {
        try {
            const data = await PaymentUtil.getSubscriberNow();
            setSubscriberInfo({total : data});
        } catch (error) {
            console.error('구독자 정보 불러오기 실패:', error);
        }
    };

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

    // 모든 필터 제거 함수
    const clearAllFilters = () => {
        setFilter('all');
        setModelFilter('all');
        setServiceFilter('all');
        setVersionFilter('all');
        setSearchTerm('');
        setDateRange({ start: '', end: '' });
    };

    // 필터 상태들을 객체로 그룹화
    const filterStates = {
        searchTerm, setSearchTerm,
        filter, setFilter,
        modelFilter, setModelFilter,
        serviceFilter, setServiceFilter,
        versionFilter, setVersionFilter,
        sortBy, setSortBy,
        dateRange, setDateRange
    };

    // 로그 네비게이션 핸들러
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

    // 컴포넌트 마운트 시 구독자 정보 불러오기
    useEffect(() => {
        fetchSubscriberInfo();
    }, []);

    return (
        <Container>
            <Inner>
                {/* 대시보드 헤더 */}
                <DashboardHeader 
                    autoRefresh={autoRefresh}
                    setAutoRefresh={setAutoRefresh}
                />
                
                {/* 탭 네비게이션 */}
                <TabNavigation 
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    fetchApiLogs={fetchApiLogs}
                    loading={loading}
                />
                
                {/* 필터 패널 */}
                <FilterPanel 
                    filters={filterStates}
                    setFilters={filterStates}
                    apiLogs={apiLogs}
                    loading={loading}
                    activeTab={activeTab}
                />

                {/* 활성 필터 표시 */}
                <ActiveFilters 
                    filters={filterStates}
                    clearAllFilters={clearAllFilters}
                />

                {/* 탭별 컨텐츠 */}
                {activeTab === 'overview' && stats && (
                    <OverviewTab 
                        logs={apiLogs}
                        filteredLogs={filteredLogs}
                        stats={stats}
                        isLoading={loading}
                        dateRange={dateRange}
                        subscriberInfo={subscriberInfo}
                    />
                )}

                {activeTab === 'analytics' && stats && (
                    <AnalyticsTab 
                        logs={apiLogs}
                        filteredLogs={filteredLogs}
                        stats={stats}
                        isLoading={loading}
                        dateRange={dateRange}
                    />
                )}

                {activeTab === 'tokens' && (
                    <TokenAnalyticsTab 
                        logs={apiLogs}
                        filteredLogs={filteredLogs}
                        isLoading={loading}
                        dateRange={dateRange}
                    />
                )}

                {activeTab === 'performance' && stats && (
                    <PerformanceTab 
                        logs={apiLogs}
                        filteredLogs={filteredLogs}
                        stats={stats}
                        isLoading={loading}
                        dateRange={dateRange}
                    />
                )}

                {activeTab === 'logs' && (
                    <LogsTab 
                        filteredLogs={filteredLogs}
                        apiLogs={apiLogs}
                        setSelectedLog={setSelectedLog}
                        selectedLog={selectedLog}
                        isLoading={loading}
                        stats={stats}
                    />
                )}

                {/* LogDetailModal */}
                {selectedLog && (
                    <LogDetailModal 
                        log={selectedLog}
                        isOpen={!!selectedLog}
                        onClose={() => setSelectedLog(null)}
                        onNavigate={handleSelectedLog}
                        rawData={rawData}
                        rawDataIdx={rawDataIdx}
                        rawDataMap={rawDataMap}
                        navigationInfo={{
                            currentIndex: filteredLogs.findIndex(log => log.apilog_idx === selectedLog?.apilog_idx),
                            total: filteredLogs.length,
                            isFiltered: filteredLogs.length !== apiLogs.length
                        }}
                        memberType={user.user.member_type}
                    />
                )}

            </Inner>
        </Container>
    );
};

export default AdminApiContainer;
