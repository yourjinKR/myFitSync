package org.fitsync.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.fitsync.domain.AwardsVO;
import org.fitsync.domain.ReviewVO;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TrainerProfileDTO {
    private int member_idx, member_price, gym_idx, member_hidden;
    private String member_name, member_image, member_info, member_info_image, member_time, member_intro, member_email;

    // 연관 VO들
    private List<AwardsVO> awards;
    private List<ReviewVO> reviews;
    private GymVO gymInfo;
    private List<String> infoImageUrls;
    
    public void setMember(MemberVO vo) {
        this.member_idx = vo.getMember_idx();
        this.member_name = vo.getMember_name();
        this.member_image = vo.getMember_image();
        this.member_info = vo.getMember_info();
        this.member_info_image = vo.getMember_info_image();
        this.member_time = vo.getMember_time();
        this.member_intro = vo.getMember_intro();
        this.member_email = vo.getMember_email();
        this.gym_idx = vo.getGym_idx();
        this.member_hidden = vo.getMember_hidden();
        }
}
