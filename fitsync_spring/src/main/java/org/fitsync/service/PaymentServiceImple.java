package org.fitsync.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;

import org.fitsync.domain.PaymentMethodVO;
import org.fitsync.mapper.PaymentMethodMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;

@Service
public class PaymentServiceImple implements PaymentService {
    @Value("${portone.api.secret}")
    private String apiSecret;

    @Value("${portone.billing.key}")
    private String billingKey;
    
    @Value("${portone.channel.key}")
    private String channelKey;
    
    @Value("${portone.store.id}")
    private String storeId;

	@Autowired
	private PaymentMethodMapper paymentMethodMapper;
	
	@Override
	public int saveBillingKey(PaymentMethodVO vo) {
		return paymentMethodMapper.insertPaymentMethod(vo);
	}
	
	@Override
	public List<PaymentMethodVO> getPaymentMethods(int memberIdx) {
		return paymentMethodMapper.selectByMemberIdxExcludingKey(memberIdx);
	}
	
	// api key, payment id, billing key, channel key, ordername, amount, currency 
	@Override
	public Object payBillingKey(String payment) {
	    try {
	    	HttpRequest request = HttpRequest.newBuilder()
	    		    .uri(URI.create("https://api.portone.io/payments/"+ payment +"/billing-key"))
	    		    .header("Content-Type", "application/json")
	    		    .header("Authorization", "PortOne " + apiSecret)
	    		    .method("POST", HttpRequest.BodyPublishers.ofString("{\"storeId\":\"" + storeId + "\",\"billingKey\":\"" + billingKey + "\",\"channelKey\":\"" + channelKey + "\",\"orderName\":\"fitsync123\",\"amount\":{\"total\":3000},\"currency\":\"KRW\"}"))
	    		    .build();
	    		HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
	    		
	    		// 응답 로깅
	    		System.out.println("Status Code: " + response.statusCode());
	    		System.out.println("Response Body: " + response.body());
	    		
	    		// JSON 응답을 Map으로 파싱하여 반환
	    		try {
	    			ObjectMapper objectMapper = new ObjectMapper();
	    			Object responseData = objectMapper.readValue(response.body(), Object.class);
	    			
	    			// 성공/실패 상태와 함께 응답 데이터 반환
	    			Map<String, Object> result = new HashMap<>();
	    			result.put("statusCode", response.statusCode());
	    			result.put("success", response.statusCode() >= 200 && response.statusCode() < 300);
	    			result.put("data", responseData);
	    			result.put("message", response.statusCode() >= 200 && response.statusCode() < 300 ? "Payment successful" : "Payment failed");
	    			
	    			return result;
	    		} catch (Exception jsonEx) {
	    			// JSON 파싱 실패 시 원본 응답 반환
	    			Map<String, Object> result = new HashMap<>();
	    			result.put("statusCode", response.statusCode());
	    			result.put("success", false);
	    			result.put("data", response.body());
	    			result.put("message", "Failed to parse response");
	    			return result;
	    		}
	    		
	    } catch (IOException | InterruptedException e) {
	        e.printStackTrace();
	        // 예외 발생 시 에러 정보 반환
	        Map<String, Object> errorResult = new HashMap<>();
	        errorResult.put("success", false);
	        errorResult.put("message", "Request failed: " + e.getMessage());
	        errorResult.put("error", e.getClass().getSimpleName());
	        return errorResult;
	    }
	}

	
	@Override
	public Object scheduleBillingKey() {
		// TODO Auto-generated method stub
		return null;
	}
	
	@Override
	public boolean renameBillingKey(int memberIdx, int methodIdx, String methodName) {
		try {
			// VO 객체 생성하여 파라미터 전달
			PaymentMethodVO vo = new PaymentMethodVO();
			vo.setMember_idx(memberIdx);
			vo.setMethod_idx(methodIdx);
			vo.setMethod_name(methodName);
			
			int updatedRows = paymentMethodMapper.updatePaymentMethodNameSecure(vo);
			return updatedRows > 0;
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
	}
	
	@Override
	public boolean deletePaymentMethod(int memberIdx, int methodIdx) {
		try {
			// VO 객체 생성하여 파라미터 전달
			PaymentMethodVO vo = new PaymentMethodVO();
			vo.setMember_idx(memberIdx);
			vo.setMethod_idx(methodIdx);
			
			int deletedRows = paymentMethodMapper.deletePaymentMethod(vo);
			return deletedRows > 0;
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
	}
}
