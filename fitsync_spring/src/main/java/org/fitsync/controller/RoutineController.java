package org.fitsync.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.fitsync.domain.PtVO;
import org.fitsync.domain.RoutineListVO;
import org.fitsync.domain.RoutineMemberDTO;
import org.fitsync.service.PtServiceImple;
import org.fitsync.service.RecordServiceImple;
import org.fitsync.service.RoutineServiceImple;
import org.fitsync.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
	private RecordServiceImple rcservice;
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
	// 루틴 리스트
	@GetMapping("/getList")
	public ResponseEntity<?> getRoutineList(HttpSession session){
		Map<String, Object> result = new HashMap<>();
		List<RoutineListVO> list = null;
		list = service.getRoutineList((int) session.getAttribute("member_idx"));
		if(list != null && list.size() > 0) {
			result.put("success", true);
			result.put("vo", list);
		}else {
			result.put("success", false);
		}
		return ResponseEntity.ok(result); 
		
	}
	
	// 루틴 운동 VIEW
	@GetMapping("/{routine_list_idx}")
	public ResponseEntity<?> getRoutineDetail(@PathVariable int routine_list_idx, HttpSession session){
		Map<String, Object> result = new HashMap<>();
		Object sessionIdx = session.getAttribute("member_idx");
		System.out.println("sessionIdx : " + sessionIdx);
		RoutineMemberDTO rmdto = new RoutineMemberDTO();
		rmdto.setRoutine_list_idx(routine_list_idx);
		rmdto.setMember_idx((int) sessionIdx);
		
		RoutineListVO rvo = null;
		rvo = service.getRoutine(rmdto);
		if(rvo != null) {
			result.put("success", true);
			result.put("vo", rvo);
			result.put("msg", "루틴 호출에 성공하였습니다.");
		}else {
			result.put("success", false);
			result.put("msg", "루틴 호출에 실패하였습니다.");
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
	
	// 루틴 삭제
	@DeleteMapping("/delete/{routine_list_idx}")
	public ResponseEntity<?> deleteRoutine(@PathVariable int routine_list_idx, HttpSession session) {
		Object sessionIdx = session.getAttribute("member_idx");
		RoutineMemberDTO rmdto = new RoutineMemberDTO();
		rmdto.setRoutine_list_idx(routine_list_idx);
		rmdto.setMember_idx((int) sessionIdx);
		
		Map<String, Object> result = new HashMap<>();
		if(service.deleteRoutine(rmdto)) {
			result.put("success", true);
			result.put("msg", "루틴이 삭제되었습니다.");
		}else {
			result.put("success", false);
			result.put("msg", "루틴 삭제에 실패하였습니다.");
		}
		return ResponseEntity.ok(result);
	}
	
	// 루틴 기록
	@PostMapping("/record/{routine_list_idx}")
	public ResponseEntity<?> insertRecord(@PathVariable int routine_list_idx, @RequestBody Map<String, Object> body, HttpSession session) {
		Map<String, Object> result = new HashMap<>();
		int member_idx = (int)(session.getAttribute("member_idx"));
		boolean recordResult = rcservice.insertRecord(body, member_idx);
		if(recordResult) {
			if((boolean) (body.get("update"))) {
				if(service.updateRoutine(body, member_idx)) {
					result.put("success", true);
					result.put("msg", "운동 기록 및 업데이트 되었습니다.");				
				}else {
					result.put("success", false);
					result.put("msg", "루틴 업데이트에 실패하였습니다.");				
				}
			}else {
				result.put("success", true);
				result.put("msg", "기록이 등록되었습니다.");				
			}
		}else {
			result.put("success", false);
			result.put("msg", "운동 기록이 실패하였습니다.");
		}
		
		return ResponseEntity.ok(result);
		
	}
	
}
