package org.fitsync.controller;

import org.fitsync.domain.MemberVO;
import org.fitsync.domain.ReportVO;
import org.fitsync.service.MemberServiceImple;
import org.fitsync.service.ReportServiceImple;
import org.fitsync.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import javax.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class NaverAuthController {

    @Value("${naver.client.id}")
    private String clientId;

    @Value("${naver.client.secret}")
    private String clientSecret;

    @Value("${naver.redirect.uri}")
    private String redirectUri;

    @Autowired
    private MemberServiceImple service;
    @Autowired
    private ReportServiceImple reportService;
    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/naver/url")
    public Map<String, Object> getNaverLoginUrl(HttpSession session) {
        String state = java.util.UUID.randomUUID().toString();
        session.setAttribute("naver_oauth_state", state);
        String loginUrl = "https://nid.naver.com/oauth2.0/authorize"
                + "?response_type=code"
                + "&client_id=" + clientId
                + "&redirect_uri=" + redirectUri
                + "&state=" + state;
        Map<String, Object> result = new HashMap<>();
        result.put("loginUrl", loginUrl);
        result.put("provider", "naver");
        return result;
    }

    // 네이버 콜백 (GET /auth/naver/callback)
    @GetMapping("/naver/callback")
    public ResponseEntity<Map<String, Object>> naverCallback(
            @RequestParam String code,
            @RequestParam String state,
            HttpSession session
    ) {
        Map<String, Object> result = new HashMap<>();
        try {
            // state 검증
            String sessionState = (String) session.getAttribute("naver_oauth_state");
            if (sessionState == null || !sessionState.equals(state)) {
                result.put("success", false);
                result.put("message", "잘못된 접근(state 불일치)");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(result);
            }
            session.removeAttribute("naver_oauth_state");

            // 토큰 요청
            String tokenUrl = "https://nid.naver.com/oauth2.0/token"
                    + "?grant_type=authorization_code"
                    + "&client_id=" + clientId
                    + "&client_secret=" + clientSecret
                    + "&code=" + code
                    + "&state=" + state;

            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<Map> tokenResponse = restTemplate.getForEntity(tokenUrl, Map.class);

            if (tokenResponse.getStatusCode() != HttpStatus.OK
                    || !tokenResponse.getBody().containsKey("access_token")) {
                result.put("success", false);
                result.put("message", "토큰 발급 실패");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
            }

            String accessToken = (String) tokenResponse.getBody().get("access_token");

            // 사용자 정보 요청
            HttpHeaders headers = new HttpHeaders();
            headers.add("Authorization", "Bearer " + accessToken);
            HttpEntity<?> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> profileResponse = restTemplate.exchange(
                    "https://openapi.naver.com/v1/nid/me",
                    HttpMethod.GET, entity, Map.class);

            if (profileResponse.getStatusCode() != HttpStatus.OK) {
                result.put("success", false);
                result.put("message", "사용자 정보 조회 실패");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
            }

            Map responseBody = profileResponse.getBody();
            Map userInfo = (Map) responseBody.get("response");

            // 사용자 정보로 JWT 발급 및 응답
            MemberVO vo = service.getFindUser((String) userInfo.get("email"));
            Map<String, Object> user = new HashMap<>();
            if (vo != null) {
            	// 제재 정보 확인
            	ReportVO rvo = reportService.getBlockData(vo.getMember_idx());
            	
                // JWT 생성 (member_idx만 저장)
            	 String jwt = jwtUtil.generateToken(
                     vo.getMember_idx(),
                     rvo.getReport_time(),
                     rvo.getBlock_count(),
                     vo.getMember_email()
                 );
                
                session.setAttribute("member_idx", vo.getMember_idx());

                String cookieValue = "accessToken=" + jwt + "; HttpOnly; Path=/; Max-Age=" + (7 * 24 * 60 * 60) + "; SameSite=Lax";

                user.put("member_email", vo.getMember_email());
                user.put("member_name", vo.getMember_name());
                user.put("member_image", vo.getMember_image());
                user.put("member_type", vo.getMember_type());
                user.put("member_idx", vo.getMember_idx());
                user.put("provider", "naver");
                user.put("isLogin", true);

                result.put("success", true);
                result.put("user", user);

                return ResponseEntity.ok()
                        .header(HttpHeaders.SET_COOKIE, cookieValue)
                        .body(result);
            } else {
                // 신규 회원도 JWT 발급
                String jwt = jwtUtil.generateToken(-1, null, 0, ""); // 신규 회원은 임시값(-1) 또는 email 등으로 처리
                String cookieValue = "accessToken=" + jwt + "; HttpOnly; Path=/; Max-Age=" + (7 * 24 * 60 * 60) + "; SameSite=Lax";

                user.put("member_name", userInfo.get("name"));
                user.put("member_email", userInfo.get("email"));
                user.put("member_image", userInfo.get("profile_image"));
                user.put("provider", "naver");
                user.put("isLogin", false);

                result.put("success", true);
                result.put("user", user);

                return ResponseEntity.ok()
                        .header(HttpHeaders.SET_COOKIE, cookieValue)
                        .body(result);
            }
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "네이버 로그인 처리 중 오류: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
    }

    // 네이버 로그인 상태 확인 (GET /auth/naver/status)
    @GetMapping("/naver/status")
    public ResponseEntity<Map<String, Object>> naverStatus(HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        Object memberIdx = session.getAttribute("member_idx");
        if (memberIdx != null) {
            result.put("isLoggedIn", true);
            // 필요시 user 정보도 추가
        } else {
            result.put("isLoggedIn", false);
        }

        return ResponseEntity.ok(result);
    }

    // 네이버 로그아웃 (POST /auth/naver/logout)
    @PostMapping("/naver/logout")
    public ResponseEntity<Map<String, Object>> naverLogout(HttpSession session) {
        session.removeAttribute("member_idx");
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        return ResponseEntity.ok(result);
    }
}