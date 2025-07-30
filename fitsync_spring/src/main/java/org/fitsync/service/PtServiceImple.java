package org.fitsync.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.fitsync.domain.ChatAttachVO;
import org.fitsync.domain.PtVO;
import org.fitsync.mapper.PtMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import lombok.extern.log4j.Log4j;

@Log4j
@Service
public class PtServiceImple implements PtService {
	
	@Autowired
	private PtMapper mapper;
	@Autowired
    private CloudinaryService cloudinaryService;
	
	@Override
	public List<PtVO> getWorkOut() {
		return mapper.getWorkOut();
	}
	@Override
    public List<String> getAllPtNames() {
        return mapper.getWorkOutName();
    }
	@Override
	public PtVO getPtById(int ptIdx) {
		return mapper.selectPtById(ptIdx);
	}
	
	// 운동 업데이트
	@Override
	public boolean updateWorkOut(PtVO vo, List<MultipartFile> newfile, List<String> descriptions) {
		String str = "";
		if(newfile.size() > 0) {
			for (MultipartFile file : newfile) {
				try {
					ChatAttachVO attach = cloudinaryService.uploadFile(file);
					if(str.length() > 0) {
						str += ",";
					}
					str += attach.getCloudinary_url();
				} catch (Exception e) {
					e.printStackTrace();
					return false;
				}
			}
		}
		if(descriptions.size() > 0) {
			for (String string : descriptions) {
				if(str.length() > 0) {
					str += ",";
				}
				str += string;
			}
		}
		vo.setPt_image(str);
		
	    return mapper.updateWorkOut(vo) > 0;
	}
	
	// 운동 숨기기
	@Override
	public boolean hideWorkOut(int pt_idx) {
		return mapper.hideWorkOut(pt_idx) > 0;
	}
	
	// 운동 추가
	@Override
	public boolean insertWorkOut(PtVO vo, List<MultipartFile> newfile, List<String> descriptions) {
		String str = "";
		if(newfile.size() > 0) {
			for (MultipartFile file : newfile) {
				try {
					ChatAttachVO attach = cloudinaryService.uploadFile(file);
					if(str.length() > 0) {
						str += ",";
					}
					str += attach.getCloudinary_url();
				} catch (Exception e) {
					e.printStackTrace();
					return false;
				}
			}
		}
		if(descriptions.size() > 0) {
			for (String string : descriptions) {
				if(str.length() > 0) {
					str += ",";
				}
				str += string;
			}
		}
		vo.setPt_image(str);
		
	    return mapper.insertWorkOut(vo) > 0;
	}

	@Override
	public PtVO getOneRandomByCategory(PtVO vo) {
		return mapper.selectOneRandomByCategory(vo);
	}
}