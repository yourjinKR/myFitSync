package org.fitsync.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.fitsync.domain.PtVO;
import org.fitsync.domain.RoutineListVO;
import org.fitsync.service.PtServiceImple;
import org.fitsync.service.RoutineServiceImple;
import org.fitsync.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/routine")
public class RoutineController {

	@Autowired
	private RoutineServiceImple service;
	@Autowired
	private PtServiceImple ptservice;
	@Autowired
	private JwtUtil jwtUtil;
	
	@GetMapping("/workout")
	public ResponseEntity<?> getWorkOut() {
		List<PtVO> list = ptservice.getWorkOut();
		Map<String, Object> result = new HashMap<>();
		if(list != null) {
			result.put("success",true);
			result.put("list", list);
			return ResponseEntity.ok(result);
		}else {
			result.put("success",false);
			return ResponseEntity.ok(result);
		}
	}
	
	@GetMapping("/getList")
	public ResponseEntity<?> getRoutineList(HttpSession session){
		Map<String, Object> result = new HashMap<>();
		List<RoutineListVO> list = null;
		System.out.println(session.getAttribute("member_idx"));
		list = service.getRoutineList((int) session.getAttribute("member_idx"));
		if(list != null) {
			result.put("success", true);
			result.put("vo", list);
		}else {
			result.put("success", false);
		}
		return ResponseEntity.ok(result); 
		
	}
	
	// 루틴 등록
	@PostMapping("/add")
	public ResponseEntity<?> insertRoutine(
			@RequestBody Map<String, Object> body,
			HttpSession session) {

		Map<String, Object> result = new HashMap<>();
		Object sessionIdx = session.getAttribute("member_idx");
		if (sessionIdx == null) {
			result.put("success", false);
			result.put("msg", "인증 정보가 없습니다.");
			return ResponseEntity.status(401).body(result);
		}

		int memberIdx = Integer.parseInt(sessionIdx.toString());
		
		service.insertRoutine(body, (int) sessionIdx);
		result.put("success", true);
		result.put("msg", "루틴이 등록되었습니다.");
		return ResponseEntity.ok(result);
	}
	
}
