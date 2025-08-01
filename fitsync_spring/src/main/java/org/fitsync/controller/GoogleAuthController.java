package org.fitsync.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.fitsync.domain.MemberVO;
import org.fitsync.domain.ReportVO;
import org.fitsync.service.MemberServiceImple;
import org.fitsync.service.ReportServiceImple;
import org.fitsync.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.sql.Date;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class GoogleAuthController {

    @Autowired
    private MemberServiceImple service;
    @Autowired
    private ReportServiceImple reportService;
    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping(value = "/google", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> googleLogin(@RequestBody Map<String, String> body) {
        Map<String, Object> result = new HashMap<>();
        String idToken = body.get("idToken");
        String email = body.get("email");
        String name = body.get("name");
        String picture = body.get("picture");

        try {
            // ID 토큰이 있는 경우 (credential response)
            if (idToken != null && !idToken.isEmpty()) {
                // 구글 토큰 검증
                String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
                HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
                conn.setRequestMethod("GET");
                
                int responseCode = conn.getResponseCode();
                
                if (responseCode == 200) {
                    InputStream is = conn.getInputStream();
                    ObjectMapper mapper = new ObjectMapper();
                    JsonNode tokenInfo = mapper.readTree(is);
                    
                    if (tokenInfo.has("email")) {
                        email = tokenInfo.get("email").asText();
                        name = tokenInfo.has("name") ? tokenInfo.get("name").asText() : "";
                        picture = tokenInfo.has("picture") ? tokenInfo.get("picture").asText() : "";
                    }
                } else {
                    result.put("success", false);
                    result.put("message", "Google 토큰 검증에 실패했습니다.");
                    return ResponseEntity.ok(result);
                }
            }

            // 이메일이 있는 경우 처리
            if (email != null && !email.isEmpty()) {
                MemberVO vo = service.getFindUser(email);

                if (vo != null) {
                    ReportVO rvo = reportService.getBlockData(vo.getMember_idx());

                    // JWT 생성 (email 포함)
                    String jwt = jwtUtil.generateToken(
                        vo.getMember_idx(),
                        rvo.getReport_time(),
                        rvo.getBlock_count(),
                        vo.getMember_email()
                    );

                    String cookieValue = "accessToken=" + jwt +
                            "; HttpOnly" +
                            "; Path=/" +
                            "; Max-Age=" + (8 * 60 * 60) + // 8시간
                            "; SameSite=Lax";
                    Map<String, Object> user = new HashMap<>();
                    user.put("member_email", vo.getMember_email());
                    user.put("member_name", vo.getMember_name());
                    user.put("member_image", vo.getMember_image());
                    user.put("member_type", vo.getMember_type());
                    user.put("member_idx", vo.getMember_idx());
                    user.put("isLogin", true);

                    result.put("success", true);
                    result.put("user", user);
                    return ResponseEntity.ok()
                            .header(HttpHeaders.SET_COOKIE, cookieValue)
                            .body(result);
                } else {
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
                result.put("message", "유효하지 않은 요청입니다. 이메일 정보가 필요합니다.");
                return ResponseEntity.ok(result);
            }
        } catch (Exception e) {
            e.printStackTrace();
            if (e instanceof java.net.ConnectException) {
                result.put("success", false);
                result.put("message", "Google 서버에 연결할 수 없습니다. 네트워크를 확인해주세요.");
            } else if (e instanceof java.io.IOException) {
                result.put("success", false);
                result.put("message", "Google 인증 처리 중 네트워크 오류가 발생했습니다.");
            } else {
                result.put("success", false);
                result.put("message", "Google 인증 처리 중 오류가 발생했습니다: " + e.getMessage());
            }
            return ResponseEntity.ok(result);
        }
    }
}