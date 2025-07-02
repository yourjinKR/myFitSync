package org.fitsync.controller;

import java.util.List;

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
    public ResponseEntity<String> updateTrainer(
        @PathVariable int trainerIdx,
        @RequestBody MemberVO member,
        HttpSession session) {

        // 로그인 체크
        MemberVO loginUser = (MemberVO) session.getAttribute("login");
        if (loginUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        // 로그인한 회원과 수정 요청한 회원이 같은지 체크
        if (loginUser.getMember_idx() != trainerIdx || trainerIdx != member.getMember_idx()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("권한이 없습니다.");
        }

        // 실제 업데이트 처리
        try {
            memberService.updateTrainerProfile(member);
            return ResponseEntity.ok("수정 완료");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류");
        }
    }
}
