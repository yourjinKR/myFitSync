package org.fitsync.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.fitsync.domain.MemberVO;
import org.fitsync.domain.ReportVO;
import org.fitsync.service.MemberServiceImple;
import org.fitsync.service.ReportServiceImple;
import org.fitsync.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpSession;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class KakaoAuthController {

    // application.properties에서 값 주입
    @Value("${kakao.client.id}")
    private String kakaoClientId;

    @Value("${kakao.client.secret}")
    private String kakaoClientSecret;

    @Value("${kakao.redirect.uri}")
    private String kakaoRedirectUri;

	@Autowired
	private MemberServiceImple service;
	@Autowired
	private ReportServiceImple reportService;
	@Autowired
	private JwtUtil jwtUtil;

	private final ObjectMapper objectMapper = new ObjectMapper();

	// 카카오 로그인 처리 (프론트에서 accessToken을 받아옴)
	@PostMapping(value = "/kakao", consumes = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<Map<String, Object>> kakaoLogin(@RequestBody Map<String, String> body, HttpSession session) {
		Map<String, Object> result = new HashMap<>();
		String accessToken = body.get("accessToken");

		try {
			// 1. 카카오 accessToken으로 사용자 정보 요청
			URL url = new URL("https://kapi.kakao.com/v2/user/me");
			HttpURLConnection conn = (HttpURLConnection) url.openConnection();
			conn.setRequestMethod("GET");
			conn.setRequestProperty("Authorization", "Bearer " + accessToken);

			InputStream is = conn.getInputStream();
			JsonNode userInfo = objectMapper.readTree(is);

			String email = userInfo.path("kakao_account").path("email").asText();
			String name = userInfo.path("kakao_account").path("profile").path("nickname").asText();
			String profileImage = userInfo.path("kakao_account").path("profile").path("profile_image_url").asText();

			MemberVO vo = service.getFindUser(email);
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

				// 세션에 member_idx 저장
				session.setAttribute("member_idx", vo.getMember_idx());

				String cookieValue = "accessToken=" + jwt + "; HttpOnly" + "; Path=/" + "; Max-Age="
						+ (7 * 24 * 60 * 60) + "; SameSite=Lax";

				Map<String, Object> user = new HashMap<>();
				user.put("member_email", vo.getMember_email());
				user.put("member_name", vo.getMember_name());
				user.put("member_image", vo.getMember_image());
				user.put("member_type", vo.getMember_type());
				user.put("member_idx", vo.getMember_idx());
				user.put("provider", "kakao");
				user.put("isLogin", true);

				result.put("success", true);
				result.put("user", user);
				return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookieValue).body(result);
			} else {
				Map<String, Object> user = new HashMap<>();
				user.put("member_email", email);
				user.put("member_name", name);
				user.put("member_image", profileImage);
				user.put("provider", "kakao");
				user.put("isLogin", false);

				result.put("success", true);
				result.put("user", user);
				return ResponseEntity.ok(result);
			}
		} catch (Exception e) {
			e.printStackTrace();
			result.put("success", false);
			result.put("message", "카카오 인증 처리 중 오류가 발생했습니다.");
			return ResponseEntity.ok(result);
		}
	}
	
	@GetMapping("/kakao/callback")
	public ResponseEntity<Map<String, Object>> kakaoCallback(@RequestParam("code") String code, HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        try {
            // 1. 인가 코드로 accessToken 요청
            String tokenUrl = "https://kauth.kakao.com/oauth/token"
                    + "?grant_type=authorization_code"
                    + "&client_id=" + kakaoClientId
                    + "&redirect_uri=" + kakaoRedirectUri
                    + "&code=" + code
                    + "&client_secret=" + kakaoClientSecret;

            URL url = new URL(tokenUrl);
	        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
	        conn.setRequestMethod("POST");
	        conn.setDoOutput(true);

	        InputStream is = conn.getInputStream();
	        JsonNode tokenResponse = objectMapper.readTree(is);
	        String accessToken = tokenResponse.path("access_token").asText();

	        // 2. accessToken으로 사용자 정보 요청
	        URL meUrl = new URL("https://kapi.kakao.com/v2/user/me");
	        HttpURLConnection meConn = (HttpURLConnection) meUrl.openConnection();
	        meConn.setRequestMethod("GET");
	        meConn.setRequestProperty("Authorization", "Bearer " + accessToken);

	        InputStream meIs = meConn.getInputStream();
	        JsonNode userInfo = objectMapper.readTree(meIs);

	        String email = userInfo.path("kakao_account").path("email").asText();
	        String name = userInfo.path("kakao_account").path("profile").path("nickname").asText();
	        String profileImage = userInfo.path("kakao_account").path("profile").path("profile_image_url").asText();

	        MemberVO vo = service.getFindUser(email);
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

	            Map<String, Object> user = new HashMap<>();
	            user.put("member_email", vo.getMember_email());
	            user.put("member_name", vo.getMember_name());
	            user.put("member_image", vo.getMember_image());
	            user.put("member_type", vo.getMember_type());
	            user.put("member_idx", vo.getMember_idx());
	            user.put("provider", "kakao");
	            user.put("isLogin", true);

	            result.put("success", true);
	            result.put("user", user);
	            return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookieValue).body(result);
	        } else {
	            Map<String, Object> user = new HashMap<>();
	            user.put("member_email", email);
	            user.put("member_name", name);
	            user.put("member_image", profileImage);
	            user.put("provider", "kakao");
	            user.put("isLogin", false);

	            result.put("success", true);
	            result.put("user", user);
	            return ResponseEntity.ok(result);
	        }
	    } catch (Exception e) {
	        e.printStackTrace();
	        result.put("success", false);
	        result.put("message", "카카오 인증 처리 중 오류가 발생했습니다.");
	        return ResponseEntity.ok(result);
	    }
	}

	@GetMapping("/kakao/url")
	public Map<String, Object> getKakaoLoginUrl() {
	    Map<String, Object> result = new HashMap<>();
	    String kakaoAuthUrl = "https://kauth.kakao.com/oauth/authorize"
	            + "?client_id=" + kakaoClientId
	            + "&redirect_uri=" + kakaoRedirectUri
	            + "&response_type=code";
	    result.put("loginUrl", kakaoAuthUrl);
	    result.put("provider", "kakao");
	    return result;
	}

}