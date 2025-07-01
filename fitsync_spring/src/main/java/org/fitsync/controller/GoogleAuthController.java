package org.fitsync.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.fitsync.domain.MemberVO;
import org.fitsync.service.MemberServiceImple;
import org.fitsync.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import javax.servlet.http.HttpSession;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.io.InputStream;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*", allowCredentials = "true")  // allowCredentials 꼭 추가
public class GoogleAuthController {

    @Autowired
    private MemberServiceImple service;
    @Autowired
	private JwtUtil jwtUtil;

    @PostMapping(value = "/google", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> googleLogin(@RequestBody Map<String, String> body, HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        String idToken = body.get("idToken");

        try {
            // 1. 구글 토큰 검증
            String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
            HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
            conn.setRequestMethod("GET");
            InputStream is = conn.getInputStream();

            ObjectMapper mapper = new ObjectMapper();
            JsonNode tokenInfo = mapper.readTree(is);
            if (tokenInfo.has("email")) {
                String email = tokenInfo.get("email").asText();
                String name = tokenInfo.has("name") ? tokenInfo.get("name").asText() : "";
                String picture = tokenInfo.has("picture") ? tokenInfo.get("picture").asText() : "";

                MemberVO vo = service.getFindUser(email);
                if(vo != null) {
                    // JWT 생성 (member_idx만 저장)
                    String jwt = jwtUtil.generateToken(vo.getMember_idx());
                    // HttpOnly 쿠키 생성
                    ResponseCookie cookie = ResponseCookie.from("accessToken", jwt)
                            .httpOnly(true)
                            .secure(false) // 배포시 true
                            .path("/")
                            .maxAge(7 * 24 * 60 * 60)
                            .build();
                    
                    Map<String, Object> user = new HashMap<>();
                    
                    user.put("member_email", vo.getMember_email());
                    user.put("member_name", vo.getMember_name());
                    user.put("member_image", vo.getMember_image());
                    user.put("member_type", vo.getMember_type());
                    user.put("isLogin", true);
                    
                    result.put("success", true);
                    result.put("user", user);
                    
                    return ResponseEntity.ok()
                            .header(HttpHeaders.SET_COOKIE, cookie.toString() + "; SameSite=Lax")
                            .body(result);
                }else {
                	Map<String, Object> user = new HashMap<>();
                	user.put("member_email", email);
                	user.put("member_name", name);
                	user.put("member_image", picture);
                	user.put("isLogin", false);
                	
                	result.put("success", true);
                	result.put("user", user);
                	return ResponseEntity.ok(result);
                }

            } else {
                result.put("success", false);
                result.put("message", "유효하지 않은 토큰입니다.");
                return ResponseEntity.ok(result);
            }
        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
            result.put("message", "Google 인증 처리 중 오류가 발생했습니다.");
            return ResponseEntity.ok(result);
        }
    }
}
