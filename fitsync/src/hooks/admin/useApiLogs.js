import { useState, useEffect } from 'react';
import axios from 'axios';
import AiUtil from '../../utils/AiUtils';

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
            const response = await axios.get('/admin/apis');
            setApiLogs(response.data.map(item => AiUtil.parseApiLogData(item)));
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

/**
 * 사용자 전용 API 로그 조회 훅
 * @param {number|null} memberIdx - 사용자 인덱스
 * @returns {Object} 파싱된 로그 상태와 관련 함수들
 */
export const useUserApiLogs = (memberIdx) => {
    const [apiLogs, setApiLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchUserApiLogs = async () => {
        if (!memberIdx) return;
        setLoading(true);
        try {
            const response = await axios.get(`/ai/apilog/${memberIdx}`, {
                withCredentials: true
            });
            const parsed = response.data.map(item => AiUtil.parseApiLogData(item));
            setApiLogs(parsed);
        } catch (error) {
            console.error('사용자 API 로그 가져오기 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (memberIdx) {
            fetchUserApiLogs();
        }
    }, [memberIdx]);

    return {
        apiLogs,
        loading,
        fetchUserApiLogs,
        setApiLogs
    };
};
