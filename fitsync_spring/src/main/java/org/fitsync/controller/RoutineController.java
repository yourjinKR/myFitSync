package org.fitsync.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.apache.ibatis.annotations.Param;
import org.fitsync.domain.PtVO;
import org.fitsync.domain.RoutineListVO;
import org.fitsync.domain.RoutineMemberDTO;
import org.fitsync.service.PtServiceImple;
import org.fitsync.service.RecordServiceImple;
import org.fitsync.service.RoutineServiceImple;
import org.fitsync.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
	// 내 루틴 리스트 조회용 
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
	// 트레이너 -> 내 회원 루틴 리스트 조회용
	@GetMapping("/getList/{memberIdx}")
	public ResponseEntity<?> getRoutineListByTrainer(@PathVariable("memberIdx") int memberIdx) {
	    Map<String, Object> result = new HashMap<>();
	    List<RoutineListVO> list = service.getRoutineList(memberIdx);

	    if (list != null && !list.isEmpty()) {
	        result.put("success", true);
	        result.put("vo", list);
	    } else {
	        result.put("success", false);
	    }
	    return ResponseEntity.ok(result);
	}
	
	// 트레이너 -> 유저 루틴 조회
	@GetMapping("/trainer/{routine_list_idx}/{member_idx}")
	public ResponseEntity<?> getRoutineDetailForTrainer(@PathVariable int routine_list_idx, @PathVariable int member_idx) {
	    Map<String, Object> result = new HashMap<>();

	    RoutineMemberDTO rmdto = new RoutineMemberDTO();
	    rmdto.setRoutine_list_idx(routine_list_idx);
	    rmdto.setMember_idx(member_idx); // 해당 회원의 루틴 조회

	    RoutineListVO rvo = service.getRoutine(rmdto);
	    if (rvo != null) {
	        result.put("success", true);
	        result.put("vo", rvo);
	        result.put("msg", "루틴 호출에 성공하였습니다.");
	    } else {
	        result.put("success", false);
	        result.put("msg", "루틴 호출에 실패하였습니다.");
	    }
	    return ResponseEntity.ok(result);
	}

	
	// 루틴 운동 VIEW
	@GetMapping("/{routine_list_idx}")
	public ResponseEntity<?> getRoutineDetail(@PathVariable int routine_list_idx, HttpSession session){
		Map<String, Object> result = new HashMap<>();
		Object sessionIdx = session.getAttribute("member_idx");
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
	    System.out.println("writer_idx = " + sessionIdx);
	    if (sessionIdx == null) {
	        result.put("success", false);
	        result.put("msg", "인증 정보가 없습니다.");
	        return ResponseEntity.status(401).body(result);
	    }

	    int sessionMemberIdx = Integer.parseInt(sessionIdx.toString());

	    int targetMemberIdx;
	    Object memberIdxObj = body.get("member_idx");

	    if (memberIdxObj != null && !memberIdxObj.toString().isEmpty()) {
	        try {
	            System.out.println("try 호출 됨" + memberIdxObj + "ㅁㄴㅇ" + sessionMemberIdx);
	        	targetMemberIdx = Integer.parseInt(memberIdxObj.toString());
	        } catch (NumberFormatException e) {
	            result.put("success", false);
	            result.put("msg", "잘못된 회원 번호 형식입니다.");
	            return ResponseEntity.status(400).body(result);
	        }
	    } else {
	    	targetMemberIdx = sessionMemberIdx;
	    }
	    
	    body.put("writer_idx", sessionMemberIdx);
	    
	    service.insertRoutine(body, targetMemberIdx);

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
	
	@PutMapping("/update/{routine_list_idx}")
	public ResponseEntity<?> updateRoutine(@PathVariable int routine_list_idx, @RequestBody Map<String, Object> body, HttpSession session) {
		Map<String, Object> result = new HashMap<>();
		int member_idx = (int)(session.getAttribute("member_idx"));
		if(service.updateRoutine(body, member_idx)) {
			result.put("success", true);
			result.put("msg", "루틴이 업데이트 되었습니다.");		
		}else {
			result.put("success", false);
			result.put("msg", "업데이트에 실패하였습니다.");		
		}
		
		return ResponseEntity.ok(result);
	}
	
	// 루틴 기록
	@PostMapping("/record")
	public ResponseEntity<?> insertRecord(@RequestBody Map<String, Object> body, HttpSession session) {
	    Map<String, Object> result = new HashMap<>();

	    int member_idx = (int) session.getAttribute("member_idx");

	    // 프론트에서 보낸 member_idx가 존재한다면 그걸 우선 사용
	    if (body.get("member_idx") != null && !body.get("member_idx").toString().isBlank()) {
	        try {
	            member_idx = Integer.parseInt(body.get("member_idx").toString());
	        } catch (NumberFormatException e) {
	            result.put("success", false);
	            result.put("msg", "유효하지 않은 사용자 정보입니다.");
	            return ResponseEntity.badRequest().body(result);
	        }
	    }

	    String recordResult = rcservice.insertRecord(body, member_idx);
	    if (recordResult.equals("success")) {
	        result.put("success", true);
	        result.put("msg", "정상 등록되었습니다.");
	    } else {
	        result.put("success", false);
	        result.put("msg", recordResult);
	    }

	    return ResponseEntity.ok(result);
	}

	
	// 루틴 정렬
	@PutMapping("/sort")
	public ResponseEntity<?> sortUpdate(@RequestBody List<Integer> body, HttpSession session) {
		Map<String, Object> result = new HashMap<>();
		int member_idx = (int)(session.getAttribute("member_idx"));

		boolean updateResult = service.sortUpdate(body, member_idx);
		if(updateResult) {
			result.put("success", true);
			result.put("msg", "정상 등록되었습니다.");		
		}else {
			result.put("success", false);
			result.put("msg", "업데이트 실패하였습니다.");		
		} 
		
		return ResponseEntity.ok(result);
	}

	// 운동 상세보기 조회
    @GetMapping("/pt/{ptId}")
    public ResponseEntity<Map<String, Object>> getPtById(@PathVariable("ptId") int ptId) {
        PtVO pt = ptservice.getPtById(ptId);
		Map<String, Object> result = new HashMap<>();

        if (pt != null) {
			PtVO randomPt = ptservice.getOneRandomByCategory(pt);
			result.put("pt", pt);
			result.put("randomPt", randomPt);

            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
