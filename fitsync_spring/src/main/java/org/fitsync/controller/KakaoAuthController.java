package org.fitsync.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;
import org.fitsync.domain.MemberVO;
import org.fitsync.service.MemberServiceImple;
import org.fitsync.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpSession;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class KakaoAuthController {
    @Value("${kakao.client.id}")
    private String clientId;
    
    @Value("${kakao.client.secret}")
    private String clientSecret;
    
    @Value("${kakao.redirect.uri}")
    private String redirectUri;
    
    @Value("${kakao.auth.url:https://kauth.kakao.com/oauth/authorize}")
    private String authUrl;
    
    @Value("${kakao.token.url:https://kauth.kakao.com/oauth/token}")
    private String tokenUrl;
    
    @Value("${kakao.user.info.url:https://kapi.kakao.com/v2/user/me}")
    private String userInfoUrl;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClients.createDefault();
    
    @Autowired
    private MemberServiceImple service;
    @Autowired
	private JwtUtil jwtUtil;
    
    // 카카오 로그인 URL 반환
    @GetMapping("/kakao/url")
    public ResponseEntity<Map<String, String>> getKakaoLoginUrl() {
        String loginUrl = authUrl + 
                         "?client_id=" + clientId +
                         "&redirect_uri=" + redirectUri +
                         "&response_type=code";
        
        Map<String, String> response = new HashMap<>();
        response.put("loginUrl", loginUrl);
        response.put("provider", "kakao");
        
        return ResponseEntity.ok(response);
    }
    
    // 카카오 콜백 처리
    @GetMapping("/kakao/callback")
    public ResponseEntity<Map<String, Object>> kakaoCallback(@RequestParam String code, HttpSession session) {
        try {
            // 1. 액세스 토큰 요청
            String accessToken = getAccessToken(code);

            // 2. 사용자 정보 요청
            Map<String, Object> userInfo = getUserInfo(accessToken);

            MemberVO vo = service.getFindUser((String) userInfo.get("email"));
            Map<String, Object> result = new HashMap<>();
            Map<String, Object> user = new HashMap<>();
            if(vo != null) {
            	// JWT 생성
            	String jwt = jwtUtil.generateToken(vo.getMember_idx());
            	
            	// 세션에 member_idx 저장
            	session.setAttribute("member_idx", vo.getMember_idx());
            	
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
            	user.put("provider", "kakao");
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
            	user.put("provider", "kakao");
            	user.put("isLogin", false);
            	
            	result.put("success", true);
            	result.put("user", user);
            	
            	return ResponseEntity.ok(result);
            }
            
            

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "카카오 로그인 처리 중 오류가 발생했습니다.");
            errorResponse.put("message", e.getMessage());

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // 액세스 토큰 요청
    private String getAccessToken(String code) throws Exception {
        HttpPost httpPost = new HttpPost(tokenUrl);
        
        List<NameValuePair> params = new ArrayList<>();
        params.add(new BasicNameValuePair("grant_type", "authorization_code"));
        params.add(new BasicNameValuePair("client_id", clientId));
        params.add(new BasicNameValuePair("client_secret", clientSecret));
        params.add(new BasicNameValuePair("redirect_uri", redirectUri));
        params.add(new BasicNameValuePair("code", code));
        
        httpPost.setEntity(new UrlEncodedFormEntity(params, "UTF-8"));
        httpPost.setHeader("Content-Type", "application/x-www-form-urlencoded");
        
        HttpResponse response = httpClient.execute(httpPost);
        String responseBody = EntityUtils.toString(response.getEntity());
        
        JsonNode jsonNode = objectMapper.readTree(responseBody);
        return jsonNode.get("access_token").asText();
    }
    
    // 사용자 정보 요청
    private Map<String, Object> getUserInfo(String accessToken) throws Exception {
        HttpGet httpGet = new HttpGet(userInfoUrl);
        httpGet.setHeader("Authorization", "Bearer " + accessToken);
        
        HttpResponse response = httpClient.execute(httpGet);
        String responseBody = EntityUtils.toString(response.getEntity());
        
        JsonNode jsonNode = objectMapper.readTree(responseBody);
        
        // 사용자 정보 추출
        String name = jsonNode.path("kakao_account").path("profile").path("nickname").asText();
        String email = jsonNode.path("kakao_account").path("email").asText();
        String profileImage = jsonNode.path("kakao_account").path("profile").path("profile_image_url").asText();
        
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("name", name);
        userInfo.put("email", email);
        userInfo.put("profileImage", profileImage);
        
        return userInfo;
    }
}