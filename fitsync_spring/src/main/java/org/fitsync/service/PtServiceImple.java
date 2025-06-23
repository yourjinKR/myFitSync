package org.fitsync.service;

import org.fitsync.mapper.PtMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.extern.log4j.Log4j;

@Log4j
@Service
public class PtServiceImple implements PtService {
	
	@Autowired
	private PtMapper mapper;
	
}