package org.fitsync.service;

import java.util.List;

import org.fitsync.domain.BodyVO;
import org.fitsync.mapper.BodyMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.extern.log4j.Log4j;

@Log4j
@Service
public class BodyServiceImple implements BodyService {
	
	@Autowired
	private BodyMapper mapper;
	
    @Override
    public List<BodyVO> getBodyListByMemberIdx(int member_idx) {
        return mapper.selectByMemberIdx(member_idx);
    }

    @Override
    public BodyVO getLatestBodyByMemberIdx(int member_idx) {
        return mapper.selectLatestByMemberIdx(member_idx);
    }
}