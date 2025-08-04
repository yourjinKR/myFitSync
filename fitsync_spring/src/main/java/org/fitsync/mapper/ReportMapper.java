package org.fitsync.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.fitsync.domain.ReportVO;

public interface ReportMapper {
    List<ReportVO> getReport();

    // 신고 등록
    public int insertReport(ReportVO vo);
    // 특정 메시지에 대한 중복 신고 체크
    public int checkDuplicateReport(@Param("idx_num") int idx_num, @Param("member_idx") int member_idx, @Param("report_category") String report_category);
	// 신고 제재 업데이트
 	public int updateReport(ReportVO vo);
 	
 	public ReportVO getBlockData(int member_idx);
 	
 	// 프로필에서 신고 등록
 	public void insertProfileReport(ReportVO report);
}