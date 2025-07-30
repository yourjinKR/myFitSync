package org.fitsync.service;

import java.util.List;

import org.fitsync.domain.ReviewVO;

public interface ReviewService {
	
	public List<ReviewVO> getReviewsByTrainer(int trainerIdx);
	
	public void insertReview(ReviewVO reviewVO);
}
