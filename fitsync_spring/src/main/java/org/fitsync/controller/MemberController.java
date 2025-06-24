package org.fitsync.controller;

import java.util.Map;

import javax.servlet.http.HttpSession;

import org.fitsync.service.MemberServiceImple;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.log4j.Log4j;

@Log4j
@RestController
@CrossOrigin(origins = "*")
public class MemberController {
	
	@Autowired
	private MemberServiceImple service;
	
	@PostMapping("/register/member")
	public String register(@RequestBody Map<String, String> body, HttpSession session) {
		int idx = (int) session.getAttribute("USER_IDX");
		boolean result = service.insertInfo(body, idx);
		return result ? "success" : "fail";
	}
}
