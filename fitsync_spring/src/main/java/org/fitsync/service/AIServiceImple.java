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
        
        String requestBody = "{\n" +
        	    "  \"model\": \"gpt-3.5-turbo\",\n" +
        	    "  \"messages\": [\n" +
        	    "    { \"role\": \"system\", \"content\": "
        	    + "\"너는 퍼스널 트레이너야. 응답은 JSON 형식만 사용해야 해. "
        	    + "형식: { 'mon': { 'workList': [ { 'name': '운동명', 'kg': 숫자, 'count': 숫자, 'set': 숫자 } ] }, ... } "
        	    + "모든 요일 포함. 설명 금지. \" },\n" +
        	    "    { \"role\": \"user\", \"content\": \"" + userMessage + "\" }\n" +
        	    "  ]\n" +
        	    "}";


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
