package org.fitsync.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;

import org.fitsync.domain.PaymentMethodVO;
import org.fitsync.domain.PaymentOrderVO;
import org.fitsync.domain.PaymentOrderWithMethodVO;
import org.fitsync.mapper.PaymentMethodMapper;
import org.fitsync.mapper.PaymentOrderMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;

import io.portone.sdk.server.common.Country.St;
import lombok.extern.log4j.Log4j;

import java.io.IOException;

@Log4j
@Service
public class PaymentServiceImple implements PaymentService {
    @Value("${portone.api.secret}")
    private String apiSecretKey;

    @Value("${portone.billing.key}")
    private String billingKey;
    
    @Value("${portone.channel.key}")
    private String channelKey;
    
    @Value("${portone.kakaopay.channel.key}")
    private String kakaoPayKey;
    
    @Value("${portone.tosspayments.channel.key}")
    private String tosspaymentsKey;

    
    @Value("${portone.store.id}")
    private String storeId;

	@Autowired
	private PaymentMethodMapper paymentMethodMapper;
	
	@Autowired
	private PaymentOrderMapper paymentOrderMapper;
	
	// 결제수단 등록 (카드 정보 포함)
	@Override
	public int saveBillingKey(PaymentMethodVO vo) {
		try {
			// 빌링키로 카드 정보 조회
			Map<String, Object> cardInfo = getCardInfoByBillingKey(vo.getMethod_key());
			
			// methodType 확인
			String methodType = (String) cardInfo.get("methodType");
			
			// 카드 결제인 경우에만 카드 정보 설정
			if ("card".equals(methodType)) {
				String cardName = (String) cardInfo.get("name");
				String cardNumber = (String) cardInfo.get("number");
				
				vo.setMethod_card(cardName != null ? cardName : "알 수 없는 카드");
				vo.setMethod_card_num(cardNumber != null ? cardNumber : "****-****-****-****");
				
				log.info("카드 정보와 함께 결제수단 저장: " + cardName + " (" + cardNumber + ")");
			} else {
				// 간편결제 등 카드가 아닌 경우 null로 설정
				vo.setMethod_card(null);
				vo.setMethod_card_num(null);
				
				log.info("간편결제 수단 저장 - 타입: " + methodType);
			}
			
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
				    .header("Authorization", "PortOne " + apiSecretKey)
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
	 * PortOne API 응답에서 카드 정보를 추출하는 메서드 (빌링키 조회 & 결제 단건 조회 모두 지원)
	 * @param responseData PortOne API 응답 데이터
	 * @return 추출된 카드 정보 (name, number, publisher, issuer 등)
	 */
	@SuppressWarnings("unchecked")
	private Map<String, Object> extractCardInfo(Map<String, Object> responseData) {
		Map<String, Object> cardInfo = new HashMap<>();
		
		try {
			Map<String, Object> card = null;
			String methodType = null;
			
			// 1. 결제 단건 조회 응답 구조 체크 (method 객체)
			Map<String, Object> method = (Map<String, Object>) responseData.get("method");
			if (method != null) {
				methodType = (String) method.get("type");
				if ("PaymentMethodCard".equals(methodType)) {
					card = (Map<String, Object>) method.get("card");
					log.info("결제 단건 조회 응답에서 카드 정보 추출 시도");
				}
			}
			
			// 2. 빌링키 조회 응답 구조 체크 (methods 배열)
			if (card == null) {
				List<Map<String, Object>> methods = (List<Map<String, Object>>) responseData.get("methods");
				if (methods != null && !methods.isEmpty()) {
					Map<String, Object> firstMethod = methods.get(0);
					methodType = (String) firstMethod.get("type");
					if ("BillingKeyPaymentMethodCard".equals(methodType)) {
						card = (Map<String, Object>) firstMethod.get("card");
						log.info("빌링키 조회 응답에서 카드 정보 추출 시도");
					}
				}
			}
			
			// 3. 카드 정보 추출
			if (card != null) {
				cardInfo.put("name", card.get("name"));           // 카드 이름 (예: "기업은행카드")
				cardInfo.put("number", card.get("number"));       // 카드 번호 (마스킹됨)
				cardInfo.put("publisher", card.get("publisher")); // 발행사
				cardInfo.put("issuer", card.get("issuer"));       // 발급사
				cardInfo.put("brand", card.get("brand"));         // 브랜드
				cardInfo.put("type", card.get("type"));           // 카드 타입 (DEBIT/CREDIT)
				cardInfo.put("bin", card.get("bin"));             // BIN 코드
				
				log.info("카드 정보 추출 성공 - 방식: " + methodType + ", 카드명: " + card.get("name"));
			}

			// 간편결제("PaymentMethodEasyPay")일 경우 카드 정보를 담지 않음
			if ("PaymentMethodEasyPay".equals(methodType)) {
				log.info("간편결제 방식으로 카드 정보가 없습니다.");
				cardInfo.put("name", null);
				cardInfo.put("number", null);
				cardInfo.put("publisher", null);
				cardInfo.put("issuer", null);
			}

			// 결제 수단 타입 저장
			switch (methodType) {
				case "PaymentMethodCard":
					cardInfo.put("methodType", "card");
					break;
				case "PaymentMethodEasyPay":
					cardInfo.put("methodType", "easyPay");
					break;
				case "BillingKeyPaymentMethodCard":
					cardInfo.put("methodType", "card");
					break;
				case "BillingKeyPaymentMethodEasyPay":
					cardInfo.put("methodType", "easyPay");
					break;
				default:
					break;
			}
			
			// 4. 카드 정보가 없는 경우 기본값 설정
			if (cardInfo.isEmpty()) {
				cardInfo.put("name", "알 수 없는 카드");
				cardInfo.put("number", "****-****-****-****");
				cardInfo.put("publisher", "UNKNOWN");
				cardInfo.put("issuer", "UNKNOWN");
				log.warn("카드 정보를 찾을 수 없어 기본값 설정");
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

	// 채널키 매칭
	public String getChannelKey(String channelType) {
		switch (channelType.toLowerCase()) {
			case "kakaopay":
				return kakaoPayKey;
			case "tosspayments":
				return tosspaymentsKey;
			default:
				return channelKey; // 기본 채널키
		}
	}
	
	// 빌링키로 결제 (api key, payment id, billing key == method key, channel key, ordername, amount, currency 
	@Override
	@Transactional
	public Object payBillingKey(String paymentId, int methodIdx, int memberIdx) {
	    PaymentOrderVO order = null;
	    
	    try {
	        // 1. 결제수단 정보 조회
			PaymentMethodVO method = paymentMethodMapper.selectByMethodIdx(methodIdx);
			if (method == null) {
			    log.error("결제수단을 찾을 수 없습니다. methodIdx: " + methodIdx);
			    Map<String, Object> errorResult = new HashMap<>();
			    errorResult.put("success", false);
			    errorResult.put("message", "결제수단을 찾을 수 없습니다.");
			    return errorResult;
			}
			
			String billingKey = method.getMethod_key();
			String channelKey = getChannelKey(method.getMethod_provider());
			
			log.info("결제 시작 - PaymentId: " + paymentId + ", BillingKey: " + billingKey + ", ChannelKey: " + channelKey);

			// 2. 결제 주문 정보 사전 저장 (READY 상태)
			order = new PaymentOrderVO();
			order.setMember_idx(memberIdx);
			order.setMethod_idx(methodIdx);
			order.setPayment_id(paymentId);
			order.setOrder_type("DIRECT");
			order.setOrder_status("READY");
			order.setOrder_name("1개월 구독권");
			order.setOrder_price(3000);
			order.setOrder_currency("KRW");
			order.setOrder_regdate(new java.sql.Date(System.currentTimeMillis()));
			
			try {
			    paymentOrderMapper.insertPaymentOrder(order);
			    log.info("결제 주문 정보 저장 완료 - PaymentId: " + paymentId);
			    log.info("생성된 order_idx: " + order.getOrder_idx());
			    
			    if (order.getOrder_idx() <= 0) {
			        log.error("order_idx가 생성되지 않았습니다: " + order.getOrder_idx());
			    }
			    
			} catch (Exception dbEx) {
			    log.error("결제 주문 정보 저장 실패: ", dbEx);
			    Map<String, Object> errorResult = new HashMap<>();
			    errorResult.put("success", false);
			    errorResult.put("message", "결제 주문 정보 저장 실패: " + dbEx.getMessage());
			    return errorResult;
			}

			// 3. PortOne API 호출
	    	HttpRequest request = HttpRequest.newBuilder()
	    		    .uri(URI.create("https://api.portone.io/payments/"+ paymentId +"/billing-key"))
	    		    .header("Content-Type", "application/json")
	    		    .header("Authorization", "PortOne " + apiSecretKey)
	    		    .method("POST", HttpRequest.BodyPublishers.ofString("{\"storeId\":\"" + storeId + "\",\"billingKey\":\"" + billingKey + "\",\"channelKey\":\"" + channelKey + "\",\"orderName\":\"fitsync 구독\",\"amount\":{\"total\":3000},\"currency\":\"KRW\"}"))
	    		    .build();
	    		
	    	HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
	    		
	    	// 응답 로깅
	    	log.info("PortOne API Status Code: " + response.statusCode());
	    	log.info("PortOne API Response Body: " + response.body());
	    		
	    	// 4. 응답 처리 및 주문 상태 업데이트
	    	boolean isSuccess = response.statusCode() >= 200 && response.statusCode() < 300;
	    	String orderStatus = isSuccess ? "PAID" : "FAILED";
	    	
	    	log.info("=== 결제 상태 업데이트 시작 ===");
	    	log.info("결제 결과 - isSuccess: " + isSuccess + ", orderStatus: " + orderStatus);
	    	log.info("업데이트할 주문 정보 - payment_id: " + paymentId + ", order_idx: " + order.getOrder_idx());
	    	
	    	// 주문 상태 업데이트
	    	order.setOrder_status(orderStatus);
	    	if (isSuccess) {
	    	    order.setOrder_paydate(new java.sql.Date(System.currentTimeMillis()));
	    	    log.info("결제 성공 - 결제일시 설정: " + order.getOrder_paydate());
	    	}
	    	
	    	log.info("업데이트 직전 order 객체 전체: " + order);
	    	
	    	try {
				log.info("결제 주문 정보 업데이트 - " + order);
	    	    paymentOrderMapper.updatePaymentStatus(order);
				System.out.println("결제 완료했으니 상태 변경함." + orderStatus);
	    	    log.info("결제 상태 업데이트 완료 - PaymentId: " + paymentId + ", Status: " + orderStatus);
	    	    
	    	    // 업데이트 후 실제 DB 상태 확인
	    	    try {
	    	        PaymentOrderVO updatedOrder = paymentOrderMapper.selectByPaymentId(paymentId);
	    	        if (updatedOrder != null) {
	    	            log.info("업데이트 후 DB 상태: " + updatedOrder);
	    	            if (!"PAID".equals(updatedOrder.getOrder_status()) && isSuccess) {
	    	                log.error("업데이트가 반영되지 않았습니다! 예상: PAID, 실제: " + updatedOrder.getOrder_status());
	    	            }
	    	        } else {
	    	            log.error("업데이트 후 주문을 찾을 수 없습니다!");
	    	        }
	    	    } catch (Exception selectEx) {
	    	        log.error("업데이트 후 조회 실패: ", selectEx);
	    	    }
	    	    
	    	} catch (Exception updateEx) {
	    	    log.error("결제 상태 업데이트 실패: ", updateEx);
				System.out.println("업데이트 중 오류 발생함." + updateEx.getMessage());
	    	    updateEx.printStackTrace();
	    	    // 결제는 성공했지만 상태 업데이트 실패한 경우 별도 처리 필요
	    	}
	    		
	    	// 5. JSON 응답 파싱 및 결과 반환
	    	try {
	    		ObjectMapper objectMapper = new ObjectMapper();
	    		Object responseData = objectMapper.readValue(response.body(), Object.class);
	    			
	    		Map<String, Object> result = new HashMap<>();
	    		result.put("statusCode", response.statusCode());
	    		result.put("success", isSuccess);
	    		result.put("data", responseData);
	    		result.put("message", isSuccess ? "Payment successful" : "Payment failed");
	    		result.put("paymentId", paymentId);
	    		result.put("orderStatus", orderStatus);
	    			
	    		return result;
	    		
	    	} catch (Exception jsonEx) {
	    		log.error("JSON 파싱 실패: ", jsonEx);
	    		Map<String, Object> result = new HashMap<>();
	    		result.put("statusCode", response.statusCode());
	    		result.put("success", false);
	    		result.put("data", response.body());
	    		result.put("message", "Failed to parse response");
	    		result.put("paymentId", paymentId);
	    		return result;
	    	}
	    		
	    } catch (IOException | InterruptedException e) {
	        log.error("PortOne API 호출 실패: ", e);
	        
	        // API 호출 실패 시 주문 상태를 FAILED로 업데이트
	        if (order != null) {
	            try {
	                order.setOrder_status("FAILED");
	                paymentOrderMapper.updatePaymentStatus(order);
	                log.info("API 실패로 인한 주문 상태 업데이트 완료 - PaymentId: " + paymentId);
	            } catch (Exception updateEx) {
	                log.error("API 실패 후 주문 상태 업데이트 실패: ", updateEx);
	            }
	        }
	        
	        Map<String, Object> errorResult = new HashMap<>();
	        errorResult.put("success", false);
	        errorResult.put("message", "Request failed: " + e.getMessage());
	        errorResult.put("error", e.getClass().getSimpleName());
	        errorResult.put("paymentId", paymentId);
	        return errorResult;
	    } catch (Exception e) {
	        log.error("예상치 못한 오류 발생: ", e);
	        
	        // 예상치 못한 오류 시 주문 상태를 FAILED로 업데이트
	        if (order != null) {
	            try {
	                order.setOrder_status("FAILED");
	                paymentOrderMapper.updatePaymentStatus(order);
	            } catch (Exception updateEx) {
	                log.error("예외 발생 후 주문 상태 업데이트 실패: ", updateEx);
	            }
	        }
	        
	        Map<String, Object> errorResult = new HashMap<>();
	        errorResult.put("success", false);
	        errorResult.put("message", "Unexpected error: " + e.getMessage());
	        errorResult.put("error", e.getClass().getSimpleName());
	        errorResult.put("paymentId", paymentId);
	        return errorResult;
	    }
	}

	// 결제 예약
	@Override
	public Object scheduleBillingKey(String paymentId, int methodIdx, int memberIdx) {
		String billingKey = paymentMethodMapper.selectBillingKeyByMethodIdx(methodIdx).getMethod_key();
		String channelKey = getChannelKey(paymentMethodMapper.selectByMethodIdx(methodIdx).getMethod_provider());

		// 테스트용으로 현시각 기준 10초 후 예약
		String timeToPay = java.time.LocalDateTime.now().plusSeconds(10).toString() + "+09:00";

		try {
			// 포트원 API 호출
			HttpRequest request = HttpRequest.newBuilder()
				.uri(URI.create("https://api.portone.io/payments/"+ paymentId +"/schedule"))
				.header("Content-Type", "application/json")
				.header("Authorization", "PortOne " + apiSecretKey)
				.method("POST", HttpRequest.BodyPublishers.ofString("{\"payment\":{\"storeId\":\"" + storeId + "\",\"billingKey\":\"" + billingKey + "\",\"channelKey\":\"" + channelKey + "\",\"orderName\":\"1개월 구독권\",\"amount\":{\"total\":3000},\"currency\":\"KRW\"},\"timeToPay\":\"" + timeToPay + "\"}"))
				.build();
			HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());

			

			System.out.println(response.body());
		} catch (Exception e) {
			// TODO: handle exception
		}
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
				    .header("Authorization", "PortOne " + apiSecretKey)
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
	
	/**
	 * 결제수단 등록 전 중복 체크
	 * @param billingKey 빌링키
	 * @param memberIdx 회원 인덱스
	 * @return 중복 체크 결과와 카드 정보
	 */
	@Override
	public Map<String, Object> checkDuplicatePaymentMethod(String billingKey, int memberIdx) {
		Map<String, Object> result = new HashMap<>();
		
		try {
			// 1. 빌링키로 카드 정보 조회
			Map<String, Object> cardInfo = getCardInfoByBillingKey(billingKey);
			
			if (cardInfo.containsKey("error")) {
				result.put("success", false);
				result.put("message", "카드 정보 조회에 실패했습니다.");
				result.put("error", cardInfo.get("error"));
				return result;
			}
			
			String methodType = (String) cardInfo.get("methodType");
			
			// 2. 카드 결제인 경우에만 중복 확인
			if ("card".equals(methodType)) {
				PaymentMethodVO checkVO = new PaymentMethodVO();
				checkVO.setMember_idx(memberIdx);
				checkVO.setMethod_card((String) cardInfo.get("name"));
				checkVO.setMethod_card_num((String) cardInfo.get("number"));
				
				int duplicateCount = paymentMethodMapper.countDuplicateCard(checkVO);
				
				result.put("success", true);
				result.put("cardInfo", cardInfo);
				result.put("isDuplicate", duplicateCount > 0);
				result.put("duplicateCount", duplicateCount);
				
				if (duplicateCount > 0) {
					PaymentMethodVO duplicateMethod = paymentMethodMapper.findDuplicateCard(checkVO);
					result.put("duplicateMethod", duplicateMethod);
					result.put("message", "동일한 카드가 이미 등록되어 있습니다.");
				} else {
					result.put("message", "새로운 카드입니다.");
				}
			} else {
				// 간편결제 등 카드가 아닌 경우는 중복 체크 안함
				result.put("success", true);
				result.put("cardInfo", cardInfo);
				result.put("isDuplicate", false);
				result.put("duplicateCount", 0);
				result.put("message", "새로운 " + methodType + " 결제수단입니다.");
			}
			
			log.info("중복 체크 결과: " + result);
			return result;
			
		} catch (Exception e) {
			log.error("중복 체크 중 오류 발생: ", e);
			result.put("success", false);
			result.put("message", "중복 체크 중 오류가 발생했습니다: " + e.getMessage());
			result.put("error", e.getClass().getSimpleName());
			return result;
		}
	}
	
	/**
	 * 중복 처리 후 결제수단 저장 (기존 삭제 후 새로 등록)
	 * @param vo 새로운 결제수단 정보
	 * @param replaceExisting 기존 결제수단 교체 여부
	 * @return 처리 결과
	 */
	@Override
	public Map<String, Object> saveBillingKeyWithDuplicateHandling(PaymentMethodVO vo, boolean replaceExisting) {
		Map<String, Object> result = new HashMap<>();
		
		try {
			// 1. 빌링키로 카드 정보 조회
			Map<String, Object> cardInfo = getCardInfoByBillingKey(vo.getMethod_key());
			
			if (cardInfo.containsKey("error")) {
				result.put("success", false);
				result.put("message", "카드 정보 조회에 실패했습니다.");
				return result;
			}
			
			String methodType = (String) cardInfo.get("methodType");
			
			// 2. 결제수단 타입에 따라 카드 정보 설정
			if ("card".equals(methodType)) {
				// 카드 결제인 경우에만 카드 정보 설정
				String cardName = (String) cardInfo.get("name");
				String cardNumber = (String) cardInfo.get("number");
				
				vo.setMethod_card(cardName != null ? cardName : "알 수 없는 카드");
				vo.setMethod_card_num(cardNumber != null ? cardNumber : "****-****-****-****");
				
				// 3. 기존 결제수단 교체인 경우 삭제 먼저 처리 (카드인 경우에만)
				if (replaceExisting) {
					PaymentMethodVO duplicateMethod = paymentMethodMapper.findDuplicateCard(vo);
					if (duplicateMethod != null) {
						PaymentMethodVO deleteVO = new PaymentMethodVO();
						deleteVO.setMember_idx(vo.getMember_idx());
						deleteVO.setMethod_idx(duplicateMethod.getMethod_idx());
						
						int deleteResult = paymentMethodMapper.deletePaymentMethod(deleteVO);
						log.info("기존 중복 결제수단 삭제 결과: " + deleteResult);
					}
				}
			} else {
				// 간편결제 등 카드가 아닌 경우 카드 정보 null로 설정
				vo.setMethod_card(null);
				vo.setMethod_card_num(null);
			}
			
			// 4. 새로운 결제수단 등록
			int insertResult = paymentMethodMapper.insertPaymentMethod(vo);
			
			if (insertResult > 0) {
				result.put("success", true);
				result.put("message", replaceExisting ? "기존 결제수단이 새로운 결제수단으로 교체되었습니다." : "새로운 결제수단이 등록되었습니다.");
				result.put("cardInfo", cardInfo);
				result.put("method_idx", vo.getMethod_idx()); // 새로 등록된 결제수단 ID
			} else {
				result.put("success", false);
				result.put("message", "결제수단 등록에 실패했습니다.");
			}
			
		} catch (Exception e) {
			log.error("결제수단 등록/교체 중 오류 발생: ", e);
			result.put("success", false);
			result.put("message", "결제수단 처리 중 오류가 발생했습니다: " + e.getMessage());
			result.put("error", e.getClass().getSimpleName());
		}
		
		return result;
	}

	/**
	 * 사용자별 결제 기록 조회
	 * @param memberIdx 회원 인덱스
	 * @return 결제 기록 리스트 (최신순)
	 */
	@Override
	public List<PaymentOrderVO> getPaymentHistory(int memberIdx) {
		try {
			log.info("결제 기록 조회 시작 - memberIdx: " + memberIdx);
			
			List<PaymentOrderVO> paymentHistory = paymentOrderMapper.selectPaymentOrdersByMember(memberIdx);
			
			log.info("결제 기록 조회 완료 - memberIdx: " + memberIdx + ", 건수: " + paymentHistory.size());
			return paymentHistory;
			
		} catch (Exception e) {
			log.error("결제 기록 조회 중 오류 발생 - memberIdx: " + memberIdx, e);
			throw new RuntimeException("결제 기록 조회 실패: " + e.getMessage(), e);
		}
	}

	/**
	 * 사용자별 결제 기록 조회 (결제 수단 정보 포함)
	 * @param memberIdx 회원 인덱스
	 * @return 결제 기록 리스트 (최신순, 결제 수단 정보 포함)
	 */
	@Override
	public List<PaymentOrderWithMethodVO> getPaymentHistoryWithMethod(int memberIdx) {
		try {
			System.out.println("=== 결제 기록 조회 (API) 함수 시작 ===");
			log.info("결제 기록 조회 시작 (API) - memberIdx: " + memberIdx);
			
			// DB에서 기본 결제 주문 정보만 조회 (JOIN 없이)
			List<PaymentOrderWithMethodVO> paymentHistory = paymentOrderMapper.selectPaymentOrdersByMemberWithMethod(memberIdx);
			
			System.out.println("DB 조회 완료 - 건수: " + paymentHistory.size());
			log.info("결제 기록 조회 완료 (API) - memberIdx: " + memberIdx + ", 건수: " + paymentHistory.size());
			
			// 각 결제에 대해 PortOne API로 결제 수단 정보 조회
			for (PaymentOrderWithMethodVO order : paymentHistory) {
				System.out.println("처리 중인 결제 ID: " + order.getPayment_id());
				try {
					// PortOne API에서 결제 단건 조회
					System.out.println("PortOne API 호출 중 - PaymentId: " + order.getPayment_id());
					HttpRequest request = HttpRequest.newBuilder()
						.uri(URI.create("https://api.portone.io/payments/" + order.getPayment_id()))
						.header("Content-Type", "application/json")
						.header("Authorization", "PortOne " + apiSecretKey)
						.method("GET", HttpRequest.BodyPublishers.noBody())
						.build();
					
					HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
					System.out.println("API 응답 상태: " + response.statusCode());
					
					if (response.statusCode() >= 200 && response.statusCode() < 300) {
						// JSON 응답 파싱
						ObjectMapper objectMapper = new ObjectMapper();
						@SuppressWarnings("unchecked")
						Map<String, Object> responseData = objectMapper.readValue(response.body(), Map.class);
						
						System.out.println("API 응답 파싱 완료");
						
						// 카드 정보 추출 (개선된 extractCardInfo 함수 사용)
						Map<String, Object> cardInfo = extractCardInfo(responseData);
						
						// PaymentOrderWithMethodVO에 API 정보 설정
						String methodType = (String) cardInfo.get("methodType");
						order.setApiMethodType(methodType);
						
						// 카드 결제인 경우에만 카드 정보 설정
						if ("card".equals(methodType)) {
							order.setApiCardName((String) cardInfo.get("name"));
							order.setApiCardNumber((String) cardInfo.get("number"));
							order.setApiCardPublisher((String) cardInfo.get("publisher"));
							order.setApiCardIssuer((String) cardInfo.get("issuer"));
							order.setApiCardBrand((String) cardInfo.get("brand"));
							order.setApiCardType((String) cardInfo.get("type"));
						} else {
							// 간편결제 등 카드가 아닌 경우 카드 정보 null로 설정
							order.setApiCardName(null);
							order.setApiCardNumber(null);
							order.setApiCardPublisher(null);
							order.setApiCardIssuer(null);
							order.setApiCardBrand(null);
							order.setApiCardType(null);
						}

						// channel 정보에서 결제 채널 확인
						@SuppressWarnings("unchecked")
						Map<String, Object> channel = (Map<String, Object>) responseData.get("channel");
						if (channel != null) {
							String pgProvider = (String) channel.get("pgProvider");
							order.setApiMethodProvider(pgProvider != null ? pgProvider : "UNKNOWN");
						} else {
							order.setApiMethodProvider("UNKNOWN");
						}
						
						System.out.println("결제 정보 업데이트 완료 - PaymentId: " + order.getPayment_id() + 
								", 카드: " + order.getApiCardName() + " " + order.getApiCardNumber());
						
					} else {
						System.out.println("API 호출 실패 - Status: " + response.statusCode());
						log.warn("PortOne API 호출 실패 - PaymentId: " + order.getPayment_id() + 
								", Status: " + response.statusCode());
						// API 호출 실패 시 기본값 설정
						setDefaultApiMethodInfo(order);
					}
					
				} catch (Exception apiEx) {
					System.out.println("API 호출 중 예외: " + apiEx.getMessage());
					apiEx.printStackTrace();
					log.error("PortOne API 호출 중 오류 발생 - PaymentId: " + order.getPayment_id(), apiEx);
					// API 호출 실패 시 기본값 설정
					setDefaultApiMethodInfo(order);
				}
			}
			
			System.out.println("=== 결제 기록 조회 (API) 함수 완료 ===");
			log.info("결제 기록 조회 및 API 정보 업데이트 완료 - memberIdx: " + memberIdx);
			return paymentHistory;
			
		} catch (Exception e) {
			System.out.println("전체 프로세스 중 예외 발생: " + e.getMessage());
			e.printStackTrace();
			log.error("결제 기록 조회 실패 (API) - memberIdx: " + memberIdx, e);
			throw new RuntimeException("결제 기록 조회 중 오류가 발생했습니다.", e);
		}
	}
	
	/**
	 * API 정보 조회 실패 시 기본값 설정
	 * @param order 결제 주문 VO
	 */
	private void setDefaultApiMethodInfo(PaymentOrderWithMethodVO order) {
		order.setApiMethodProvider("UNKNOWN");
		order.setApiMethodType("unknown");
		order.setApiCardName("정보 조회 실패");
		order.setApiCardNumber("****-****-****-****");
		order.setApiCardPublisher("UNKNOWN");
		order.setApiCardIssuer("UNKNOWN");
		order.setApiCardBrand("UNKNOWN");
		order.setApiCardType("UNKNOWN");
	}


	
}
