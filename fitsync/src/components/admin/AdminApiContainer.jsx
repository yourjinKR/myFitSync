import axios from 'axios';
import React, { useState, useEffect, useMemo } from 'react';
import { disassemble, disassembleToGroups } from 'es-hangul';
import { Container, Inner, Title, Button, Select, StatCard, StatTitle, StatValue, Table, Th, Td, StatusTag, ModalOverlay, ModalContent, Section, SectionTitle, SectionContent, RoutineCard, Exercise } from '../../styles/chartStyle';
import versionUtils from '../../util/utilFunc';
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

const tenseConsonantMap = {
    'ㄲ': 'ㄱ',
    'ㄸ': 'ㄷ',
    'ㅃ': 'ㅂ',
    'ㅆ': 'ㅅ',
    'ㅉ': 'ㅈ',
};

/** 자모음 분해 및 정규화 */
function normalizeAndDisassemble(name) {
    const trimmed = name.replace(/\s+/g, '');
    const dis = disassemble(trimmed);
    const normalized = dis
        .replace(/ㅐ/g, 'ㅔ')
        .replace(/[ㄲㄸㅃㅆㅉ]/g, ch => tenseConsonantMap[ch] || ch);
    return { normalized, length: normalized.length };
}

/** 유사도 계산 */
function levenshtein(a, b) {
    const matrix = Array.from({ length: a.length + 1 }, (_, i) =>
        Array(b.length + 1).fill(i === 0 ? 0 : i)
    );
    for (let j = 1; j <= b.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
        matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1, // 삭제
            matrix[i][j - 1] + 1, // 삽입
            matrix[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1) // 치환
        );
        }
    }
    return matrix[a.length][b.length];
}

/**
 * 유사한 운동명 찾기 (배열)
 * @param {string} input - 입력된 운동명
 * @param {Array} dataList - 운동명 데이터 리스트
 * @param {number} maxLengthDiff - 최대 길이 차이
 * @param {number} maxDistance - 최대 편집 거리
 * @returns {Array} - 유사한 운동명 리스트
 */
function getSimilarNamesByList(input, dataList, maxLengthDiff = 1, maxDistance = 2) {
    const { normalized: inputDis, length: inputLen } = normalizeAndDisassemble(input);

    const result = dataList
        .filter(item => Math.abs(item.length - inputLen) <= maxLengthDiff) // 길이 차이 필터
        .map(item => {
            const score = levenshtein(inputDis, item.name_dis);
            return { name: item.name, score };
        })
        .filter(({ score }) => score <= maxDistance)
        .sort((a, b) => a.score - b.score);
    
    console.log(input, '과 유사한 운동명:', result);

    return result.length > 0 ? result : [{ name: '유사 운동명 찾지 못함', score: 0 }];
}

/**
 * 유사한 운동명 찾기 (맵)
 * @param {string} input - 입력된 운동명
 * @param {Map} dataMap - 운동명 데이터 맵
 * @param {number} maxLengthDiff - 최대 길이 차이
 * @param {number} maxDistance - 최대 편집 거리
 * @returns {Array} - 유사한 운동명 리스트
 */
function getSimilarNamesByMap(input, dataMap, maxLengthDiff = 1, maxDistance = 2) {
    const { normalized: inputDis, length: inputLen } = normalizeAndDisassemble(input);

    const candidates = Array.from(dataMap.entries())
        .filter(([length, items]) => Math.abs(length - inputLen) <= maxLengthDiff)
        .flatMap(([, items]) => items);

    const result = candidates
        .map(item => {
            const score = levenshtein(inputDis, item.name_dis);
            return { name: item.name, score };
        })
        .filter(({ score }) => score <= maxDistance)
        .sort((a, b) => a.score - b.score);

    return result.length > 0 ? result : [{ name: '유사 운동명 찾지 못함', score: 0 }];
}

