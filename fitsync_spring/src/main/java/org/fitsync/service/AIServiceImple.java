package org.fitsync.service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;
import java.time.LocalDateTime;

import org.fitsync.domain.ApiLogVO;
import org.fitsync.mapper.ApiLogMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class AIServiceImple implements AIService {

    @Value("${chatgpt.api.key}")
    private String apiKey;

    private static final String API_URL = "https://api.openai.com/v1/chat/completions";

    @Autowired
    private ApiLogMapper aiLogMapper;

    @Override
    public String requestAIResponse(String userMessage) throws IOException {
        Timestamp requestTime = new Timestamp(System.currentTimeMillis());
        
        String content = "";
        String status = "success";
        String errorMessage = null;
        int inputTokens = 0;
        int outputTokens = 0;
        Timestamp responseTime = null;
        String apiModel = "gpt-3.5-turbo";
        
        String requestBody = "{"
                + "\"model\":\""+ apiModel +"\","
                + "\"messages\":["
                + "{\"role\":\"system\",\"content\":\""
                + "너는 퍼스널 트레이너야. 사용자 정보를 기반으로 4분할 루틴을 추천해. "
                + "응답은 반드시 JSON 형식으로만 작성하고, 설명 없이 JSON만 응답해야 해. "
                + "result 배열 안에 반드시 4개의 루틴 묶음을 포함해야 해. "
                + "각 루틴은 1시간 분량이며, 운동 종목은 5~6개로 구성하고, 각 운동은 routine_set 배열로 세트 구성 정보를 포함해야 해. "
                + "복합 운동은 제외하고, 전문가들이 사용하는 공식 운동명만 사용해. 창작된 운동명은 금지하고, 대중적인 운동만 추천해. "
                + "형식: {\\\"result\\\":["
                + "{\\\"routineList\\\":{\\\"routine_title\\\":\\\"루틴 제목 A\\\"},"
                + "\\\"routines\\\":["
                + "{\\\"pt\\\":{\\\"pt_name\\\":\\\"운동명1\\\"},"
                + "\\\"routine_set\\\":["
                + "{\\\"set_num\\\":1,\\\"set_kg\\\":60,\\\"set_count\\\":10},"
                + "{\\\"set_num\\\":2,\\\"set_kg\\\":70,\\\"set_count\\\":8}"
                + "]}]},"
                + "{\\\"routineList\\\":{\\\"routine_title\\\":\\\"루틴 제목 B\\\"},\\\"routines\\\":[...]},"
                + "{\\\"routineList\\\":{\\\"routine_title\\\":\\\"루틴 제목 C\\\"},\\\"routines\\\":[...]},"
                + "{\\\"routineList\\\":{\\\"routine_title\\\":\\\"루틴 제목 D\\\"},\\\"routines\\\":[...]}"
                + "]}"
                + "\"},"
                + "{\"role\":\"user\",\"content\":\"" + userMessage + "\"}"
                + "]"
                + "}";

        try {
            URL url = new URL(API_URL);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("POST");
            connection.setRequestProperty("Authorization", "Bearer " + apiKey);
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setDoOutput(true);

            try (OutputStream os = connection.getOutputStream()) {
                os.write(requestBody.getBytes(StandardCharsets.UTF_8));
            }

            StringBuilder responseBuilder = new StringBuilder();
            try (BufferedReader br = new BufferedReader(new InputStreamReader(connection.getInputStream()))) {
                String line;
                while ((line = br.readLine()) != null) {
                    responseBuilder.append(line);
                }
            }

            responseTime = new Timestamp(System.currentTimeMillis());

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(responseBuilder.toString());
            content = root.path("choices").get(0).path("message").path("content").asText();
            inputTokens = root.path("usage").path("prompt_tokens").asInt();
            outputTokens = root.path("usage").path("completion_tokens").asInt();

        } catch (IOException e) {
            responseTime = new Timestamp(System.currentTimeMillis());
            status = "fail";
            content = e.getMessage();
        }

        // ⭐ 로그 저장은 실패해도 메인 로직에 영향 안 주게 처리
        try {
            ApiLogVO apiLog = new ApiLogVO();
            apiLog.setMember_idx(0); // 임시 ID
            apiLog.setApilog_prompt(requestBody);
            apiLog.setApilog_response(content);
            apiLog.setApilog_request_time(requestTime);
            apiLog.setApilog_response_time(responseTime);
            apiLog.setApilog_input_tokens(inputTokens);
            apiLog.setApilog_output_tokens(outputTokens);
            apiLog.setApilog_model(apiModel);
            apiLog.setApilog_version("0.0.3");
            apiLog.setApilog_status(status);
            apiLog.setApilog_service_type("사용자 정보 기반 운동 루틴 추천");

            aiLogMapper.insertApiLog(apiLog);
        } catch (Exception logEx) {
            // 여기서 DB 장애 발생 시 사용자 응답엔 영향 없음
            System.err.println("로그 저장 실패: " + logEx.getMessage());
            // 또는 로깅 프레임워크 사용: log.error(...)
        }

        // 요청 자체가 실패했으면 예외 던짐
        if ("fail".equals(status)) {
            throw new IOException("GPT 요청 실패: " + content);
        }

        return content;
        
    }
}
