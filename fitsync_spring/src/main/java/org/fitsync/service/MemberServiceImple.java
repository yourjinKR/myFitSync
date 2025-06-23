package org.fitsync.service;

import org.fitsync.mapper.MemberMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.extern.log4j.Log4j;

@Log4j
@Service
public class MemberServiceImple implements MemberService {

	@Autowired
	private MemberMapper mapper;
	
}