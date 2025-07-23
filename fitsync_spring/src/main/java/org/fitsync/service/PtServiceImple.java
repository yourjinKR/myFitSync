package org.fitsync.service;

import java.util.List;

import org.fitsync.domain.PtVO;
import org.fitsync.mapper.PtMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.extern.log4j.Log4j;

@Log4j
@Service
public class PtServiceImple implements PtService {
	
	@Autowired
	private PtMapper mapper;
	
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
}