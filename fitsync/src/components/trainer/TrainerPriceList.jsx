import React from 'react';
import styled from 'styled-components';

// TrainerIntroSection과 통일된 스타일
const Container = styled.div`
  padding-left: 25px;
  padding-right: 25px;
  @media (max-width: 500px) {
    padding-left: 12px;
    padding-right: 12px;
  }
`;

const Section = styled.section`
  padding: 28px 0 22px 0;
  border-bottom: 2px solid var(--border-light);
  background: var(--bg-secondary);

  &:last-of-type {
    border-bottom: none;
  }

  @media (max-width: 500px) {
    padding: 20px 0 16px 0;
  }
`;

const SectionTitle = styled.h3`
  font-weight: 800;
  margin-bottom: 16px;
  font-size: 1.5rem;
  color: var(--primary-blue);
  letter-spacing: -0.01em;
  @media (max-width: 500px) {
    font-size: 1.3rem;
  }
`;

const PriceItem = styled.div`
  background-color: var(--bg-tertiary);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  color: var(--text-primary);
  font-size: 1.4rem;
  line-height: 1.6;

  strong {
    font-size: 1.4rem;
    color: var(--primary-blue);
  }

  div {
    margin-top: 8px;
  }
`;

const Input = styled.input`
  width: 100%;
  font-size: 1.3rem;
  padding: 12px 15px;
  margin-bottom: 15px;
  border-radius: 10px;
  border: 2px solid var(--border-medium);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  box-sizing: border-box;
  transition: border 0.18s, background 0.18s;
  &:focus {
    border: 2px solid var(--primary-blue);
    background: var(--bg-secondary);
  }
`;

const InlineInput = styled.input`
  width: 100px;
  font-size: 1.3rem;
  padding: 9px 12px;
  margin-right: 15px;
  border-radius: 9px;
  border: 2px solid var(--border-medium);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  transition: border 0.18s, background 0.18s;
  &:focus {
    border: 2px solid var(--primary-blue);
    background: var(--bg-secondary);
  }
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
`;

const AddButton = styled.button`
  background: linear-gradient(90deg, var(--primary-blue) 60%, var(--primary-blue-light) 100%);
  color: var(--text-primary);
  border: none;
  padding: 10px 20px;
  font-size: 1.2rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
  margin-top: 4px;
  margin-bottom: 4px;
  transition: background 0.18s;
  &:disabled {
    background: var(--border-medium);
    cursor: not-allowed;
  }
`;

const RemoveButton = styled.button`
  background-color: var(--warning);
  color: var(--text-primary);
  border: none;
  padding: 9px 16px;
  font-size: 1.15rem;
  border-radius: 9px;
  cursor: pointer;
  font-weight: 600;
  margin-left: 10px;
`;

const Label = styled.label`
  color: var(--primary-blue-light);
  font-weight: 600;
  margin-right: 8px;
  font-size: 1.2rem;
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

  // 정렬: 보여줄 때만 정렬, 수정 중에는 입력 순서 유지
  const sortedLessons = !isEdit
    ? [...lessons].sort((a, b) => (a.lesson_num || 0) - (b.lesson_num || 0))
    : lessons;

  return (
    <Container>
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

      {!isEdit && sortedLessons.length > 0 && sortedLessons.map((lesson, index) => {
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

      {!isEdit && sortedLessons.length === 0 && (
        <p style={{ color: 'var(--text-tertiary)', fontSize: '1.3rem' }}>가격표가 등록되지 않았습니다.</p>
      )}
    </Container>
  );
};

export default TrainerPriceList;
