package org.fitsync.service;

import java.util.List;

import org.fitsync.domain.BodyVO;

public interface BodyService {
    public void insertBody(BodyVO vo);
	public List<BodyVO> getBodyListByMemberIdx(int member_idx);
    public BodyVO getLatestBodyByMemberIdx(int member_idx);
    public int updateBodyData(BodyVO body);
}

