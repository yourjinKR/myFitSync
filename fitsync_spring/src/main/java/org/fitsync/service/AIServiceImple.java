package org.fitsync.service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.fitsync.service.AIService;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class AIServiceImple implements AIService {

    @Value("${chatgpt.api.key}")
    private String apiKey;

    private static final String API_URL = "https://api.openai.com/v1/chat/completions";

    @Override
    public String requestAIResponse(String userMessage) throws IOException {
    	// System.out.println(apiKey);
    	
        URL url = new URL(API_URL);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();

        connection.setRequestMethod("POST");
        connection.setRequestProperty("Authorization", "Bearer " + apiKey);
        connection.setRequestProperty("Content-Type", "application/json");
        connection.setDoOutput(true);
        
        String requestBody = "{"
        	    + "\"model\":\"gpt-3.5-turbo\","
        	    + "\"messages\":["
        	    + "{\"role\":\"system\",\"content\":\""
        	    + "너는 퍼스널 트레이너야. 사용자 정보를 기반으로 맞춤 루틴을 추천해. "
        	    + "응답은 반드시 JSON 형식으로만 작성해야 하며, 설명 없이 JSON만 응답해. "
        	    + "복합 운동은 제외하고, 전문가들이 사용하는 공식 운동명만 사용해. 창작된 운동명은 금지하고, 대중적인 운동만 추천해. "
        	    + "루틴은 1시간 분량이므로 운동 종목을 5~6개 정도 추천해. "
        	    + "형식: {\\\"routineList\\\":{\\\"routine_title\\\":\\\"루틴 제목\\\",\\\"routine_category\\\":\\\"운동 부위\\\"},\\\"routines\\\":[{\\\"pt\\\":{\\\"pt_name\\\":\\\"운동명\\\",\\\"pt_category\\\":\\\"부위\\\"},\\\"routine\\\":{\\\"routine_memo\\\":\\\"주의 사항\\\"},\\\"routineSet\\\":{\\\"set_num\\\":3,\\\"set_kg\\\":60,\\\"set_count\\\":10}}]}"
        	    + "\"},"
        	    + "{\"role\":\"user\",\"content\":\"" + userMessage + "\"}"
        	    + "]"
        	    + "}";



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

        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(responseBuilder.toString());

        return root.path("choices").get(0).path("message").path("content").asText();
    }
    
    
}
