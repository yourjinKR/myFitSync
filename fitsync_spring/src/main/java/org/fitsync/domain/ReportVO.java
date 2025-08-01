package org.fitsync.domain;

import java.sql.Date;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReportVO {
    private int report_idx, idx_num, report_hidden, member_idx, report_sanction, block_count;
    private String report_category, report_content;
    private Date report_time;

    // 신고자 (reporter)
    private MemberVO reporter;

    // 피신고자 (reported)
    private MemberVO reported;

    private ReviewVO review;
    private MessageVO message;
    private List<MessageVO> history_message;
}