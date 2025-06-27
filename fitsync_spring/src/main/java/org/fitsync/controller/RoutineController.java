package org.fitsync.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.fitsync.domain.PtVO;
import org.fitsync.service.PtServiceImple;
import org.fitsync.service.RoutineServiceImple;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/routine")
@CrossOrigin(origins = "*", allowCredentials = "true")  // allowCredentials 꼭 추가
public class RoutineController {

	@Autowired
	private RoutineServiceImple service;
	@Autowired
	private PtServiceImple ptservice;
	
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
	
}
