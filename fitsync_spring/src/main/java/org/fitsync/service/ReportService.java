package org.fitsync.service;

import java.util.List;

import org.fitsync.domain.ReportVO;

public interface ReportService {
	public List<ReportVO> getReport();
	// 메시지 신고 등록
	public boolean reportMessage(int messageIdx, String reportContent, int memberIdx);
	// 신고 제재 업데이트
	public boolean updateReport(int report_idx, int member_idx, int block_set);
	public boolean updateReport(int report_idx, int member_idx, int block_set, int report_data_idx);

	public ReportVO getBlockData(int member_idx);
	
	public void insertReport(ReportVO report);
	// UserProfileModal 사용자 프로필 신고
	public void insertUserProfileReport(ReportVO report);
}
