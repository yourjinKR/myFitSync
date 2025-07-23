package org.fitsync.service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.fitsync.config.PortOneConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PortOneApiClient {
    
    private static final Logger log = LoggerFactory.getLogger(PortOneApiClient.class);
    private static final String PORTONE_BASE_URL = "https://api.portone.io";
    
    private final PortOneConfig portOneConfig;
    
    @Autowired
    public PortOneApiClient(PortOneConfig portOneConfig) {
        this.portOneConfig = portOneConfig;
    }
    
    /**
     * 빌링키 정보 조회
     * @param billingKey 빌링키
     * @return API 응답
     * @throws IOException
     * @throws InterruptedException
     */
    public HttpResponse<String> getBillingKeyInfo(String billingKey) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(PORTONE_BASE_URL + "/billing-keys/" + billingKey))
                .header("Content-Type", "application/json")
                .header("Authorization", "PortOne " + portOneConfig.getApiSecretKey())
                .method("GET", HttpRequest.BodyPublishers.noBody())
                .build();
        
        HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
        
        log.info("PortOne getBillingKeyInfo API Response Status: " + response.statusCode());
        log.info("PortOne getBillingKeyInfo API Response Body: " + response.body());
        
        return response;
    }
    
    /**
     * 빌링키로 결제 실행
     * @param paymentId 결제 ID
     * @param billingKey 빌링키
     * @param channelKey 채널키
     * @param orderName 주문명
     * @param amount 결제 금액
     * @return API 응답
     * @throws IOException
     * @throws InterruptedException
     */
    public HttpResponse<String> payWithBillingKey(String paymentId, String billingKey, String channelKey, 
                                                 String orderName, int amount) throws IOException, InterruptedException {
        String requestBody = String.format(
            "{\"storeId\":\"%s\",\"billingKey\":\"%s\",\"channelKey\":\"%s\",\"orderName\":\"%s\",\"amount\":{\"total\":%d},\"currency\":\"KRW\"}",
            portOneConfig.getStoreId(), billingKey, channelKey, orderName, amount
        );
        
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(PORTONE_BASE_URL + "/payments/" + paymentId + "/billing-key"))
                .header("Content-Type", "application/json")
                .header("Authorization", "PortOne " + portOneConfig.getApiSecretKey())
                .method("POST", HttpRequest.BodyPublishers.ofString(requestBody))
                .build();
        
        HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
        
        log.info("PortOne payWithBillingKey API Status Code: " + response.statusCode());
        log.info("PortOne payWithBillingKey API Response Body: " + response.body());
        
        return response;
    }
    
    /**
     * 결제 정보 조회
     * @param paymentId 결제 ID
     * @return API 응답
     * @throws IOException
     * @throws InterruptedException
     */
    public HttpResponse<String> getPaymentInfo(String paymentId) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(PORTONE_BASE_URL + "/payments/" + paymentId))
                .header("Content-Type", "application/json")
                .header("Authorization", "PortOne " + portOneConfig.getApiSecretKey())
                .method("GET", HttpRequest.BodyPublishers.noBody())
                .build();
        
        HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
        
        log.info("PortOne getPaymentInfo API Response Status: " + response.statusCode());
        log.info("PortOne getPaymentInfo API Response Body: " + response.body());
        
        return response;
    }
    
    /**
     * 빌링키 저장
     * @param billingKey 빌링키
     * @param channelKey 채널키
     * @return API 응답
     * @throws IOException
     * @throws InterruptedException
     */
    public HttpResponse<String> saveBillingKey(String billingKey, String channelKey) throws IOException, InterruptedException {
        String requestBody = String.format(
            "{\"storeId\":\"%s\",\"channelKey\":\"%s\",\"billingKey\":\"%s\"}",
            portOneConfig.getStoreId(), channelKey, billingKey
        );
        
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(PORTONE_BASE_URL + "/billing-keys"))
                .header("Content-Type", "application/json")
                .header("Authorization", "PortOne " + portOneConfig.getApiSecretKey())
                .method("POST", HttpRequest.BodyPublishers.ofString(requestBody))
                .build();
        
        HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
        
        log.info("PortOne saveBillingKey API Response Status: " + response.statusCode());
        log.info("PortOne saveBillingKey API Response Body: " + response.body());
        
        return response;
    }
    
    /**
     * 성공 응답 여부 확인
     * @param response HTTP 응답
     * @return 성공 여부
     */
    public boolean isSuccessResponse(HttpResponse<String> response) {
        return response.statusCode() >= 200 && response.statusCode() < 300;
    }
    
    /**
     * 결제 스케줄 생성
     * @param paymentId 결제 ID
     * @param billingKey 빌링키
     * @param channelKey 채널키
     * @param orderName 주문명
     * @param amount 결제 금액
     * @param scheduleDateTime 예약 시간 (ISO 8601 형식)
     * @return API 응답
     * @throws IOException
     * @throws InterruptedException
     */
    public HttpResponse<String> createPaymentSchedule(String paymentId, String billingKey, String channelKey, 
                                                     String orderName, int amount, String scheduleDateTime) throws IOException, InterruptedException {
        String requestBody = String.format(
            "{\"payment\":{\"storeId\":\"%s\",\"billingKey\":\"%s\",\"channelKey\":\"%s\",\"orderName\":\"%s\",\"amount\":{\"total\":%d},\"currency\":\"KRW\"},\"timeToPay\":\"%s\"}",
            portOneConfig.getStoreId(), billingKey, channelKey, orderName, amount, scheduleDateTime
        );
        
        log.info("PortOne 결제 스케줄 생성 요청 Body: " + requestBody);
        
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(PORTONE_BASE_URL + "/payments/" + paymentId + "/schedule"))
                .header("Content-Type", "application/json")
                .header("Authorization", "PortOne " + portOneConfig.getApiSecretKey())
                .method("POST", HttpRequest.BodyPublishers.ofString(requestBody))
                .build();
        
        HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
        
        log.info("PortOne createPaymentSchedule API Status Code: " + response.statusCode());
        log.info("PortOne createPaymentSchedule API Response Body: " + response.body());
        
        return response;
    }
    
    /**
     * 결제 스케줄 취소
     * @param scheduleId 스케줄 ID
     * @return API 응답
     * @throws IOException
     * @throws InterruptedException
     */
    public HttpResponse<String> cancelPaymentSchedule(String scheduleId) throws IOException, InterruptedException {
        String requestBody = String.format("{\"scheduleIds\":[\"%s\"]}", scheduleId);
        
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(PORTONE_BASE_URL + "/payment-schedules"))
                .header("Content-Type", "application/json")
                .header("Authorization", "PortOne " + portOneConfig.getApiSecretKey())
                .method("DELETE", HttpRequest.BodyPublishers.ofString(requestBody))
                .build();
        
        HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
        
        log.info("PortOne cancelPaymentSchedule API Status Code: " + response.statusCode());
        log.info("PortOne cancelPaymentSchedule API Response Body: " + response.body());
        
        return response;
    }
    
    /**
     * 빌링키로 스케줄 취소
     * @param billingKey 빌링키
     * @return API 응답
     * @throws IOException
     * @throws InterruptedException
     */
    public HttpResponse<String> cancelScheduleByBillingKey(String billingKey) throws IOException, InterruptedException {
        String requestBody = String.format("{\"billingKey\":\"%s\"}", billingKey);
        
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(PORTONE_BASE_URL + "/payment-schedules"))
                .header("Content-Type", "application/json")
                .header("Authorization", "PortOne " + portOneConfig.getApiSecretKey())
                .method("DELETE", HttpRequest.BodyPublishers.ofString(requestBody))
                .build();
        
        HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
        
        log.info("PortOne cancelScheduleByBillingKey API Status Code: " + response.statusCode());
        log.info("PortOne cancelScheduleByBillingKey API Response Body: " + response.body());
        
        return response;
    }
    
    /**
     * 결제 스케줄 조회
     * @param scheduleId 스케줄 ID
     * @return API 응답
     * @throws IOException
     * @throws InterruptedException
     */
    public HttpResponse<String> getPaymentSchedule(String scheduleId) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(PORTONE_BASE_URL + "/payment-schedules/" + scheduleId + "?storeId=" + portOneConfig.getStoreId()))
                .header("Content-Type", "application/json")
                .header("Authorization", "PortOne " + portOneConfig.getApiSecretKey())
                .method("GET", HttpRequest.BodyPublishers.noBody())
                .build();
        
        HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
        
        log.info("PortOne getPaymentSchedule API Status Code: " + response.statusCode());
        log.info("PortOne getPaymentSchedule API Response Body: " + response.body());
        
        return response;
    }
    
    /**
     * 빌링키 삭제
     * @param billingKey 빌링키
     * @return API 응답
     * @throws IOException
     * @throws InterruptedException
     */
    public HttpResponse<String> deleteBillingKey(String billingKey) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(PORTONE_BASE_URL + "/billing-keys/" + billingKey + "?storeId=" + portOneConfig.getStoreId()))
                .header("Content-Type", "application/json")
                .header("Authorization", "PortOne " + portOneConfig.getApiSecretKey())
                .method("DELETE", HttpRequest.BodyPublishers.ofString("{}"))
                .build();
        
        HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
        
        log.info("PortOne deleteBillingKey API Status Code: " + response.statusCode());
        log.info("PortOne deleteBillingKey API Response Body: " + response.body());
        
        return response;
    }
    
    /**
     * 채널키 선택 (결제 수단에 따라)
     * @param paymentMethod 결제 수단
     * @return 채널키
     */
    public String getChannelKey(String paymentMethod) {
        if (paymentMethod == null) {
            return portOneConfig.getChannelKey();
        }
        
        switch (paymentMethod.toLowerCase()) {
            case "kakaopay":
                return portOneConfig.getKakaopayChannelKey();
            case "tosspayments":
                return portOneConfig.getTosspaymentsChannelKey();
            default:
                return portOneConfig.getChannelKey();
        }
    }
}
