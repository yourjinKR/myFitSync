package org.fitsync.controller;

import org.fitsync.domain.MemberVO;
import org.fitsync.service.MemberServiceImple;
import org.fitsync.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import javax.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth/naver")
@CrossOrigin(origins = "*")
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
	private JwtUtil jwtUtil;

    @GetMapping("/login")
    public ResponseEntity<Map<String, Object>> naverLogin(HttpSession session) {
        String state = java.util.UUID.randomUUID().toString();
        session.setAttribute("naver_oauth_state", state); // CSRF 방지용 state 세션 저장
        String loginUrl = "https://nid.naver.com/oauth2.0/authorize"
                + "?response_type=code"
                + "&client_id=" + clientId
                + "&redirect_uri=" + redirectUri
                + "&state=" + state;

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("loginUrl", loginUrl);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/callback")
    public ResponseEntity<Map<String, Object>> naverCallback(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String error,
            HttpSession session
    ) {
        Map<String, Object> result = new HashMap<>();
        try {
            // 인증 실패 또는 파라미터 누락 처리
            if (error != null) {
                result.put("success", false);
                result.put("message", "네이버 인증 실패: " + error);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
            }
            if (code == null || state == null) {
                result.put("success", false);
                result.put("message", "필수 파라미터 누락");
                return ResponseEntity.badRequest().body(result);
            }
            // state 값 검증 (CSRF 방지)
            String sessionState = (String) session.getAttribute("naver_oauth_state");
            if (sessionState == null || !sessionState.equals(state)) {
                result.put("success", false);
                result.put("message", "잘못된 접근(state 불일치)");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(result);
            }
            session.removeAttribute("naver_oauth_state"); // state 재사용 방지

            // 액세스 토큰 요청
            String tokenUrl = UriComponentsBuilder.fromHttpUrl("https://nid.naver.com/oauth2.0/token")
                    .queryParam("grant_type", "authorization_code")
                    .queryParam("client_id", clientId)
                    .queryParam("client_secret", clientSecret)
                    .queryParam("code", code)
                    .queryParam("state", state)
                    .toUriString();

            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<Map> tokenResponse = restTemplate.getForEntity(tokenUrl, Map.class);

            // 토큰 발급 실패 처리
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

            ResponseEntity<Map> profileResponse = restTemplate.exchange("https://openapi.naver.com/v1/nid/me",
                    HttpMethod.GET, entity, Map.class);

            // 사용자 정보 조회 실패 처리
            if (profileResponse.getStatusCode() != HttpStatus.OK) {
                result.put("success", false);
                result.put("message", "사용자 정보 조회 실패");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
            }

            Map responseBody = profileResponse.getBody();
            Map userInfo = (Map) responseBody.get("response");

            // 프론트에 전달할 최소 정보만 추출
            MemberVO vo = service.getFindUser((String) userInfo.get("email"));
            Map<String, Object> user = new HashMap<>();
            if(vo != null) {
            	// JWT 생성
            	String jwt = jwtUtil.generateToken(vo.getMember_idx(), vo.getMember_email());
            	
            	// HttpOnly 쿠키 생성
            	ResponseCookie cookie = ResponseCookie.from("accessToken", jwt)
            			.httpOnly(true)
            			.secure(false) // 배포시 true
            			.path("/")
            			.maxAge(7 * 24 * 60 * 60)
            			.build();
            	
            	
            	user.put("member_email", vo.getMember_email());
            	user.put("member_name", vo.getMember_name());
            	user.put("member_image", vo.getMember_image());
            	user.put("member_type", vo.getMember_type());
            	user.put("provider", "naver");
            	user.put("isLogin", true);
            	
            	result.put("success", true);
            	result.put("user", user);
            	
            	return ResponseEntity.ok()
            			.header(HttpHeaders.SET_COOKIE, cookie.toString() + "; SameSite=Lax")
            			.body(result);
            }else {
            	// 이름, 이메일, 프로필이미지만 추출해서 반환
            	user.put("member_name", userInfo.get("name"));
            	user.put("member_email", userInfo.get("email"));
            	user.put("member_image", userInfo.get("profileImage"));
            	user.put("provider", "naver");
            	user.put("isLogin", false);
            	
            	result.put("success", true);
            	result.put("user", user);
            	
            	return ResponseEntity.ok(result);
            }

        } catch (Exception e) {
            // 예외 발생 시 내부 서버 오류 반환
            result.put("success", false);
            result.put("message", "네이버 로그인 처리 중 오류: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> naverStatus(HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        Object user = session.getAttribute("naverUser");
        if (user != null) {
            result.put("isLoggedIn", true);
            result.put("user", user);
        } else {
            result.put("isLoggedIn", false);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> naverLogout(HttpSession session) {
        session.removeAttribute("naverUser"); // 세션에서 사용자 정보 삭제
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        return ResponseEntity.ok(result);
    }
}