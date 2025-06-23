package org.fitsync.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import javax.servlet.http.HttpSession;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.io.InputStream;

@Controller
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class GoogleAuthController {

    @PostMapping(value = "/google", consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> googleLogin(@RequestBody Map<String, String> body, HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        String idToken = body.get("idToken");

        try {
            // 1. 구글 토큰 검증 (Google API 사용)
            String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
            HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
            conn.setRequestMethod("GET");
            InputStream is = conn.getInputStream();

            ObjectMapper mapper = new ObjectMapper();
            JsonNode tokenInfo = mapper.readTree(is);

            // 2. 토큰이 유효한지 확인
            if (tokenInfo.has("email")) {
                // 3. 사용자 정보 추출
                String email = tokenInfo.get("email").asText();
                String name = tokenInfo.has("name") ? tokenInfo.get("name").asText() : "";
                String picture = tokenInfo.get("picture").asText();
                
                // 4. (선택) DB에서 사용자 조회 및 회원가입/로그인 처리

                // 5. 세션에 사용자 정보 저장 (예시)
                session.setAttribute("user", email);

                // 6. 성공 응답
                Map<String, Object> user = new HashMap<>();
                user.put("email", email);
                user.put("name", name);
                user.put("picture", picture);

                result.put("success", true);
                result.put("user", user);
                return ResponseEntity.ok(result);
            } else {
                result.put("success", false);
                result.put("message", "유효하지 않은 토큰입니다.");
                return ResponseEntity.ok(result);
            }
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Google 인증 처리 중 오류가 발생했습니다.");
            return ResponseEntity.ok(result);
        }
    }
}