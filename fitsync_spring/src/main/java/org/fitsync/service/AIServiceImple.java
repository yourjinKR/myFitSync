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
import java.util.*;
import java.util.stream.Collectors;

import org.fitsync.domain.ApiLogVO;
import org.fitsync.domain.ApiResponseDto;
import org.fitsync.mapper.ApiLogMapper;
import org.fitsync.mapper.PtMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class AIServiceImple implements AIService {

    @Value("${chatgpt.api.key}")
    private String apiKey;

    private static final String API_URL = "https://api.openai.com/v1/chat/completions";

    @Autowired
    private ApiLogMapper apiLogMapper;
	@Autowired
	private PtMapper ptMapper;
	
	public String getWorkoutNamesJsonArray() {
	    List<String> names = ptMapper.getWorkOutName();
	    String jsonArray = names.stream()
	        .map(name -> "\"" + name + "\"")
	        .collect(Collectors.joining(", ", "[", "]"));
	    return jsonArray;
	}
	
	public String getWorkoutNamesCommaSeparated() {
	    List<String> names = ptMapper.getWorkOutName();
	    return names.stream()
	                .collect(Collectors.joining(", "));
	}
	

    @Override
    public ApiResponseDto requestAIResponse(String userMessage, int memberIdx) throws IOException {
        Timestamp requestTime = new Timestamp(System.currentTimeMillis());
        String workoutList = getWorkoutNamesCommaSeparated();
        Integer logIdx = null;

        String content = "";
        String status = "success";
        String errorMessage = null;
        int inputTokens = 0;
        int outputTokens = 0;
        Timestamp responseTime = null;
        String apiModel = "gpt-4o";

        // 1. 메시지 구성
        String systemContent =
		    "너는 퍼스널 트레이너야. 아래 사용자 정보(JSON)를 기반으로, 분할 루틴을 추천해.\n\n" +
		    "사용자 정보는 다음 필드를 포함해:\n" +
		    "- age: 사용자 나이 (정수)\n" +
		    "- gender : 성별 (남성, 여성)" +
		    "- height: 키 (cm)\n" +
		    "- weight: 몸무게 (kg)\n" +
		    "- bmi: 체질량지수\n" +
		    "- fat: 체지방량 (kg)\n" +
		    "- fat_percentage: 체지방률 (%)\n" +
		    "- skeletal_muscle: 골격근량 (kg)\n" +
		    "- disease: 사용자가 불편한 신체 부위 (예: [무릎, 발목...])\n" +
		    "- purpose: 운동 목적 (예: 다이어트, 근력 증가, 체형 교정 등)\n" +
		    "- day: 운동 가능한 요일 (예: 월, 수, 금)\n" +
		    "- time: 운동 가능한 시간대 (예: 오전, 오후, 저녁)\n" +
		    "- split: 사용자가 원하는 루틴 분할 수 (예: 3이면 3분할 루틴 생성)\n\n" +
		    "이 정보들을 기반으로 루틴을 작성하고, 응답은 반드시 JSON 형식으로만 작성하고, 어떤 설명이나 텍스트도 포함 금지. 마크다운 또한 금지\n" +
		    "루틴은 분할 수에 맞춰 나눠야 하며, 각 루틴은 운동 4~6개, 1시간 분량으로 구성해.\n" +
		    "운동 목록은 다음과 같으며 아래 중에서만 선택해.\n" +
		    "운동 목록  :" + workoutList +"\n" +
		    "각 운동은 아래 항목을 포함해야 해:\n" + 
		    "- pt_name: 운동 이름\n" +
		    "- set_volume: 중량 또는 시간 (중량이 필요한 운동은 숫자만 입력하고 단위 없이 kg 기준, 유산소 운동과 같이 시간이 필요한 경우 초 단위로 입력하되 단위 생략. 반드시 숫자로만 출력.)\n" +
		    "- set_count: 횟수\n" +
		    "- set_num: 세트 수\n\n" +
		    "형식 예시:\n" +
		    "[\n" +
		    "  {\n" +
		    "    \"routine_name\": \"가슴 등 루틴\",\n" +
		    "    \"exercises\": [\n" +
		    "      {\"pt_name\": \"벤치프레스\", \"set_volume\": 60, \"set_count\": 10, \"set_num\": 4},\n" +
		    "      {\"pt_name\": \"랫풀다운\", \"set_volume\": 50, \"set_count\": 10, \"set_num\": 4}\n" +
		    "    ]\n" +
		    "  },\n" +
		    "  {\n" +
		    "    \"routine_name\": \"하체 루틴\",\n" +
		    "    \"exercises\": [\n" +
		    "      {\"pt_name\": \"스쿼트\", \"set_volume\": 80, \"set_count\": 10, \"set_num\": 4},\n" +
		    "      {\"pt_name\": \"레그프레스\", \"set_volume\": 100, \"set_count\": 10, \"set_num\": 4}\n" +
		    "    ]\n" +
		    "  }\n" +
		    "]";

        // 2. 메시지를 Jackson으로 구성
        ObjectMapper mapper = new ObjectMapper();

        Map<String, Object> systemMessage = new HashMap<>();
        systemMessage.put("role", "system");
        systemMessage.put("content", systemContent);

        Map<String, Object> userMessageMap = new HashMap<>();
        userMessageMap.put("role", "user");
        userMessageMap.put("content", userMessage);

        List<Map<String, Object>> messages = new ArrayList<>();
        messages.add(systemMessage);
        messages.add(userMessageMap);

        Map<String, Object> body = new HashMap<>();
        body.put("model", apiModel);
        body.put("messages", messages);

        String requestBody = mapper.writeValueAsString(body);

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

            JsonNode root = mapper.readTree(responseBuilder.toString());
            content = root.path("choices").get(0).path("message").path("content").asText();
            inputTokens = root.path("usage").path("prompt_tokens").asInt();
            outputTokens = root.path("usage").path("completion_tokens").asInt();

        } catch (IOException e) {
            responseTime = new Timestamp(System.currentTimeMillis());
            status = "fail";
            content = e.getMessage();
        }

        // 로그 저장
        try {
            ApiLogVO apiLog = new ApiLogVO();
            apiLog.setMember_idx(memberIdx);
            apiLog.setApilog_prompt(requestBody);
            apiLog.setApilog_response(content);
            apiLog.setApilog_request_time(requestTime);
            apiLog.setApilog_response_time(responseTime);
            apiLog.setApilog_input_tokens(inputTokens);
            apiLog.setApilog_output_tokens(outputTokens);
            apiLog.setApilog_model(apiModel);
            apiLog.setApilog_version("0.1.2");
            apiLog.setApilog_status(status);
            apiLog.setApilog_service_type("사용자 정보 기반 운동 루틴 추천");

            apiLogMapper.insertApiLog(apiLog);
            
            logIdx = apiLog.getApilog_idx();
            
        } catch (Exception logEx) {
            System.err.println("로그 저장 실패: " + logEx.getMessage());
        }

        if ("fail".equals(status)) {
            throw new IOException("GPT 요청 실패: " + content);
        }

        return new ApiResponseDto(content, logIdx);
    }

}
