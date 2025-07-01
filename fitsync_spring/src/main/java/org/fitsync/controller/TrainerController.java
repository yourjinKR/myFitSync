package org.fitsync.controller;

import java.util.List;

import org.fitsync.domain.AwardsVO;
import org.fitsync.domain.MemberVO;
import org.fitsync.domain.ReviewVO;
import org.fitsync.domain.TrainerProfileDTO;
import org.fitsync.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/trainer")
@CrossOrigin(origins = "*")
public class TrainerController {

    @Autowired
    private MemberService memberService;

    // 로그인 없이 특정 트레이너 프로필 조회
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
}
