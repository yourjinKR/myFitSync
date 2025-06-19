package org.fitsync.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.log4j.Log4j;

@Log4j
@RestController
public class TestController {
	
	@GetMapping("/api/test")
	public String Test() {
		return "1111111";
	}
}
