package org.fitsync.mapper;

import java.util.List;

import org.fitsync.domain.PtVO;

public interface PtMapper {
	// 운동 목록 리스트
	public List<PtVO> getWorkOut();
}