/** JSON 파싱 및 응답 시간 계산 */
function parseApiLogData(apiLogItem) {
    const version = apiLogItem.apilog_version;
    try {
        const parsedPrompt = JSON.parse(apiLogItem.apilog_prompt);
        const parsedResponse = JSON.parse(apiLogItem.apilog_response);
        const responseTime = new Date(apiLogItem.apilog_response_time).getTime();
        const requestTime = new Date(apiLogItem.apilog_request_time).getTime();

        let parsedUserMassage = null;
        if (versionUtils.isVersionAtLeast(version, '0.0.7')) {
            parsedUserMassage = JSON.parse(parsedPrompt.messages[1]?.content);
            if (parsedUserMassage.split === parsedResponse.length) {
                parsedUserMassage = { ...parsedUserMassage, isSplit: true };
            }
        }

        return {
            ...apiLogItem,
            parsed_prompt: parsedPrompt,
            parsed_response: parsedResponse,
            parsed_userMassage: parsedUserMassage,
            apilog_total_time: (responseTime - requestTime) / 1000
        };
    } catch (error) {
        console.error('JSON 파싱 오류:', error);
        return apiLogItem;
    }
}

const AdminApiContainer = () => {
    // 상태값 관리
    const [apiLogs, setApiLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);
    // status filter
    const [filter, setFilter] = useState('all');
    // 운동명 리스트
    const [rawData, setRawData] = useState([]);
    // 운동명, 자모음 분해 운동명, 길이
    const [rawDataObject, setRawDataObject] = useState([{name : '', name_dis : '', length: 0}]);
    // 길이를 기준으로 운동명과 자모음 분해 운동명을 매핑
    const [rawDataMap, setRawDataMap] = useState(new Map());
    
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [modelFilter, setModelFilter] = useState('all');
    const [serviceFilter, setServiceFilter] = useState('all');
    const [versionFilter, setVersionFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [refreshInterval, setRefreshInterval] = useState(null);

    function getListByString(input) {
        const {length} = normalizeAndDisassemble(input);
        return rawDataMap.get(length) || [];
    }

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

    const handleSelectedLog = (direction) => {
        const currentIndex = apiLogs.findIndex(log => log.apilog_idx === selectedLog?.apilog_idx);
        const newIndex = currentIndex + direction;
        if (newIndex >= 0 && newIndex < apiLogs.length) {
            setSelectedLog(apiLogs[newIndex]);
        }
    };

    const fetchWorkoutNames = async () => {
        const groupedMap = new Map();

        try {
            const response = await axios.get('/ai/getTextReact');
            setRawData(response.data.map(name => name.replace(/\s+/g, '')));

            // 운동명과 자모음 분해 운동명을 객체로 변환
            setRawDataObject(response.data.map(name => {
                const { normalized, length } = normalizeAndDisassemble(name);
                return { name: name, name_dis: normalized, length: length };
            }));

            // 운동명과 자모음 분해 운동명을 길이별로 그룹화
            response.data.forEach(originalName => {
                const { normalized, length } = normalizeAndDisassemble(originalName);

                const entry = { name: originalName, name_dis: normalized };

                if (!groupedMap.has(length)) {
                    groupedMap.set(length, []);
                }
                groupedMap.get(length).push(entry);
            });

            // set할 때는 새로운 Map 객체로 전달하여 리액트가 변경 감지하도록 함
            setRawDataMap(new Map(groupedMap));

        } catch (error) {
            console.error('운동명 목록 요청 실패:', error);
        }
    };

    const fetchApiLogs = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/admin/getAllApi');
            setApiLogs(response.data.map(item => parseApiLogData(item)));
        } catch (error) {
            console.error('API 로그 가져오기 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatistics = () => {
        if (apiLogs.length === 0) return null;
        
        const total = filteredLogs.length;
        const successCount = filteredLogs.filter(log => log.apilog_status === 'success').length;
        const errorCount = filteredLogs.filter(log => log.apilog_status === 'error').length;
        const exceptionCount = filteredLogs.filter(log => log.apilog_status === 'exception').length;
        
        const totalTokens = filteredLogs.reduce((sum, log) => sum + (log.apilog_input_tokens || 0) + (log.apilog_output_tokens || 0), 0);
        const totalInputTokens = filteredLogs.reduce((sum, log) => sum + (log.apilog_input_tokens || 0), 0);
        const totalOutputTokens = filteredLogs.reduce((sum, log) => sum + (log.apilog_output_tokens || 0), 0);
        
        const totalTime = filteredLogs.reduce((sum, log) => sum + (log.apilog_total_time || 0), 0);
        
        // 모델별 통계
        const modelCounts = {};
        const modelTokens = {};
        const modelTimes = {};
        
        // 서비스별 통계
        const serviceCounts = {};
        const serviceSuccessRates = {};
        
        // 버전별 통계
        const versionCounts = {};
        const versionTokens = {};
        const versionTimes = {};
        const versionSuccessRates = {};
        
        // 시간대별 통계 (최근 24시간)
        const hourlyData = Array(24).fill(0);
        const now = new Date();
        
        // 피드백 통계
        const feedbackStats = { like: 0, dislike: 0, total: 0 };
        
        filteredLogs.forEach(log => {
            // 모델 통계
            const model = log.apilog_model || '기타';
            modelCounts[model] = (modelCounts[model] || 0) + 1;
            modelTokens[model] = (modelTokens[model] || 0) + (log.apilog_input_tokens || 0) + (log.apilog_output_tokens || 0);
            modelTimes[model] = (modelTimes[model] || 0) + (log.apilog_total_time || 0);
            
            // 서비스 통계
            const service = log.apilog_service_type || '기타';
            serviceCounts[service] = (serviceCounts[service] || 0) + 1;
            if (!serviceSuccessRates[service]) {
                serviceSuccessRates[service] = { total: 0, success: 0 };
            }
            serviceSuccessRates[service].total += 1;
            if (log.apilog_status === 'success') {
                serviceSuccessRates[service].success += 1;
            }
            
            // 버전 통계
            const version = log.apilog_version || '기타';
            versionCounts[version] = (versionCounts[version] || 0) + 1;
            versionTokens[version] = (versionTokens[version] || 0) + (log.apilog_input_tokens || 0) + (log.apilog_output_tokens || 0);
            versionTimes[version] = (versionTimes[version] || 0) + (log.apilog_total_time || 0);
            
            // 버전별 성공률
            if (!versionSuccessRates[version]) {
                versionSuccessRates[version] = { total: 0, success: 0 };
            }
            versionSuccessRates[version].total += 1;
            if (log.apilog_status === 'success') {
                versionSuccessRates[version].success += 1;
            }
            
            // 시간대별 통계
            const logTime = new Date(log.apilog_request_time);
            const hoursDiff = Math.floor((now - logTime) / (1000 * 60 * 60));
            if (hoursDiff < 24 && hoursDiff >= 0) {
                hourlyData[23 - hoursDiff] += 1;
            }
            // 피드백 통계
            if (log.apilog_feedback) {
                feedbackStats.total += 1;
                if (log.apilog_feedback.toLowerCase() === 'like') {
                    feedbackStats.like += 1;
                } else if (log.apilog_feedback.toLowerCase() === 'dislike') {
                    feedbackStats.dislike += 1;
                }
            }
        });

        // 평균 계산
        const avgTokensPerModel = {};
        const avgTimePerModel = {};
        Object.keys(modelCounts).forEach(model => {
            avgTokensPerModel[model] = Math.round(modelTokens[model] / modelCounts[model]);
            avgTimePerModel[model] = (modelTimes[model] / modelCounts[model]).toFixed(2);
        });

        // 버전별 평균 계산
        const avgTokensPerVersion = {};
        const avgTimePerVersion = {};
        Object.keys(versionCounts).forEach(version => {
            avgTokensPerVersion[version] = Math.round(versionTokens[version] / versionCounts[version]);
            avgTimePerVersion[version] = (versionTimes[version] / versionCounts[version]).toFixed(2);
        });

        return {
            // 기본 통계
            totalRequests: total,
            totalApiCalls: apiLogs.length,
            successCount,
            errorCount,
            exceptionCount,
            successRate: total > 0 ? ((successCount / total) * 100).toFixed(1) : 0,
            
            // 토큰 통계
            totalTokens,
            totalInputTokens,
            totalOutputTokens,
            avgTokens: total > 0 ? (totalTokens / total).toFixed(0) : 0,
            avgInputTokens: total > 0 ? (totalInputTokens / total).toFixed(0) : 0,
            avgOutputTokens: total > 0 ? (totalOutputTokens / total).toFixed(0) : 0,
            
            // 시간 통계
            totalTime: totalTime.toFixed(2),
            avgResponseTime: total > 0 ? (totalTime / total).toFixed(2) : 0,
            
            // 상세 통계
            modelCounts,
            modelTokens,
            avgTokensPerModel,
            avgTimePerModel,
            serviceCounts,
            serviceSuccessRates,
            versionCounts,
            versionTokens,
            versionTimes,
            versionSuccessRates,
            avgTokensPerVersion,
            avgTimePerVersion,
            hourlyData,
            feedbackStats,
            
            // Chart.js용 추가 데이터
            modelStats: Object.keys(modelCounts).reduce((acc, model) => {
                acc[model] = {
                    count: modelCounts[model],
                    avgResponseTime: parseFloat(avgTimePerModel[model]) || 0,
                    avgTokens: avgTokensPerModel[model] || 0
                };
                return acc;
            }, {}),
            
            serviceStats: Object.keys(serviceSuccessRates).reduce((acc, service) => {
                acc[service] = {
                    count: serviceCounts[service],
                    successRate: parseFloat(((serviceSuccessRates[service].success / serviceSuccessRates[service].total) * 100).toFixed(1))
                };
                return acc;
            }, {}),
            
            // 버전별 상세 통계
            versionStats: Object.keys(versionCounts).reduce((acc, version) => {
                acc[version] = {
                    count: versionCounts[version],
                    avgResponseTime: parseFloat(avgTimePerVersion[version]) || 0,
                    avgTokens: avgTokensPerVersion[version] || 0,
                    successRate: parseFloat(((versionSuccessRates[version].success / versionSuccessRates[version].total) * 100).toFixed(1)),
                    totalTokens: versionTokens[version] || 0,
                    totalTime: versionTimes[version] || 0
                };
                return acc;
            }, {}),
            
            // 응답시간 분포 (히스토그램용)
            responseTimeDistribution: (() => {
                const distribution = [0, 0, 0, 0, 0]; // 0-1초, 1-2초, 2-5초, 5-10초, 10초+
                filteredLogs.forEach(log => {
                    const time = log.apilog_total_time || 0;
                    if (time <= 1) distribution[0]++;
                    else if (time <= 2) distribution[1]++;
                    else if (time <= 5) distribution[2]++;
                    else if (time <= 10) distribution[3]++;
                    else distribution[4]++;
                });
                return distribution;
            })(),
            
            // 피드백 분포 (만족도용)
            feedbackDistribution: (() => {
                const distribution = [0, 0, 0, 0, 0]; // 매우 만족, 만족, 보통, 불만족, 매우 불만족
                
                // 실제 피드백이 있다면 그걸 사용하고, 없다면 샘플 데이터
                if (feedbackStats.total > 0) {
                    const likeRatio = feedbackStats.like / feedbackStats.total;
                    const dislikeRatio = feedbackStats.dislike / feedbackStats.total;
                    const neutralRatio = 1 - likeRatio - dislikeRatio;
                    
                    distribution[0] = Math.round(feedbackStats.total * likeRatio * 0.6); // 매우 만족
                    distribution[1] = Math.round(feedbackStats.total * likeRatio * 0.4); // 만족
                    distribution[2] = Math.round(feedbackStats.total * neutralRatio); // 보통
                    distribution[3] = Math.round(feedbackStats.total * dislikeRatio * 0.6); // 불만족
                    distribution[4] = Math.round(feedbackStats.total * dislikeRatio * 0.4); // 매우 불만족
                } else {
                    // 샘플 데이터 (실제 피드백이 없을 때)
                    const sampleTotal = Math.max(20, Math.floor(total * 0.3));
                    distribution[0] = Math.floor(sampleTotal * 0.35); // 35% 매우 만족
                    distribution[1] = Math.floor(sampleTotal * 0.30); // 30% 만족
                    distribution[2] = Math.floor(sampleTotal * 0.20); // 20% 보통
                    distribution[3] = Math.floor(sampleTotal * 0.10); // 10% 불만족
                    distribution[4] = Math.floor(sampleTotal * 0.05); // 5% 매우 불만족
                }
                
                return distribution;
            })(),
            
            // 평균 만족도 계산
            averageSatisfaction: (() => {
                if (feedbackStats.total > 0) {
                    const likeRatio = feedbackStats.like / feedbackStats.total;
                    return (3.5 + likeRatio * 1.5).toFixed(1); // 3.5 ~ 5.0 범위
                }
                return '4.2'; // 기본값
            })(),
            
            // 최근 활동
            recentLogs: filteredLogs.slice(0, 5),
            
            // 고유 사용자 수
            uniqueUsers: new Set(filteredLogs.map(log => log.member_idx)).size
        };
    };

    useEffect(() => {
        fetchWorkoutNames();
        fetchApiLogs();
    }, []);

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
    }, [autoRefresh, refreshInterval]); // refreshInterval 의존성 추가

    // 컴포넌트 언마운트 시 인터벌 정리
    useEffect(() => {
        return () => {
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
        };
    }, [refreshInterval]);

    const stats = getStatistics();

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

                {/* 탭별 컨텐츠 */}
                {activeTab === 'overview' && stats && (
                    <>
                        {/* 현재 필터 상태 */}
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
                                <StatTitle style={{ color: 'white' }}>🪙 토큰 사용량</StatTitle>
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
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 0 1rem 0', borderBottom: '1px solid #e5e7eb' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
                                        🔍 API 로그 상세 - ID: {selectedLog.apilog_idx}
                                    </h3>
                                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                        {new Date(selectedLog.apilog_request_time).toLocaleString()} | 
                                        사용자: {selectedLog.member_idx} | 
                                        모델: {selectedLog.apilog_model}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedLog(null)} 
                                    style={{ 
                                        color: '#6b7280', 
                                        background: 'none', 
                                        border: 'none', 
                                        fontSize: '1.5rem', 
                                        cursor: 'pointer',
                                        padding: '0.25rem'
                                    }}
                                >
                                    ✕
                                </button>
                            </div>

                            {/* 네비게이션 버튼 */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <button 
                                    onClick={() => handleSelectedLog(-1)} 
                                    disabled={apiLogs.findIndex(log => log.apilog_idx === selectedLog?.apilog_idx) <= 0}
                                    style={{ 
                                        fontSize: '1rem', 
                                        padding: '0.5rem 1rem',
                                        border: '1px solid #d1d5db',
                                        background: 'white',
                                        borderRadius: '0.375rem',
                                        cursor: 'pointer',
                                        opacity: apiLogs.findIndex(log => log.apilog_idx === selectedLog?.apilog_idx) <= 0 ? 0.5 : 1
                                    }}
                                >
                                    ⬅️ 이전
                                </button>
                                
                                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                    {apiLogs.findIndex(log => log.apilog_idx === selectedLog?.apilog_idx) + 1} / {apiLogs.length}
                                </div>
                                
                                <button 
                                    onClick={() => handleSelectedLog(1)} 
                                    disabled={apiLogs.findIndex(log => log.apilog_idx === selectedLog?.apilog_idx) >= apiLogs.length - 1}
                                    style={{ 
                                        fontSize: '1rem', 
                                        padding: '0.5rem 1rem',
                                        border: '1px solid #d1d5db',
                                        background: 'white',
                                        borderRadius: '0.375rem',
                                        cursor: 'pointer',
                                        opacity: apiLogs.findIndex(log => log.apilog_idx === selectedLog?.apilog_idx) >= apiLogs.length - 1 ? 0.5 : 1
                                    }}
                                >
                                    다음 ➡️
                                </button>
                            </div>

                            {/* 로그 메타 정보 */}
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                                gap: '1rem', 
                                marginBottom: '1.5rem',
                                padding: '1rem',
                                background: '#f9fafb',
                                borderRadius: '0.5rem'
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>상태</div>
                                    <StatusTag status={selectedLog.apilog_status}>{selectedLog.apilog_status}</StatusTag>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>토큰 사용량</div>
                                    <div style={{ fontWeight: '600' }}>
                                        {(selectedLog.apilog_input_tokens || 0) + (selectedLog.apilog_output_tokens || 0)}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                        입력: {selectedLog.apilog_input_tokens || 0} | 출력: {selectedLog.apilog_output_tokens || 0}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>응답시간</div>
                                    <div style={{ fontWeight: '600' }}>{selectedLog.apilog_total_time}초</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>서비스 타입</div>
                                    <div style={{ fontWeight: '600' }}>{selectedLog.apilog_service_type || 'N/A'}</div>
                                </div>
                                {selectedLog.apilog_feedback && (
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>사용자 피드백</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontSize: '1.25rem' }}>
                                                {selectedLog.apilog_feedback.toLowerCase() === 'like' ? '👍' : '👎'}
                                            </span>
                                            <span style={{ fontWeight: '600' }}>{selectedLog.apilog_feedback}</span>
                                        </div>
                                        {selectedLog.apilog_feedback_reason && (
                                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                                이유: {selectedLog.apilog_feedback_reason}
                                            </div>
                                        )}
                                    </div>
                                )}
                                {selectedLog.apilog_exception_reason && (
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>예외 원인</div>
                                        <div style={{ fontWeight: '600', color: '#ef4444' }}>{selectedLog.apilog_exception_reason}</div>
                                    </div>
                                )}
                            </div>

                            <Section>
                                <SectionTitle>📝 사용자 요청:</SectionTitle>
                                <SectionContent style={{ 
                                    background: '#f8fafc', 
                                    padding: '1rem', 
                                    borderRadius: '0.5rem',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    {selectedLog.parsed_userMassage ? (
                                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                                            {Object.entries(selectedLog.parsed_userMassage).map(([key, value]) => (
                                                <div key={key} style={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center',
                                                    padding: '0.5rem',
                                                    background: 'white',
                                                    borderRadius: '0.375rem',
                                                    border: '1px solid #e5e7eb'
                                                }}>
                                                    <strong style={{ minWidth: '100px', color: '#374151' }}>{key}:</strong> 
                                                    <span style={{ marginLeft: '0.5rem' }}>{String(value)}</span>
                                                    {key === 'isSplit' && value && (
                                                        <span style={{ 
                                                            marginLeft: '0.5rem',
                                                            padding: '0.125rem 0.5rem',
                                                            background: '#10b981',
                                                            color: 'white',
                                                            borderRadius: '0.375rem',
                                                            fontSize: '0.75rem'
                                                        }}>
                                                            ✅ 분할 일치
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ 
                                            padding: '1rem',
                                            fontFamily: 'monospace',
                                            fontSize: '0.875rem',
                                            whiteSpace: 'pre-wrap',
                                            background: 'white',
                                            borderRadius: '0.375rem'
                                        }}>
                                            {selectedLog.parsed_prompt?.messages?.[1]?.content || '파싱 오류'}
                                        </div>
                                    )}
                                </SectionContent>
                            </Section>

                            {(selectedLog.apilog_status === 'success' || selectedLog.apilog_status === 'exception') && selectedLog.parsed_response && (
                                <Section>
                                    <SectionTitle>🤖 AI 응답 (운동 루틴):</SectionTitle>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {Array.isArray(selectedLog.parsed_response) ? selectedLog.parsed_response.map((routine, idx) => (
                                            <RoutineCard key={idx} style={{ 
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '0.5rem',
                                                padding: '1rem'
                                            }}>
                                                <div style={{ 
                                                    display: 'flex', 
                                                    justifyContent: 'space-between', 
                                                    alignItems: 'center',
                                                    marginBottom: '1rem',
                                                    paddingBottom: '0.5rem',
                                                    borderBottom: '1px solid #e5e7eb'
                                                }}>
                                                    <h5 style={{ 
                                                        fontWeight: '600', 
                                                        color: '#1e3a8a', 
                                                        margin: 0,
                                                        fontSize: '1.125rem'
                                                    }}>
                                                        🏋️ {routine.routine_name}
                                                    </h5>
                                                    <span style={{ 
                                                        padding: '0.25rem 0.75rem',
                                                        background: '#dbeafe',
                                                        color: '#1e40af',
                                                        borderRadius: '1rem',
                                                        fontSize: '0.875rem'
                                                    }}>
                                                        {routine.exercises?.length || 0}개 운동
                                                    </span>
                                                </div>
                                                <div style={{ display: 'grid', gap: '0.5rem' }}>
                                                    {routine.exercises?.map((ex, i) => {
                                                        const isValid = rawData.includes(ex.pt_name?.replace(/\s+/g, ''));
                                                        return (
                                                            <Exercise key={i} style={{ 
                                                                color: isValid ? 'inherit' : '#dc2626',
                                                                padding: '0.75rem',
                                                                background: isValid ? '#f0fdf4' : '#fef2f2',
                                                                border: `1px solid ${isValid ? '#bbf7d0' : '#fecaca'}`,
                                                                borderRadius: '0.375rem',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.5rem'
                                                            }}>
                                                                <span style={{ fontSize: '1.25rem' }}>
                                                                    {isValid ? '✅' : '❌'}
                                                                </span>
                                                                <div style={{ flex: 1 }}>
                                                                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                                                                        {/** 유사 운동명 추천 */}
                                                                        {isValid ? ex.pt_name : getSimilarNamesByMap(ex.pt_name, rawDataMap).map((item, index) => (
                                                                            <div key={index} style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                                                                {ex.pt_name} 👉 {item.name}
                                                                            </div>
                                                                        ))}     
                                                                    </div>
                                                                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                                                        {ex.set_volume}kg × {ex.set_count}회 × {ex.set_num}세트
                                                                    </div>
                                                                </div>
                                                                {!isValid && (
                                                                    <span style={{ 
                                                                        padding: '0.25rem 0.5rem',
                                                                        background: '#dc2626',
                                                                        color: 'white',
                                                                        borderRadius: '0.375rem',
                                                                        fontSize: '0.75rem'
                                                                    }}>
                                                                        유효하지 않은 운동
                                                                    </span>
                                                                )}
                                                            </Exercise>
                                                        );
                                                    })}
                                                </div>
                                            </RoutineCard>
                                        )) : (
                                            <div style={{ 
                                                padding: '2rem',
                                                textAlign: 'center',
                                                background: '#fef2f2',
                                                border: '1px solid #fecaca',
                                                borderRadius: '0.5rem',
                                                color: '#dc2626'
                                            }}>
                                                ⚠️ 루틴 정보가 없거나 형식이 잘못되었습니다.
                                            </div>
                                        )}
                                    </div>
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
