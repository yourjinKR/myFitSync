package org.fitsync.domain;

import java.sql.Date;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class KakaoPayDTO {
    private String tid; // 결제 고유 번호
    private String next_redirect_pc_url; // web - 받는 결제 페이지
    private Date created_at;
}
