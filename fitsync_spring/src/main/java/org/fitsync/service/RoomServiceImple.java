package org.fitsync.service;

import org.fitsync.mapper.RoomMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.extern.log4j.Log4j;

@Log4j
@Service
public class RoomServiceImple implements RoomService {

	@Autowired
	private RoomMapper mapper;
	
}