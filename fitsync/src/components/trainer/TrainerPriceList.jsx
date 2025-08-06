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

const PriceItem = styled.div`
  background: var(--bg-secondary);
  border: 2px solid var(--border-light);
  border-radius: 16px;
  margin-bottom: 20px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.15);
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(74, 144, 226, 0.25);
    border-color: var(--primary-blue);
  }

  /* 상단 헤더 */
  .price-header {
    background: linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-light) 100%);
    padding: 18px 22px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .lesson-count {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .count-number {
        color: white;
        font-size: 2.2rem;
        font-weight: 800;
        line-height: 1;
      }
      
      .count-text {
        color: rgba(255, 255, 255, 0.9);
        font-size: 1.5rem;
        font-weight: 600;
      }
    }
    
    .discount-badge {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 1.3rem;
      font-weight: 700;
      backdrop-filter: blur(10px);
      
      &.no-discount {
        display: none;
      }
    }
  }

  /* 가격 정보 영역 */
  .price-body {
    padding: 20px 22px;
    background: var(--bg-tertiary);
    
    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
      
      &:last-child {
        margin-bottom: 0;
        padding-top: 14px;
        border-top: 2px solid var(--border-light);
      }
      
      .price-label {
        color: var(--text-secondary);
        font-size: 1.5rem;
        font-weight: 600;
      }
      
      .price-value {
        color: var(--text-primary);
        font-size: 1.8rem;
        font-weight: 700;
        
        &.original-price {
          color: var(--text-tertiary);
          text-decoration: line-through;
          font-size: 1.4rem;
          font-weight: 500;
        }
        
        &.per-price {
          color: var(--primary-blue-light);
        }
        
        &.total-price {
          color: var(--primary-blue);
          font-size: 2.1rem;
          font-weight: 800;
        }
      }
    }
  }

  /* 인기 배지 */
  .popular-badge {
    position: absolute;
    top: -1px;
    right: 20px;
    background: #f59e0b;
    color: white;
    padding: 6px 16px;
    border-radius: 0 0 12px 12px;
    font-size: 1.2rem;
    font-weight: 700;
    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
  }

  @media (max-width: 500px) {
    margin-bottom: 16px;
    border-radius: 12px;
    
    .price-header {
      padding: 16px 18px;
      
      .lesson-count .count-number {
        font-size: 1.9rem;
      }
      
      .lesson-count .count-text {
        font-size: 1.3rem;
      }
      
      .discount-badge {
        font-size: 1.1rem;
        padding: 4px 10px;
      }
    }
    
    .price-body {
      padding: 18px;
      
      .price-row {
        margin-bottom: 12px;
        
        &:last-child {
          padding-top: 12px;
        }
        
        .price-label {
          font-size: 1.3rem;
        }
        
        .price-value {
          font-size: 1.6rem;
          
          &.original-price {
            font-size: 1.2rem;
          }
          
          &.total-price {
            font-size: 1.8rem;
          }
        }
      }
    }
    
    .popular-badge {
      right: 16px;
      padding: 4px 12px;
      font-size: 1.1rem;
    }
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

                {/* 인기 상품 배지 (4회 또는 8회일 때) */}
                {(lesson.lesson_num === 4 || lesson.lesson_num === 8) && (
                  <div className="popular-badge">인기</div>
                )}

                <div className="price-header">
                  <div className="lesson-count">
                    <span className="count-number">{lesson.lesson_num}</span>
                    <span className="count-text">회 레슨</span>
                  </div>
                  {lesson.lesson_percent > 0 && (
                    <div className="discount-badge">
                      {lesson.lesson_percent}% 할인
                    </div>
                  )}
                </div>
                
                <div className="price-body">
                  {lesson.lesson_percent > 0 && (
                    <div className="price-row">
                      <span className="price-label">정가</span>
                      <span className="price-value original-price">
                        {(basePrice * lesson.lesson_num).toLocaleString()}원
                      </span>
                    </div>
                  )}
                  <div className="price-row">
                    <span className="price-label">회당 가격</span>
                    <span className="price-value per-price">{pricePer.toLocaleString()}원</span>
                  </div>
                  <div className="price-row">
                    <span className="price-label">총 결제금액</span>
                    <span className="price-value total-price">{total.toLocaleString()}원</span>
                  </div>
                </div>
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
            {/* 인기 상품 배지 (4회 또는 8회일 때) */}
            {(lesson.lesson_num === 4 || lesson.lesson_num === 8) && (
              <div className="popular-badge">인기</div>
            )}

            <div className="price-header">
              <div className="lesson-count">
                <span className="count-number">{lesson.lesson_num}</span>
                <span className="count-text">회 레슨</span>
              </div>
              {lesson.lesson_percent > 0 && (
                <div className="discount-badge">
                  {lesson.lesson_percent}% 할인
                </div>
              )}
            </div>
            
            <div className="price-body">
              {lesson.lesson_percent > 0 && (
                <div className="price-row">
                  <span className="price-label">정가</span>
                  <span className="price-value original-price">
                    {(basePrice * lesson.lesson_num).toLocaleString()}원
                  </span>
                </div>
              )}
              <div className="price-row">
                <span className="price-label">회당 가격</span>
                <span className="price-value per-price">{pricePer.toLocaleString()}원</span>
              </div>
              <div className="price-row">
                <span className="price-label">총 결제금액</span>
                <span className="price-value total-price">{total.toLocaleString()}원</span>
              </div>
            </div>
          </PriceItem>
        );
      })}

      {!isEdit && sortedLessons.length === 0 && (
        <p style={{ color: 'var(--text-tertiary)', fontSize: '1.5rem', textAlign: 'center', padding: '20px' }}>가격표가 등록되지 않았습니다.</p>
      )}
    </Container>
  );
};

export default TrainerPriceList;
