import { useState, useEffect } from 'react';
import axios from 'axios';
import { parseApiLogData } from '../../utils/apiLogUtils';

/**
 * API 로그 데이터 관리 훅
 * @returns {Object} API 로그 상태와 관련 함수들
 */
export const useApiLogs = () => {
    const [apiLogs, setApiLogs] = useState([]);
    const [loading, setLoading] = useState(false);

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

    // 컴포넌트 마운트 시 API 로그 데이터 가져오기
    useEffect(() => {
        fetchApiLogs();
    }, []);

    return {
        apiLogs,
        loading,
        fetchApiLogs,
        setApiLogs
    };
};
