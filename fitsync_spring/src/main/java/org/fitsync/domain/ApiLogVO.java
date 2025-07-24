package org.fitsync.domain;

import java.sql.Timestamp;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApiLogVO {
    private int apilog_idx;
    private int member_idx;
    private String apilog_prompt;
    private String apilog_response;
    private Timestamp apilog_request_time;
    private Timestamp apilog_response_time;
    private Integer apilog_input_tokens; // 입력 토큰
    private Integer apilog_output_tokens; // 출력 토큰
    private String apilog_model;
    private String apilog_version;
    private String apilog_status;
    private String apilog_service_type;
    private String apilog_feedback;
    private String apilog_feedback_reason;
    private String apilog_status_reason;
}