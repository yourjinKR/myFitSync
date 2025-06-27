package org.fitsync.service;

import java.util.List;

import org.fitsync.domain.PtVO;

public interface PtService {
	// 운동 목록 리스트
	public List<PtVO> getWorkOut();
}
