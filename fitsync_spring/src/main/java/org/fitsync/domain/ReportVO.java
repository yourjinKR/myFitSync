package org.fitsync.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReportVO {
    private int report_idx, idx_num, report_hidden;
    private String report_category, report_content;

    // 신고자 (reporter)
    private MemberVO reporter;

    // 피신고자 (reported)
    private MemberVO reported;

    private ReviewVO review;
    private MessageVO message;
}