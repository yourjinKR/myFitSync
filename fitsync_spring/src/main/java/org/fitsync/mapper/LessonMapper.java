package org.fitsync.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.fitsync.domain.LessonVO;

public interface LessonMapper {
    public List<LessonVO> getLessonsByTrainer(int memberIdx);

    public LessonVO getLessonByTrainerAndNum(@Param("memberIdx") int memberIdx, @Param("lesson_num") int lesson_num);

    public void deleteLessonByTrainerAndNum(@Param("memberIdx") int memberIdx, @Param("lesson_num") int lesson_num);

    public void insertLesson(LessonVO lesson);

    public void updateLesson(LessonVO lesson);
}
