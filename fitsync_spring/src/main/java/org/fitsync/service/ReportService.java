package org.fitsync.service;

import java.util.List;

import org.fitsync.domain.ReportVO;

public interface ReportService {
	public List<ReportVO> getReport();
	
	// 메시지 신고 등록
    public boolean reportMessage(int messageIdx, String reportContent, int memberIdx);
}
