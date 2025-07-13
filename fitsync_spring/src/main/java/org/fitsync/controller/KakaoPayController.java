package org.fitsync.controller;

import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.java.Log;
import lombok.extern.log4j.Log4j;

import org.fitsync.service.KakaoPayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Log4j
@RestController
@RequestMapping("/kakaoPay")
@CrossOrigin(origins = "*")
public class KakaoPayController {

    @Setter(onMethod_ = @Autowired)
    private KakaoPayService kakaoPay;

    @GetMapping("/kakaoPay")
    public String kakaoPayGet() {
    	return "kakaopay test";
    }

    @PostMapping("/ready")
    public String kakaoPay(){
        log.info("kakaoPay post.....................");

        return "redirect:" + kakaoPay.kakaoPayReadyTest();
    }

    @GetMapping("/success")
    public void kakaoPaySuccess(@RequestParam("pg_token")String pg_token, Model model) {
        log.info("kakaoPay Success get................");
        log.info("kakaoPaySuccess pg_token : " + pg_token);
    }
    
    
    @PostMapping(value = "/portone/complete", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
    public ResponseEntity<?> portOneTest(@RequestBody String paymentId) {
    	log.info(paymentId);
    	return ResponseEntity.ok("결제가 완료됐습니다!!!");
    }
    
    @PostMapping(value = "/portone/billing", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
    public ResponseEntity<?> billing(@RequestBody String billingKey) {
    	log.info(billingKey);
    	return ResponseEntity.ok("빌링키 확인");
    }
    
}
