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

import lombok.extern.log4j.Log4j;

import java.io.IOException;

@Log4j
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
	
	// 결제수단 등록 (카드 정보 포함)
	@Override
	public int saveBillingKey(PaymentMethodVO vo) {
		try {
			// 빌링키로 카드 정보 조회
			Map<String, Object> cardInfo = getCardInfoByBillingKey(vo.getMethod_key());
			
			// 카드 정보를 VO에 설정
			String cardName = (String) cardInfo.get("name");
			String cardNumber = (String) cardInfo.get("number");
			
			vo.setMethod_card(cardName != null ? cardName : "알 수 없는 카드");
			vo.setMethod_card_num(cardNumber != null ? cardNumber : "****-****-****-****");
			
			log.info("카드 정보와 함께 결제수단 저장: " + cardName + " (" + cardNumber + ")");
			
			return paymentMethodMapper.insertPaymentMethod(vo);
			
		} catch (Exception e) {
			log.error("결제수단 저장 중 오류 발생: ", e);
			// 카드 정보 조회 실패 시에도 기본값으로 저장 시도
			vo.setMethod_card("정보 조회 실패");
			vo.setMethod_card_num("****-****-****-****");
			return paymentMethodMapper.insertPaymentMethod(vo);
		}
	}
	
	// 결제수단 불러오기 (빌링키 제외)
	@Override
	public List<PaymentMethodVO> getPaymentMethods(int memberIdx) {
		return paymentMethodMapper.selectByMemberIdxExcludingKey(memberIdx);
	}
	
	// 빌링키 정보 가져오기
	@Override
	public Object getBillingKeyInfo(int methodIdx) {
		try {
			String billingKey = paymentMethodMapper.selectBillingKeyByMethodIdx(methodIdx).getMethod_key();
			
			HttpRequest request = HttpRequest.newBuilder()
				    .uri(URI.create("https://api.portone.io/billing-keys/" + billingKey))
				    .header("Content-Type", "application/json")
				    .header("Authorization", "PortOne " + apiSecret)
				    .method("GET", HttpRequest.BodyPublishers.noBody())
				    .build();
				    
			HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
			
			log.info("PortOne API Response Status: " + response.statusCode());
			log.info("PortOne API Response Body: " + response.body());
			
			if (response.statusCode() >= 200 && response.statusCode() < 300) {
				// JSON 응답을 Map으로 파싱
				ObjectMapper objectMapper = new ObjectMapper();
				@SuppressWarnings("unchecked")
				Map<String, Object> responseData = objectMapper.readValue(response.body(), Map.class);
				
				// 카드 정보 추출
				Map<String, Object> cardInfo = extractCardInfo(responseData);
				
				// 성공 응답 반환
				Map<String, Object> result = new HashMap<>();
				result.put("statusCode", response.statusCode());
				result.put("success", true);
				result.put("data", responseData);
				result.put("cardInfo", cardInfo);  // 추출된 카드 정보 추가
				result.put("message", "빌링키 정보 조회 성공");
				
				return result;
			} else {
				// 실패 응답
				Map<String, Object> result = new HashMap<>();
				result.put("statusCode", response.statusCode());
				result.put("success", false);
				result.put("data", response.body());
				result.put("message", "빌링키 정보 조회 실패");
				return result;
			}
			
		} catch (Exception e) {
			log.error("빌링키 정보 조회 중 오류 발생: ", e);
			Map<String, Object> errorResult = new HashMap<>();
			errorResult.put("success", false);
			errorResult.put("message", "빌링키 정보 조회 실패: " + e.getMessage());
			errorResult.put("error", e.getClass().getSimpleName());
			return errorResult;
		}
	}
	
	/**
	 * PortOne 빌링키 응답에서 카드 정보를 추출하는 메서드
	 * @param responseData PortOne API 응답 데이터
	 * @return 추출된 카드 정보 (name, number, publisher, issuer 등)
	 */
	@SuppressWarnings("unchecked")
	private Map<String, Object> extractCardInfo(Map<String, Object> responseData) {
		Map<String, Object> cardInfo = new HashMap<>();
		
		try {
			// methods 배열에서 첫 번째 요소의 카드 정보 추출
			List<Map<String, Object>> methods = (List<Map<String, Object>>) responseData.get("methods");
			if (methods != null && !methods.isEmpty()) {
				Map<String, Object> method = methods.get(0);
				if ("BillingKeyPaymentMethodCard".equals(method.get("type"))) {
					Map<String, Object> card = (Map<String, Object>) method.get("card");
					if (card != null) {
						cardInfo.put("name", card.get("name"));           // 카드 이름 (예: "기업은행카드")
						cardInfo.put("number", card.get("number"));       // 카드 번호 (마스킹됨)
						cardInfo.put("publisher", card.get("publisher")); // 발행사
						cardInfo.put("issuer", card.get("issuer"));       // 발급사
						cardInfo.put("brand", card.get("brand"));         // 브랜드
						cardInfo.put("type", card.get("type"));           // 카드 타입 (DEBIT/CREDIT)
						cardInfo.put("bin", card.get("bin"));             // BIN 코드
					}
				}
			}
			
			// 카드 정보가 없는 경우 기본값 설정
			if (cardInfo.isEmpty()) {
				cardInfo.put("name", "알 수 없는 카드");
				cardInfo.put("number", "****-****-****-****");
				cardInfo.put("publisher", "UNKNOWN");
				cardInfo.put("issuer", "UNKNOWN");
			}
			
		} catch (Exception e) {
			log.error("카드 정보 추출 중 오류 발생: ", e);
			cardInfo.put("name", "정보 추출 실패");
			cardInfo.put("number", "****-****-****-****");
			cardInfo.put("error", e.getMessage());
		}
		
		log.info("추출된 카드 정보: " + cardInfo);
		return cardInfo;
	}
	
	// 빌링키로 결제 (api key, payment id, billing key, channel key, ordername, amount, currency 
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

	/**
	 * 빌링키로 카드 정보만 조회 (결제수단 등록 시 사용)
	 * @param billingKey 빌링키
	 * @return 카드 정보 (name, number)
	 */
	public Map<String, Object> getCardInfoByBillingKey(String billingKey) {
		try {
			HttpRequest request = HttpRequest.newBuilder()
				    .uri(URI.create("https://api.portone.io/billing-keys/" + billingKey))
				    .header("Content-Type", "application/json")
				    .header("Authorization", "PortOne " + apiSecret)
				    .method("GET", HttpRequest.BodyPublishers.noBody())
				    .build();
				    
			HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
			
			log.info("카드 정보 조회 - Status: " + response.statusCode());
			
			if (response.statusCode() >= 200 && response.statusCode() < 300) {
				ObjectMapper objectMapper = new ObjectMapper();
				@SuppressWarnings("unchecked")
				Map<String, Object> responseData = objectMapper.readValue(response.body(), Map.class);
				
				return extractCardInfo(responseData);
			} else {
				log.error("카드 정보 조회 실패 - Status: " + response.statusCode() + ", Body: " + response.body());
				Map<String, Object> errorInfo = new HashMap<>();
				errorInfo.put("name", "조회 실패");
				errorInfo.put("number", "****-****-****-****");
				errorInfo.put("error", "API 호출 실패");
				return errorInfo;
			}
			
		} catch (Exception e) {
			log.error("카드 정보 조회 중 오류 발생: ", e);
			Map<String, Object> errorInfo = new HashMap<>();
			errorInfo.put("name", "조회 실패");
			errorInfo.put("number", "****-****-****-****");
			errorInfo.put("error", e.getMessage());
			return errorInfo;
		}
	}
}
