package org.fitsync.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.fitsync.domain.ReviewVO;

public interface ReviewMapper {
	public ReviewVO getReviewOne(int review_idx);
	
	public List<ReviewVO> selectReviewsByTrainer(@Param("trainerIdx") int trainerIdx);
	
	public void insertReview(ReviewVO reviewVO);
	
	public int reviewHidden(int matching_idx);
}
