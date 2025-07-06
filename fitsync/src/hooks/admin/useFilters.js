import { useState, useMemo } from 'react';

/**
 * 필터링 로직을 관리하는 훅
 * @param {Array} apiLogs - API 로그 데이터
 * @returns {Object} 필터 상태와 필터링된 로그들
 */
export const useFilters = (apiLogs) => {
    // 필터 상태들
    const [filter, setFilter] = useState('all'); // status filter
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [modelFilter, setModelFilter] = useState('all');
    const [serviceFilter, setServiceFilter] = useState('all');
    const [versionFilter, setVersionFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [searchTerm, setSearchTerm] = useState('');

    // 필터링된 로그들
    const filteredLogs = useMemo(() => {
        let filtered = apiLogs.filter(log => {
            // 기본 상태 필터
            if (filter !== 'all' && log.apilog_status !== filter) return false;
            
            // 모델 필터
            if (modelFilter !== 'all' && log.apilog_model !== modelFilter) return false;
            
            // 서비스 타입 필터
            if (serviceFilter !== 'all' && log.apilog_service_type !== serviceFilter) return false;
            
            // 버전 필터
            if (versionFilter !== 'all' && log.apilog_version !== versionFilter) return false;
            
            // 검색어 필터
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                const searchableContent = `${log.apilog_idx} ${log.member_idx} ${log.apilog_model} ${log.apilog_version}`.toLowerCase();
                if (!searchableContent.includes(term)) return false;
            }
            
            // 날짜 범위 필터
            if (dateRange.start) {
                const logDate = new Date(log.apilog_request_time);
                const startDate = new Date(dateRange.start);
                if (logDate < startDate) return false;
            }
            if (dateRange.end) {
                const logDate = new Date(log.apilog_request_time);
                const endDate = new Date(dateRange.end);
                endDate.setHours(23, 59, 59, 999); // 끝날의 마지막 시간까지 포함
                if (logDate > endDate) return false;
            }
            
            return true;
        });

        // 정렬
        switch (sortBy) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.apilog_request_time) - new Date(a.apilog_request_time));
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.apilog_request_time) - new Date(b.apilog_request_time));
                break;
            case 'tokens':
                filtered.sort((a, b) => ((b.apilog_input_tokens || 0) + (b.apilog_output_tokens || 0)) - ((a.apilog_input_tokens || 0) + (a.apilog_output_tokens || 0)));
                break;
            case 'time':
                filtered.sort((a, b) => b.apilog_total_time - a.apilog_total_time);
                break;
            default:
                break;
        }

        return filtered;
    }, [apiLogs, filter, modelFilter, serviceFilter, versionFilter, searchTerm, dateRange, sortBy]);

    return {
        // 필터 상태들
        filter,
        setFilter,
        dateRange,
        setDateRange,
        modelFilter,
        setModelFilter,
        serviceFilter,
        setServiceFilter,
        versionFilter,
        setVersionFilter,
        sortBy,
        setSortBy,
        searchTerm,
        setSearchTerm,
        
        // 필터링된 결과
        filteredLogs
    };
};
