package org.fitsync.service;

import java.util.List;

import org.fitsync.domain.ReviewVO;
import org.fitsync.mapper.ReviewMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.extern.log4j.Log4j;

@Log4j
@Service
public class ReviewServiceImple implements ReviewService {

	@Autowired
	private ReviewMapper mapper;
	
    @Override
    public List<ReviewVO> getReviewsByTrainer(int trainerIdx) {
        return mapper.selectReviewsByTrainer(trainerIdx);
    }
    
    @Override
    public void insertReview(ReviewVO reviewVO) {
        mapper.insertReview(reviewVO);
    }
}