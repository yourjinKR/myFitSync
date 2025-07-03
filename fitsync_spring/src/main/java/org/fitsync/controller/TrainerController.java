package org.fitsync.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.fitsync.domain.AwardsVO;
import org.fitsync.domain.MemberVO;
import org.fitsync.domain.ReviewVO;
import org.fitsync.domain.TrainerProfileDTO;
import org.fitsync.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/trainer")
public class TrainerController {

    @Autowired
    private MemberService memberService;

    // 트레이너 프로필 조회
    @GetMapping("/profile/{trainerIdx}")
    public ResponseEntity<?> getTrainerProfileById(@PathVariable int trainerIdx) {
        MemberVO member = memberService.getTrainerByIdx(trainerIdx);
        if (member == null) {
            return ResponseEntity.status(404).body("Trainer not found");
        }

        List<AwardsVO> awards = memberService.getAwardsByMemberIdx(trainerIdx);
        List<ReviewVO> reviews = memberService.getReviewsByMemberIdx(trainerIdx);

        TrainerProfileDTO profile = new TrainerProfileDTO();
        profile.setMember(member);
        profile.setAwards(awards);
        profile.setReviews(reviews);

        return ResponseEntity.ok(profile);
    }
    
    // 트레이너 프로필 수정
    @PutMapping("/update/{trainerIdx}")
    public ResponseEntity<Map<String, Object>> updateTrainer(
        @PathVariable int trainerIdx,
        @RequestBody MemberVO member,
        HttpSession session) {

        Map<String, Object> result = new HashMap<>();

        Object sessionIdx = session.getAttribute("member_idx");
        if (sessionIdx == null) {
            result.put("success", false);
            result.put("msg", "인증 정보 없음");
            return ResponseEntity.status(401).body(result);
        }

        int memberIdx = Integer.parseInt(sessionIdx.toString());
        if (memberIdx != trainerIdx) {
            result.put("success", false);
            result.put("msg", "수정 권한 없음");
            return ResponseEntity.status(403).body(result);
        }

        try {
            memberService.updateTrainerProfile(member);
            System.out.println("[백엔드] 수정 성공");

            result.put("success", true);
            result.put("msg", "수정 완료");
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
            result.put("msg", "업데이트 중 오류 발생: " + e.getMessage());
            return ResponseEntity.status(500).body(result);
        }
    }



    
}
