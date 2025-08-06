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
  padding: 24px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(74, 144, 226, 0.25);
    border-color: var(--primary-blue);
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

  /* 할인 배지 */
  .discount-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    background: var(--primary-blue);
    color: white;
    padding: 4px 12px;
    border-radius: 16px;
    font-size: 1.1rem;
    font-weight: 600;
  }

  /* 메인 가격 정보 */
  .price-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    
    .lesson-count {
      color: var(--text-primary);
      font-size: 2.4rem;
      font-weight: 800;
      
      .count-text {
        font-size: 1.6rem;
        font-weight: 600;
        color: var(--text-secondary);
        margin-left: 4px;
      }
    }
    
    .per-price {
      color: var(--text-primary);
      font-size: 2.4rem;
      font-weight: 800;
    }
  }

  /* 총 가격 */
  .total-price {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    color: var(--text-tertiary);
    font-size: 1.4rem;
    font-weight: 500;
    min-height: 40px; /* 일정한 높이 보장 */
    gap: 15px; /* 할인 섹션과 총 금액 사이 간격 */
    
    .discount-section {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;
      flex: 1; /* 왼쪽 공간 차지 */
      
      .discount-info {
        color: var(--primary-blue);
        font-size: 1.1rem;
        font-weight: 600;
        line-height: 1.2;
      }
      
      .original-price {
        text-decoration: line-through;
        color: var(--text-tertiary);
        font-size: 1.1rem;
        font-weight: 400;
        line-height: 1.2;
      }
    }
    
    .total-amount {
      color: var(--text-primary);
      font-size: 1.6rem;
      font-weight: 700;
      text-align: right;
      flex-shrink: 0; /* 크기 고정 */
    }
  }

  @media (max-width: 500px) {
    margin-bottom: 16px;
    border-radius: 12px;
    padding: 20px;
    
    .price-main {
      .lesson-count {
        font-size: 2.0rem;
        
        .count-text {
          font-size: 1.4rem;
        }
      }
      
      .per-price {
        font-size: 2.0rem;
      }
    }
    
    .total-price {
      font-size: 1.2rem;
      min-height: 36px;
      
      .discount-section {
        .discount-info {
          font-size: 1.0rem;
        }
        
        .original-price {
          font-size: 1.0rem;
        }
      }
      
      .total-amount {
        font-size: 1.4rem;
      }
    }
    
    .popular-badge {
      right: 16px;
      padding: 4px 12px;
      font-size: 1.1rem;
    }
    
    .discount-badge {
      top: 10px;
      left: 10px;
      font-size: 1.0rem;
      padding: 3px 10px;
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

const EditForm = styled.div`
  background: var(--bg-tertiary);
  border: 2px solid var(--border-light);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  position: relative;

  .form-row {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 15px;
    flex-wrap: wrap;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid var(--border-light);
  }

  @media (max-width: 500px) {
    padding: 16px;
    
    .form-row {
      flex-direction: column;
      align-items: stretch;
      gap: 10px;
    }
  }
`;

const FormLabel = styled.label`
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 1.2rem;
  margin-bottom: 3px;
`;

const FormInput = styled.input`
  width: 120px;
  font-size: 1.3rem;
  padding: 10px 12px;
  border-radius: 8px;
  border: 2px solid var(--border-medium);
  background: var(--bg-secondary);
  color: var(--text-primary);
  transition: border 0.18s, background 0.18s;
  
  &:focus {
    border: 2px solid var(--primary-blue);
    background: var(--bg-primary);
  }

  @media (max-width: 500px) {
    width: 100%;
  }
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

  // 정렬: 읽기 모드에서만 정렬, 편집 모드에서는 입력 순서 유지
  const displayLessons = isEdit ? lessons : [...lessons].sort((a, b) => (a.lesson_num || 0) - (b.lesson_num || 0));

  return (
    <Container>
      {isEdit && (
        <>
          <FormLabel>기본 회당 가격</FormLabel>
          <Input
            type="number"
            min="0"
            value={basePrice}
            onChange={(e) => handleBasePriceChange(e.target.value)}
            placeholder="기본 회당 가격을 입력하세요"
          />

          {displayLessons.map((lesson, index) => {
            const discount = lesson.lesson_percent / 100;
            const pricePer = Math.round(basePrice * (1 - discount));
            const total = pricePer * lesson.lesson_num;

            return (
              <EditForm key={`lesson-${index}`}>
                <div className="form-row">
                  <div className="form-group">
                    <FormLabel>레슨 횟수</FormLabel>
                    <FormInput
                      type="number"
                      min="1"
                      value={lesson.lesson_num}
                      onChange={(e) => handleLessonChange(index, 'lesson_num', e.target.value)}
                      placeholder="횟수"
                    />
                  </div>
                  <div className="form-group">
                    <FormLabel>할인률 (%)</FormLabel>
                    <FormInput
                      type="number"
                      min="0"
                      max="100"
                      value={lesson.lesson_percent}
                      onChange={(e) => handleLessonChange(index, 'lesson_percent', e.target.value)}
                      placeholder="할인률"
                    />
                  </div>
                </div>

                {/* 미리보기 */}
                <PriceItem style={{ marginBottom: 0, padding: '16px' }}>
                  {/* 인기 상품 배지 */}
                  {(lesson.lesson_num === 4 || lesson.lesson_num === 8) && (
                    <div className="popular-badge">인기</div>
                  )}

                  <div className="price-main">
                    <div className="lesson-count">
                      {lesson.lesson_num}<span className="count-text">회</span>
                    </div>
                    <div className="per-price">{pricePer.toLocaleString()}원</div>
                  </div>
                  
                  <div className="total-price">
                    {lesson.lesson_percent > 0 && (
                      <div className="discount-section">
                        <span className="discount-info">{lesson.lesson_percent}% 할인</span>
                        <span className="original-price">
                          정가 {(basePrice * lesson.lesson_num).toLocaleString()}원
                        </span>
                      </div>
                    )}
                    <div className="total-amount">총 {total.toLocaleString()}원</div>
                  </div>
                </PriceItem>

                <div className="form-actions">
                  <RemoveButton onClick={() => handleRemoveLesson(index)}>삭제</RemoveButton>
                </div>
              </EditForm>
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

      {!isEdit && displayLessons.length > 0 && displayLessons.map((lesson, index) => {
        const discount = lesson.lesson_percent / 100;
        const pricePer = Math.round(basePrice * (1 - discount));
        const total = pricePer * lesson.lesson_num;

        return (
          <PriceItem key={index}>
            {/* 인기 상품 배지 (4회 또는 8회일 때) */}
            {(lesson.lesson_num === 4 || lesson.lesson_num === 8) && (
              <div className="popular-badge">인기</div>
            )}

            <div className="price-main">
              <div className="lesson-count">
                {lesson.lesson_num}<span className="count-text">회</span>
              </div>
              <div className="per-price">{pricePer.toLocaleString()}원</div>
            </div>
            
            <div className="total-price">
              {lesson.lesson_percent > 0 && (
                <div className="discount-section">
                  <span className="discount-info">{lesson.lesson_percent}% 할인</span>
                  <span className="original-price">
                    정가 {(basePrice * lesson.lesson_num).toLocaleString()}원
                  </span>
                </div>
              )}
              <div className="total-amount">총 {total.toLocaleString()}원</div>
            </div>
          </PriceItem>
        );
      })}

      {!isEdit && displayLessons.length === 0 && (
        <p style={{ color: 'var(--text-tertiary)', fontSize: '1.5rem', textAlign: 'center', padding: '20px' }}>가격표가 등록되지 않았습니다.</p>
      )}
    </Container>
  );
};

export default TrainerPriceList;
