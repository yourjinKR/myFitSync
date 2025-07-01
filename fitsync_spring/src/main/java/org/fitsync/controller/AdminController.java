package org.fitsync.controller;

import java.util.List;
import java.util.Map;

import org.fitsync.domain.ApiLogVO;
import org.fitsync.service.ApiLogServiceImple;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
public class AdminController {
	@Autowired
	ApiLogServiceImple apiLogService;
	
    @GetMapping(value = "/test", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("test");
    }
	
    @GetMapping(value = "/getAllApi", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
    public ResponseEntity<List<ApiLogVO>> getAllApi() {
        return ResponseEntity.ok(apiLogService.selectApiList());
    }


}
