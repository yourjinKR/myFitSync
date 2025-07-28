package org.fitsync.mapper;

import java.util.List;

import org.fitsync.domain.BodyVO;

public interface BodyMapper {
	public int insertBody(BodyVO vo);
	public List<BodyVO> selectByMemberIdx(int member_idx);
	public BodyVO selectLatestByMemberIdx(int member_idx);
	public int updateBodyData(BodyVO body);
}
