package org.fitsync.service;

import org.fitsync.mapper.RoutineMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.extern.log4j.Log4j;

@Log4j
@Service
public class RoutineServiceImple implements RoutineService {

	@Autowired
	private RoutineMapper mapper;
	
}