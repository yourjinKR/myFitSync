package org.fitsync.domain;

import java.sql.Timestamp;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApiLogVO {
    private int apilog_idx; // 고유 id
    private int member_idx; // 호출한 회원
    private String apilog_prompt; // 입력 프롬프트 내용
    private String apilog_response; // 출력 내용
    private Timestamp apilog_request_time; // 요청 시간
    private Timestamp apilog_response_time; // 응답 시간
    private Integer apilog_input_tokens; // 입력 토큰
    private Integer apilog_output_tokens; // 출력 토큰
    private String apilog_model; // 모델 (예: gpt-3.5 turbo, gpt-4o)
    private String apilog_version; // Semantic Versioning
    private String apilog_status; // succcess, exception, fail
    private String apilog_service_type; // 사용자 정보 기반 운동 루틴 추천 (현재는 1개뿐이며 추후 확장성을 고려함)
    private String apilog_feedback; // LIKE, DISLIKE 
    private String apilog_feedback_reason; // exercise_type, timeout... (DISLIKE일때만 수집)
    private String apilog_status_reason; // invalid_exercise: 엉덩이 킥백 머신
    private String apilog_user_action; // 예: "saved-immediate", "ignored", "saved-after"
}