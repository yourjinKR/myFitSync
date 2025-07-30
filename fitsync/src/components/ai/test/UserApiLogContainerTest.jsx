import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import LogsTab from "../../admin/tabs/LogsTab";
import LogDetailModal from "../../admin/logs/LogDetailModal";
import { useWorkoutNames } from "../../../hooks/admin/useWorkoutNames"; // 필요 시
import { useUserApiLogs } from "../../../hooks/admin/useApiLogs";

const UserApiLogContainerTest = () => {
    const memberIdx = useSelector(state => state.user?.user?.member_idx);

    // 사용자 로그 데이터 가져오기 (파싱 포함)
    const { apiLogs, loading } = useUserApiLogs(memberIdx);

    // 상세 보기 모달 상태
    const [selectedLog, setSelectedLog] = useState(null);

    // 운동명 파싱 데이터 (선택적으로 사용)
    const { rawData, rawDataIdx, rawDataMap } = useWorkoutNames();

    // 모달 내에서 이전/다음 로그 보기
    const handleSelectedLog = (direction) => {
        const currentIndex = apiLogs.findIndex(log => log.apilog_idx === selectedLog?.apilog_idx);
        const newIndex = currentIndex + direction;
        if (newIndex >= 0 && newIndex < apiLogs.length) {
            setSelectedLog(apiLogs[newIndex]);
        }
    };

    return (
        <div>
            <LogsTab
                filteredLogs={apiLogs}
                apiLogs={apiLogs}
                setSelectedLog={setSelectedLog}
                selectedLog={selectedLog}
                isLoading={loading}
                stats={null} // 사용자 페이지에선 통계 생략 가능
            />

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
                        currentIndex: apiLogs.findIndex(log => log.apilog_idx === selectedLog?.apilog_idx),
                        total: apiLogs.length,
                        isFiltered: false
                    }}
                />
            )}
        </div>
    );
};

export default UserApiLogContainerTest;
