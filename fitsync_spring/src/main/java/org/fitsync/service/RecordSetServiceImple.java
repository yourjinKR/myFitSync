package org.fitsync.service;

import java.util.List;

import org.fitsync.domain.RecordSetVO;
import org.fitsync.mapper.RecordMapper;
import org.fitsync.mapper.RecordSetMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.extern.log4j.Log4j;

@Log4j
@Service
public class RecordSetServiceImple implements RecordSetService {

	@Autowired
	private RecordMapper mapper;
	@Autowired
	private RecordSetMapper setmapper;
	
    @Override
    public List<RecordSetVO> getRecordSetsByRecordId(int recordId) {
        return setmapper.selectRecordSetsByRecordId(recordId);
    }
	
}