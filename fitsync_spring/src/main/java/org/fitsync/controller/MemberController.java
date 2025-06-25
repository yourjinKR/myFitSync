package org.fitsync.controller;

import java.util.Map;

import javax.servlet.http.HttpSession;

import org.fitsync.service.MemberServiceImple;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.log4j.Log4j;

@Log4j
@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/member")
public class MemberController {
	
	@Autowired
	private MemberServiceImple service;
	
	@PostMapping("/register")
	public String register(@RequestBody Map<String, String> body, HttpSession session) {
		int idx = (int) session.getAttribute("USER_IDX");
		boolean result = service.insertInfo(body, idx);
		return result ? "success" : "fail";
	}
	
	@GetMapping(value = "/logout")
    public ResponseEntity<Map<String, Object>> googleLogOut() {
    	ResponseCookie cookie = ResponseCookie.from("accessToken", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .build();
    	
    	 return ResponseEntity.ok()
    	            .header(HttpHeaders.SET_COOKIE, cookie.toString() + "; SameSite=Lax")
    	            .body(Map.of("message", "로그아웃 되었습니다"));
    }
}
