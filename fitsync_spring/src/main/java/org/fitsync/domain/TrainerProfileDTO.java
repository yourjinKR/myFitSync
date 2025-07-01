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
    private int member_idx;
    private String member_name;
    private String member_image;
    private String member_info;
    private int member_price;
    private String member_info_image;

    // 연관 VO들
    private List<AwardsVO> awards;
    private List<ReviewVO> reviews;
    
    public void setMember(MemberVO vo) {
        this.member_idx = vo.getMember_idx();
        this.member_name = vo.getMember_name();
        this.member_image = vo.getMember_image();
        this.member_info = vo.getMember_info();
        this.member_price = vo.getMember_price();
        this.member_info_image = vo.getMember_info_image();
    }
}
