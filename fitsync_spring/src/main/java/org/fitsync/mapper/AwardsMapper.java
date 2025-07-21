package org.fitsync.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.fitsync.domain.AwardsVO;

public interface AwardsMapper {

	public int insertAward(AwardsVO vo);
	
	public List<AwardsVO> selectApprovedAwards(@Param("trainerIdx") int trainerIdx);
	
}