package org.fitsync.service;

import org.fitsync.domain.AwardsVO;
import org.fitsync.mapper.AwardsMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.extern.log4j.Log4j;

@Log4j
@Service
public class AwardsServiceImple implements AwardsService {
	
	@Autowired
	private AwardsMapper mapper;

	@Override
	public int registerAwards(AwardsVO vo) {
		// TODO Auto-generated method stub
		return 0;
	}

}
