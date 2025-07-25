package org.fitsync.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.fitsync.domain.AwardsVO;

public interface AwardsMapper {

	public int insertAward(AwardsVO vo);
	
	public List<AwardsVO> selectApprovedAwards(@Param("trainerIdx") int trainerIdx);
	// 경력 요청 리스트
	public List<AwardsVO> getAwards();
	// 경력 요청 처리
	public int updateAwards(AwardsVO vo);
}