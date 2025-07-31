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
    
    @Override
    public int calculateMatchingPrice(int memberIdx, int matchingTotal) {
        log.info("복합 할인 가격 계산 시작 - memberIdx: " + memberIdx + ", matchingTotal: " + matchingTotal);
        
        // 해당 트레이너의 lesson 데이터 조회
        List<LessonVO> lessons = mapper.getLessonsByTrainer(memberIdx);
        
        if (lessons == null || lessons.isEmpty()) {
            log.warn("lesson 데이터가 없음 - memberIdx: " + memberIdx);
            return -1; // lesson 데이터가 없으면 -1 반환 (가격미정 표시용)
        }
        
        // lesson_num 기준 내림차순 정렬 (큰 단위부터 적용)
        lessons.sort((a, b) -> Integer.compare(b.getLesson_num(), a.getLesson_num()));
        
        log.info("사용 가능한 lesson 정책들:");
        for (LessonVO lesson : lessons) {
            log.info("  - " + lesson.getLesson_num() + "회: " + lesson.getLesson_price() + "원/회, " + lesson.getLesson_percent() + "% 할인");
        }
        
        int totalPrice = 0;
        int remainingLessons = matchingTotal;
        
        // 큰 단위부터 차례로 적용
        for (LessonVO lesson : lessons) {
            if (remainingLessons <= 0) break;
            
            int lessonNum = lesson.getLesson_num();
            int lessonPrice = lesson.getLesson_price();
            int lessonPercent = lesson.getLesson_percent();
            
            // 현재 lesson 정책으로 적용 가능한 세트 수
            int applicableSets = remainingLessons / lessonNum;
            
            if (applicableSets > 0) {
                // 할인 적용된 가격 계산
                int discountedLessons = applicableSets * lessonNum;
                double discountRate = (double) lessonPercent / 100.0;
                int discountedPrice = (int) (discountedLessons * lessonPrice * (1 - discountRate));
                
                totalPrice += discountedPrice;
                remainingLessons -= discountedLessons;
                
                log.info("적용: " + lessonNum + "회 정책 x " + applicableSets + "세트 = " + discountedLessons + "회");
                log.info("  할인전 가격: " + (discountedLessons * lessonPrice) + "원");
                log.info("  할인율: " + lessonPercent + "%");
                log.info("  할인후 가격: " + discountedPrice + "원");
                log.info("  남은 횟수: " + remainingLessons + "회");
            }
        }
        
        // 남은 레슨이 있으면 가장 작은 단위의 정가로 계산
        if (remainingLessons > 0) {
            // 가장 작은 lesson_num을 가진 정책의 가격 사용
            LessonVO smallestLesson = lessons.get(lessons.size() - 1);
            int remainingPrice = remainingLessons * smallestLesson.getLesson_price();
            totalPrice += remainingPrice;
            
            log.info("남은 " + remainingLessons + "회는 정가 적용: " + smallestLesson.getLesson_price() + "원/회 x " + remainingLessons + "회 = " + remainingPrice + "원");
        }
        
        log.info("최종 계산 결과:");
        log.info("  총 PT 횟수: " + matchingTotal + "회");
        log.info("  최종 가격: " + totalPrice + "원");
        log.info("  평균 단가: " + (totalPrice / matchingTotal) + "원/회");
        
        return totalPrice;
    }
}