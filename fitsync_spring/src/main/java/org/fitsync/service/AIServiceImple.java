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
