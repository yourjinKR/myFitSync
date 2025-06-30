package org.fitsync.service;

import java.util.List;

import org.fitsync.domain.BodyVO;

public interface BodyService {
    List<BodyVO> getBodyListByMemberIdx(int member_idx);
    BodyVO getLatestBodyByMemberIdx(int member_idx);
}
