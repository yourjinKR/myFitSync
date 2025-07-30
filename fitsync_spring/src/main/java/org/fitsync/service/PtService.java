package org.fitsync.service;

import java.util.List;

import org.fitsync.domain.PtVO;
import org.springframework.web.multipart.MultipartFile;

public interface PtService {
	// 운동 목록 리스트
	public List<PtVO> getWorkOut();
	
    public List<String> getAllPtNames();
    
    public PtVO getPtById(int ptIdx);
    // 운동 업데이트
    public boolean updateWorkOut(PtVO vo, List<MultipartFile> newfile, List<String> descriptions);
    // 운동 삭제
    public boolean hideWorkOut(int pt_idx);
    
    public boolean insertWorkOut(PtVO vo, List<MultipartFile> newfile, List<String> descriptions);

    public PtVO getOneRandomByCategory(PtVO vo);
}
