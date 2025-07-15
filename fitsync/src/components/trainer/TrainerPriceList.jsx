import React from 'react';
import styled from 'styled-components';

const Section = styled.section`
  padding: 24px 0;
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-secondary);
`;

const SectionTitle = styled.h3`
  font-weight: bold;
  margin-bottom: 16px;
  font-size: 1.3rem;
  color: var(--text-primary);
`;

const PriceItem = styled.div`
  background-color: var(--bg-tertiary);
  padding: 16px;
  border-radius: 10px;
  margin-bottom: 16px;
  color: var(--text-primary);
  font-size: 1.15rem;
  line-height: 1.6;

  strong {
    font-size: 1.2rem;
    color: var(--text-primary);
  }

  div {
    margin-top: 6px;
  }
`;

const Input = styled.input`
  width: 100%;
  font-size: 1.1rem;
  padding: 10px;
  margin-bottom: 16px;
  border-radius: 8px;
  border: 1px solid var(--border-light);
  background: var(--bg-primary);
  color: var(--text-primary);
  box-sizing: border-box;
`;

const InlineInput = styled.input`
  width: 100px;
  font-size: 1.1rem;
  padding: 6px 10px;
  margin-right: 12px;
  border-radius: 6px;
  border: 1px solid var(--border-light);
  background: var(--bg-primary);
  color: var(--text-primary);
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const AddButton = styled.button`
  background-color: var(--primary-blue);
  color: var(--text-primary);
  border: none;
  padding: 8px 14px;
  font-size: 1rem;
  border-radius: 6px;
  cursor: pointer;

  &:disabled {
    background-color: var(--border-medium);
    cursor: not-allowed;
  }
`;

const RemoveButton = styled.button`
  background-color: var(--warning);
  color: var(--text-primary);
  border: none;
  padding: 6px 12px;
  font-size: 0.9rem;
  border-radius: 6px;
  cursor: pointer;
`;

const Label = styled.label`
  color: var(--text-secondary);
  font-weight: 600;
  margin-right: 6px;
`;

const TrainerPriceList = ({ lessons = [], isEdit, onLessonsChange }) => {
  // 기본 가격은 lessons 첫 번째 항목에서 가져오거나 0으로 초기화
  const basePrice = lessons.length > 0 ? lessons[0].lesson_price : 0;

  // 기본 가격 변경 시, 모든 항목에 적용
  const handleBasePriceChange = (value) => {
    const price = parseInt(value || '0', 10);
    const newLessons = lessons.map((lesson) => ({
      ...lesson,
      lesson_price: price,
    }));
    onLessonsChange(newLessons);
  };

  // 개별 lesson 항목 수정 (lesson_num 또는 lesson_percent)
  const handleLessonChange = (index, field, value) => {
    const val = field === 'lesson_num' ? parseInt(value || '0', 10) : parseFloat(value || '0');
    const newLessons = [...lessons];
    newLessons[index] = {
      ...newLessons[index],
      [field]: val,
      lesson_price: basePrice,
    };
    onLessonsChange(newLessons);
  };

  // 항목 추가
  const handleAddLesson = () => {
    if (lessons.length >= 5) return;
    onLessonsChange([
      ...lessons,
      { lesson_price: basePrice, lesson_percent: 0, lesson_num: 1 },
    ]);
  };

  // 항목 삭제
  const handleRemoveLesson = (index) => {
    const newLessons = lessons.filter((_, i) => i !== index);
    onLessonsChange(newLessons);
  };

  return (
    <Section>
      <SectionTitle>가격표</SectionTitle>

      {isEdit && (
        <>
          <Label>기본 회당 가격</Label>
          <Input
            type="number"
            min="0"
            value={basePrice}
            onChange={(e) => handleBasePriceChange(e.target.value)}
            placeholder="기본 회당 가격을 입력하세요"
          />

          {lessons.map((lesson, index) => {
            const discount = lesson.lesson_percent / 100;
            const pricePer = Math.round(basePrice * (1 - discount));
            const total = pricePer * lesson.lesson_num;

            return (
              <PriceItem key={index}>
                <Controls>
                  <Label>횟수</Label>
                  <InlineInput
                    type="number"
                    min="1"
                    value={lesson.lesson_num}
                    onChange={(e) => handleLessonChange(index, 'lesson_num', e.target.value)}
                  />
                  <Label>할인률(%)</Label>
                  <InlineInput
                    type="number"
                    min="0"
                    max="100"
                    value={lesson.lesson_percent}
                    onChange={(e) => handleLessonChange(index, 'lesson_percent', e.target.value)}
                  />
                  <RemoveButton onClick={() => handleRemoveLesson(index)}>삭제</RemoveButton>
                </Controls>

                <div>
                  <strong>{lesson.lesson_num}회</strong> &nbsp;&nbsp;회당 {pricePer.toLocaleString()}원
                </div>
                <div>총금액 {total.toLocaleString()}원</div>
              </PriceItem>
            );
          })}

          <AddButton
            onClick={handleAddLesson}
            disabled={lessons.length >= 5}
            title={lessons.length >= 5 ? '최대 5개까지만 추가할 수 있습니다' : '항목 추가'}
          >
            + 항목 추가
          </AddButton>
        </>
      )}

      {!isEdit && lessons.length > 0 && lessons.map((lesson, index) => {
        const discount = lesson.lesson_percent / 100;
        const pricePer = Math.round(basePrice * (1 - discount));
        const total = pricePer * lesson.lesson_num;

        return (
          <PriceItem key={index}>
            <div>
              <strong>{lesson.lesson_num}회</strong> &nbsp;&nbsp;회당 {pricePer.toLocaleString()}원
            </div>
            <div>총금액 {total.toLocaleString()}원</div>
          </PriceItem>
        );
      })}

      {!isEdit && lessons.length === 0 && (
        <p style={{ color: 'var(--text-tertiary)' }}>가격표가 등록되지 않았습니다.</p>
      )}
    </Section>
  );
};

export default TrainerPriceList;
