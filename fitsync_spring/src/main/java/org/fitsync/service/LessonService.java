package org.fitsync.service;

import java.util.List;

import org.fitsync.domain.LessonVO;

public interface LessonService {
    
	public List<LessonVO> getLessonsByMemberIdx(int memberIdx);

    public void saveLessons(int memberIdx, List<LessonVO> lessons);
}
