package org.fitsync.service;

import org.fitsync.domain.KakaoPayDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class KakaoPayService {

    @Autowired
    private RestTemplate restTemplate; //RestTemplate객체를 자동으로 주입 , REST API 호출을 수행하기 위한 객체를 사용

	// static : 이 필드는 클래스 레벨에서 존재하며 , 클래스의 모든 인스턴스에 공유 -> 모든 인스턴스 공유 메모리 절약
	// final : 상수 한번 할당 , 이후 변경 X -> 명확 코드 가독성
    private static final String KAKAO_PAY_READY_URL = "https://open-api.kakaopay.com/online/v1/payment/ready"; // 결제 준비 요청을 보내는 URL 상수로

    @Value("${kakao.api.secret.key}") // application.properties에 키에 해당하는 값 주입
    private String SECRET_KEY; // 테스트 SECRET_KEY 실제 API는 DOMAIN필요 발급

    public Map<String, Object> kakaoPayReady() {
        HttpHeaders headers = new HttpHeaders(); // HTTP 요청 헤더를 설정하기 위해 객체 생성
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "SECRET_KEY " + SECRET_KEY); // Authorization 헤더 설정

        // 요청 본문 작성 (예제 데이터)
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("cid", "TC0ONETIME"); // 가맹점 코드 (테스트용)
        requestBody.put("partner_order_id", "order_id_1234");
        requestBody.put("partner_user_id", "user_id_1234");
        requestBody.put("item_name", "Test Item");
        requestBody.put("quantity", 1);
        requestBody.put("total_amount", 1000);
        requestBody.put("vat_amount", 0);
        requestBody.put("tax_free_amount", 0);
        requestBody.put("approval_url", "http://localhost:3000/payment/kakao");
        requestBody.put("cancel_url", "http://localhost:3000/payment/kakao");
        requestBody.put("fail_url", "http://localhost:3000/payment/kakao");

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers); // 요청 본문과 헤더를 포함하는 HttpEntity 객체를 생성 

        try {
            ResponseEntity<Map> response = restTemplate.exchange( // restTemplate
                    KAKAO_PAY_READY_URL, // 카카오 API HTTP 요청을 보내는 것
                    HttpMethod.POST, // POST 메서드를 사용해서 
                    requestEntity,
                    Map.class // 응답본문을 MAP으로 하라는 것
            );
            if (response.getStatusCode() == HttpStatus.OK) { // 응답 상태코드가 OK면 본문을 반환 시키고 그 외는 예외처리
                return response.getBody();
            } else {
                throw new RuntimeException("Failed to call KakaoPay API: HTTP status " + response.getStatusCode());
            }
        } catch (HttpClientErrorException e) {
            // 에러 처리
            throw new RuntimeException("Failed to call KakaoPay API: " + e.getMessage(), e);
        }
    }
}
