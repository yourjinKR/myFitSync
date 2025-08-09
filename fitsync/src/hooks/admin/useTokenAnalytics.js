import { useMemo } from 'react';

// GPT-4o 가격 정보 (USD)
export const PRICING = {
    'gpt-4o': {
        input: 2.5 / 1000000,   // $2.50 per 1 M tokens
        output: 10 / 1000000    // $10.00 per 1 M tokens
    },
    'gpt-3.5-turbo': {
        input: 1.5 / 1000000,   // $1.50 per 1 M tokens
        output: 2.0 / 1000000    // $2.00 per 1 M tokens
    },
    default: {
        input: 2 / 1000000,
        output: 6 / 1000000
    }
};

export const USD_TO_KRW = 1300; // 환율

/**
 * 토큰 사용량 분석 및 비용 계산 훅
 * @param {Array} apiLogs - API 로그 데이터
 * @param {Array} filteredLogs - 필터링된 API 로그 데이터
 * @returns {Object} 토큰 분석 및 비용 계산 결과
 */
export const useTokenAnalytics = (apiLogs, filteredLogs) => {
    const analytics = useMemo(() => {
        if (!filteredLogs || filteredLogs.length === 0) return null;

        // 전체 토큰 통계 계산
        const calculateOverallStats = () => {
            const totalInputTokens = filteredLogs.reduce((sum, log) => sum + (log.apilog_input_tokens || 0), 0);
            const totalOutputTokens = filteredLogs.reduce((sum, log) => sum + (log.apilog_output_tokens || 0), 0);
            const totalTokens = totalInputTokens + totalOutputTokens;

            // 비용 계산
            let totalCostUSD = 0;
            filteredLogs.forEach(log => {
                const model = log.apilog_model || 'default';
                const pricing = PRICING[model] || PRICING.default;
                const inputCost = (log.apilog_input_tokens || 0) * pricing.input;
                const outputCost = (log.apilog_output_tokens || 0) * pricing.output;
                totalCostUSD += inputCost + outputCost;
            });

            const totalCostKRW = totalCostUSD * USD_TO_KRW;

            return {
                totalInputTokens,
                totalOutputTokens,
                totalTokens,
                totalCostUSD: parseFloat(totalCostUSD.toFixed(4)),
                totalCostKRW: Math.round(totalCostKRW),
                avgTokensPerRequest: Math.round(totalTokens / filteredLogs.length),
                avgCostPerRequest: parseFloat((totalCostUSD / filteredLogs.length).toFixed(4))
            };
        };

        // 기간별 토큰 사용량 그룹화
        const groupByPeriod = (period = 'daily') => {
            const groups = {};
            
            filteredLogs.forEach(log => {
                const date = new Date(log.apilog_request_time);
                let key;
                
                switch (period) {
                    case 'hourly':
                        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
                        break;
                    case 'daily':
                        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                        break;
                    case 'weekly':
                        const startOfWeek = new Date(date);
                        startOfWeek.setDate(date.getDate() - date.getDay());
                        key = `${startOfWeek.getFullYear()}-W${String(Math.ceil(startOfWeek.getDate() / 7)).padStart(2, '0')}`;
                        break;
                    case 'monthly':
                        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                        break;
                    default:
                        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                }

                if (!groups[key]) {
                    groups[key] = {
                        period: key,
                        requests: 0,
                        inputTokens: 0,
                        outputTokens: 0,
                        totalTokens: 0,
                        costUSD: 0,
                        costKRW: 0,
                        logs: []
                    };
                }

                const model = log.apilog_model || 'default';
                const pricing = PRICING[model] || PRICING.default;
                const inputTokens = log.apilog_input_tokens || 0;
                const outputTokens = log.apilog_output_tokens || 0;
                const logCostUSD = (inputTokens * pricing.input) + (outputTokens * pricing.output);

                groups[key].requests += 1;
                groups[key].inputTokens += inputTokens;
                groups[key].outputTokens += outputTokens;
                groups[key].totalTokens += inputTokens + outputTokens;
                groups[key].costUSD += logCostUSD;
                groups[key].costKRW += logCostUSD * USD_TO_KRW;
                groups[key].logs.push(log);
            });

            // 정렬 및 반올림
            return Object.values(groups)
                .sort((a, b) => a.period.localeCompare(b.period))
                .map(group => ({
                    ...group,
                    costUSD: parseFloat(group.costUSD.toFixed(4)),
                    costKRW: Math.round(group.costKRW)
                }));
        };

        // 사용자별 토큰 사용량 분석
        const analyzeByUser = () => {
            const userStats = {};
            
            filteredLogs.forEach(log => {
                const userId = log.member_idx || 'unknown';
                
                if (!userStats[userId]) {
                    userStats[userId] = {
                        userId,
                        requests: 0,
                        inputTokens: 0,
                        outputTokens: 0,
                        totalTokens: 0,
                        costUSD: 0,
                        costKRW: 0
                    };
                }

                const model = log.apilog_model || 'default';
                const pricing = PRICING[model] || PRICING.default;
                const inputTokens = log.apilog_input_tokens || 0;
                const outputTokens = log.apilog_output_tokens || 0;
                const logCostUSD = (inputTokens * pricing.input) + (outputTokens * pricing.output);

                userStats[userId].requests += 1;
                userStats[userId].inputTokens += inputTokens;
                userStats[userId].outputTokens += outputTokens;
                userStats[userId].totalTokens += inputTokens + outputTokens;
                userStats[userId].costUSD += logCostUSD;
                userStats[userId].costKRW += logCostUSD * USD_TO_KRW;
            });

            return Object.values(userStats)
                .map(user => ({
                    ...user,
                    costUSD: parseFloat(user.costUSD.toFixed(4)),
                    costKRW: Math.round(user.costKRW)
                }))
                .sort((a, b) => b.totalTokens - a.totalTokens);
        };

        // 모델별 토큰 사용량 분석
        const analyzeByModel = () => {
            const modelStats = {};
            
            filteredLogs.forEach(log => {
                const model = log.apilog_model || 'unknown';
                
                if (!modelStats[model]) {
                    modelStats[model] = {
                        model,
                        requests: 0,
                        inputTokens: 0,
                        outputTokens: 0,
                        totalTokens: 0,
                        costUSD: 0,
                        costKRW: 0,
                        avgTokensPerRequest: 0,
                        avgCostPerRequest: 0
                    };
                }

                const pricing = PRICING[model] || PRICING.default;
                const inputTokens = log.apilog_input_tokens || 0;
                const outputTokens = log.apilog_output_tokens || 0;
                const logCostUSD = (inputTokens * pricing.input) + (outputTokens * pricing.output);

                modelStats[model].requests += 1;
                modelStats[model].inputTokens += inputTokens;
                modelStats[model].outputTokens += outputTokens;
                modelStats[model].totalTokens += inputTokens + outputTokens;
                modelStats[model].costUSD += logCostUSD;
                modelStats[model].costKRW += logCostUSD * USD_TO_KRW;
            });

            return Object.values(modelStats)
                .map(model => ({
                    ...model,
                    costUSD: parseFloat(model.costUSD.toFixed(4)),
                    costKRW: Math.round(model.costKRW),
                    avgTokensPerRequest: Math.round(model.totalTokens / model.requests),
                    avgCostPerRequest: parseFloat((model.costUSD / model.requests).toFixed(4))
                }))
                .sort((a, b) => b.totalTokens - a.totalTokens);
        };

        // 시간별 사용 패턴 분석
        const analyzeHourlyPattern = () => {
            const hourlyStats = Array(24).fill(null).map((_, hour) => ({
                hour,
                requests: 0,
                tokens: 0,
                cost: 0
            }));

            filteredLogs.forEach(log => {
                const hour = new Date(log.apilog_request_time).getHours();
                const model = log.apilog_model || 'default';
                const pricing = PRICING[model] || PRICING.default;
                const tokens = (log.apilog_input_tokens || 0) + (log.apilog_output_tokens || 0);
                const cost = ((log.apilog_input_tokens || 0) * pricing.input) + ((log.apilog_output_tokens || 0) * pricing.output);

                hourlyStats[hour].requests += 1;
                hourlyStats[hour].tokens += tokens;
                hourlyStats[hour].cost += cost;
            });

            return hourlyStats.map(stat => ({
                ...stat,
                cost: parseFloat(stat.cost.toFixed(4))
            }));
        };

        // 예측 계산
        const calculateProjections = (dailyData) => {
            if (dailyData.length < 3) return null;

            const recentDays = dailyData.slice(-7); // 최근 7일
            const avgDailyCost = recentDays.reduce((sum, day) => sum + day.costKRW, 0) / recentDays.length;
            const avgDailyTokens = recentDays.reduce((sum, day) => sum + day.totalTokens, 0) / recentDays.length;

            return {
                dailyAvgCost: Math.round(avgDailyCost),
                dailyAvgTokens: Math.round(avgDailyTokens),
                weeklyProjection: Math.round(avgDailyCost * 7),
                monthlyProjection: Math.round(avgDailyCost * 30),
                yearlyProjection: Math.round(avgDailyCost * 365)
            };
        };

        // 오늘의 데이터 계산
        const calculateTodayStats = () => {
            const today = new Date().toISOString().split('T')[0];
            const todayLogs = filteredLogs.filter(log => {
                if (!log.apilog_request_time) return false;
                
                const logDate = new Date(log.apilog_request_time);
                if (isNaN(logDate.getTime())) return false;
                
                const logDateString = logDate.toISOString().split('T')[0];
                return logDateString === today;
            });

            if (todayLogs.length === 0) {
                return {
                    totalRequests: 0,
                    totalTokens: 0,
                    totalCostKRW: 0,
                    totalCostUSD: 0,
                    successRate: 0,
                    avgResponseTime: 0
                };
            }

            const totalInputTokens = todayLogs.reduce((sum, log) => sum + (log.apilog_input_tokens || 0), 0);
            const totalOutputTokens = todayLogs.reduce((sum, log) => sum + (log.apilog_output_tokens || 0), 0);
            const totalTokens = totalInputTokens + totalOutputTokens;

            // 정확한 비용 계산 (각 로그의 모델에 따라)
            let totalCostUSD = 0;
            todayLogs.forEach(log => {
                const model = log.apilog_model || 'default';
                const pricing = PRICING[model] || PRICING.default;
                const inputCost = (log.apilog_input_tokens || 0) * pricing.input;
                const outputCost = (log.apilog_output_tokens || 0) * pricing.output;
                totalCostUSD += inputCost + outputCost;
            });

            const successCount = todayLogs.filter(log => log.apilog_status === 'success').length;
            const totalResponseTime = todayLogs.reduce((sum, log) => {
                const responseTime = parseFloat(log.apilog_total_time) || 0;
                return sum + responseTime;
            }, 0);

            return {
                totalRequests: todayLogs.length,
                totalTokens,
                totalInputTokens,
                totalOutputTokens,
                totalCostKRW: Math.round(totalCostUSD * USD_TO_KRW),
                totalCostUSD: parseFloat(totalCostUSD.toFixed(4)),
                successRate: todayLogs.length > 0 ? parseFloat(((successCount / todayLogs.length) * 100).toFixed(1)) : 0,
                avgResponseTime: todayLogs.length > 0 ? parseFloat((totalResponseTime / todayLogs.length).toFixed(2)) : 0
            };
        };

        // 모든 분석 실행
        const overallStats = calculateOverallStats();
        const dailyData = groupByPeriod('daily');
        const weeklyData = groupByPeriod('weekly');
        const monthlyData = groupByPeriod('monthly');
        const hourlyData = groupByPeriod('hourly');
        const userAnalysis = analyzeByUser();
        const modelAnalysis = analyzeByModel();
        const hourlyPattern = analyzeHourlyPattern();
        const projections = calculateProjections(dailyData);
        const todayStats = calculateTodayStats();

        return {
            overallStats,
            dailyData,
            weeklyData,
            monthlyData,
            hourlyData,
            userAnalysis,
            modelAnalysis,
            hourlyPattern,
            projections,
            todayStats,
            pricing: PRICING,
            exchangeRate: USD_TO_KRW
        };
    }, [filteredLogs]);

    return analytics;
};
