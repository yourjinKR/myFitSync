package org.fitsync.service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.fitsync.domain.LessonVO;
import org.fitsync.mapper.LessonMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.extern.log4j.Log4j;

@Log4j
@Service
public class LessonServiceImple implements LessonService {

    @Autowired
    private LessonMapper mapper;

    @Override
    public List<LessonVO> getLessonsByMemberIdx(int memberIdx) {
        return mapper.getLessonsByTrainer(memberIdx);
    }

    @Override
    public void saveLessons(int memberIdx, List<LessonVO> newLessons) {
        List<LessonVO> existingLessons = mapper.getLessonsByTrainer(memberIdx);

        Set<Integer> newNums = newLessons.stream()
                .map(LessonVO::getLesson_num)
                .collect(Collectors.toSet());

        // 삭제
        for (LessonVO oldLesson : existingLessons) {
            if (!newNums.contains(oldLesson.getLesson_num())) {
                mapper.deleteLessonByTrainerAndNum(memberIdx, oldLesson.getLesson_num());
            }
        }

        // 삽입/수정
        for (LessonVO lesson : newLessons) {
            lesson.setMember_idx(memberIdx);
            LessonVO existing = mapper.getLessonByTrainerAndNum(memberIdx, lesson.getLesson_num());
            if (existing != null) {
                mapper.updateLesson(lesson);
            } else {
                mapper.insertLesson(lesson);
            }
        }
    }
}
