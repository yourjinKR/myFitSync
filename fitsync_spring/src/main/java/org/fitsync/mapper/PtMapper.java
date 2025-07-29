package org.fitsync.mapper;

import java.util.List;
import java.util.Map;

import org.fitsync.domain.PtVO;
import org.springframework.web.multipart.MultipartFile;

public interface PtMapper {
	// 운동 목록 리스트
	public List<PtVO> getWorkOut();
	// 이름 불러오기
	List<String> getWorkOutName();
	// idx와 이름 매핑
	List<PtVO> getWorkOutNameMap();
	
	public PtVO selectPtById(int ptIdx);
	
	public int updateWorkOut(PtVO vo);
	// 운동 삭제
	public int hideWorkOut(int pt_idx);
	
	public int insertWorkOut(PtVO vo);
}
