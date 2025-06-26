import React, { useState, useEffect } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  getDay,
  addDays,
  subDays,
} from 'date-fns';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import ScheduleInsertModal from './ScheduleInsertModal';

const Wrapper = styled.div`
  padding: 3rem;
  display: flex;
  flex-direction: column;
  gap: 3rem;
  font-size: 1.8rem; /* 기존 1.5rem → 1.8rem으로 대폭 상승 */
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MonthTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  font-size: 2.5rem; /* 기존 2rem → 2.5rem */
  font-weight: 700;

  button {
    background: none;
    border: none;
    font-size: 2.5rem; /* 같이 키움 */
    cursor: pointer;
    padding: 0.6rem;

    &:hover {
      color: #666;
    }
  }
`;

const Toggle = styled.div`
  display: flex;
  gap: 1.5rem;

  button {
    padding: 1.2rem 2.5rem;
    border: none;
    border-radius: 1.8rem;
    background: #eee;
    cursor: pointer;
    font-size: 2rem; /* 기존 1.75rem → 2rem */
  }

  button.toggle-btn {
    font-size: 1.1rem !important; /* 기존 1rem → 1.1rem (조금 키움) */
    padding: 0.7rem 1.3rem !important;
  }

  button.toggle-btn.active {
    background: #333;
    color: white;
  }
`;

const ScheduleBox = styled.div`
  background: #fff;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 0.15rem 0.6rem rgba(0, 0, 0, 0.07);
  font-size: 1.5rem; /* 기존 1.25rem → 1.5rem */
`;

const HeaderRow = styled.div`
  display: grid;
  grid-template-columns: 5rem repeat(7, 1fr);
  background: #eee;
  font-weight: bold;

  div {
    text-align: center;
    font-size: 1.8rem; /* 기존 1.5rem → 1.8rem */
    padding: 1.3rem 0;
    line-height: 1.4;
  }
`;

const WeekGrid = styled.div`
  display: grid;
  grid-template-columns: 5rem repeat(7, 1fr);
`;

const TimeLabel = styled.div`
  font-size: 1.5rem; /* 기존 1.25rem → 1.5rem */
  text-align: right;
  height: 4rem; /* 기존 3rem → 4rem */
  line-height: 4rem;
  box-sizing: border-box;
`;

const DayCell = styled.div`
  border-left: 1px solid #ddd;
  height: 4rem; /* 기존 3rem → 4rem */
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-sizing: border-box;
`;

const ScheduleItem = styled.div`
  background-color: #5b6eff;
  color: white;
  font-size: 1.4rem; /* 기존 1.125rem → 1.4rem */
  border-radius: 1rem;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.3rem;
  margin-top: 4rem;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  font-size: 2.5rem; /* 기존 2rem → 2.5rem */
  font-weight: bold;
  padding-top: 2rem;

  button {
    background: none;
    border: none;
    font-size: 2.5rem; /* 기존 2rem → 2.5rem */
    cursor: pointer;
    padding: 0.4rem;

    &:hover {
      color: #666;
    }
  }
`;

const CalendarContainer = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 1rem;
  overflow: hidden;
`;

const WeekdaysRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  font-weight: bold;
  background: #f0f0f0;
  padding: 1rem 0; /* 기존 0.75rem → 1rem */
  text-align: center;
  font-size: 1.5rem; /* 기존 1.25rem → 1.5rem */
`;

const CustomCalendar = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  background: #fff;
  font-size: 1.5rem; /* 기존 1.25rem → 1.5rem */
`;

const DayCellBox = styled.div`
  background: ${({ isSelected }) => (isSelected ? '#5b6eff' : 'transparent')};
  color: ${({ isSunday, isSaturday }) =>
    isSunday ? 'red' : isSaturday ? 'blue' : '#000'};
  padding: 1.3rem 0; /* 기존 1rem → 1.3rem */
  border: 1px solid #eee;
  border-top: none;
  border-left: none;
  cursor: ${({ isClickable }) => (isClickable ? 'pointer' : 'default')};
  font-size: 1.5rem; /* 기존 1.25rem → 1.5rem */

  &:hover {
    background: ${({ isSelected }) => (isSelected ? '#5b6eff' : '#f3f3f3')};
  }
`;

const SlidePanel = styled(motion.div)`
  margin-top: 1.5rem;
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 0.15rem 0.75rem rgba(0, 0, 0, 0.12);
  z-index: 10;
  padding: 1.3rem;
`;

const SlidePanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
`;


const TrainerCalendarView = () => {
  const [view, setView] = useState('week');
  const [selectedDate, setSelectedDate] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [showInsertModal, setShowInsertModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 5, 1));
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    return subDays(today, getDay(today));
  });

  useEffect(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    setSelectedDate(todayStr);
  }, []);

  const [dummyScheduleWeek, setDummyScheduleWeek] = useState({
    '1-06:00': '박회원',
    '1-08:00': '김회원',
    '3-13:00': '이회원',
    '5-15:00': '최회원',
  });

  const [dummyScheduleMonth, setDummyScheduleMonth] = useState({
    '2025-06-20': ['김회원 10:00', '이회원 13:00', '박회원 15:00'],
    '2025-06-21': ['최회원 11:00'],
  });

  const handleDayClick = (dateStr) => {
    setSelectedDate(dateStr);
    setShowPanel(true);
  };

  const handleAddSchedule = () => {
    setShowInsertModal(true);
  };

  const handleDeleteSchedule = () => {
    setDummyScheduleMonth((prev) => {
      const prevArr = prev[selectedDate] || [];
      if (prevArr.length === 0) return prev;
      const newArr = prevArr.slice(0, prevArr.length - 1);
      return {
        ...prev,
        [selectedDate]: newArr,
      };
    });
  };

  const closeInsertModal = () => {
    setShowInsertModal(false);
  };

  const handleInsertSchedule = (dayIdx, time, memberName) => {
    const key = `${dayIdx}-${time}`;
    setDummyScheduleWeek((prev) => ({
      ...prev,
      [key]: memberName,
    }));
    closeInsertModal();
  };

  const hours = Array.from({ length: 19 }, (_, i) =>
    `${(6 + i).toString().padStart(2, '0')}:00`
  );
  const days = ['Su', 'Mo', 'Tu', 'Wd', 'Th', 'Fr', 'Sa'];

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const firstDayOffset = getDay(startOfMonth(currentMonth));
  const dates = [
    ...Array.from({ length: firstDayOffset }, () => null),
    ...Array.from({ length: lastDate }, (_, i) => i + 1),
  ];
  const weekDates = Array.from({ length: 7 }, (_, i) =>
    addDays(currentWeekStart, i)
  );

  return (
    <Wrapper>
      <TopBar>
        {view === 'week' ? (
          <MonthTitle>
            <button
              onClick={() => setCurrentWeekStart(subDays(currentWeekStart, 7))}
              type="button"
            >
              {'<'}
            </button>
            {format(currentWeekStart, 'MMMM')}
            <button
              onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
              type="button"
            >
              {'>'}
            </button>
          </MonthTitle>
        ) : (
          <div />
        )}

        <Toggle>
          <button
            className={`toggle-btn ${view === 'week' ? 'active' : ''}`}
            onClick={() => setView('week')}
            type="button"
          >
            주간 보기
          </button>
          <button
            className={`toggle-btn ${view === 'month' ? 'active' : ''}`}
            onClick={() => setView('month')}
            type="button"
          >
            월간 보기
          </button>
        </Toggle>
      </TopBar>

      {view === 'week' ? (
        <ScheduleBox>
          <HeaderRow>
            <div></div>
            {days.map((day, idx) => (
              <div key={idx}>
                {day} <br />
                <small>{format(weekDates[idx], 'MM/dd')}</small>
              </div>
            ))}
          </HeaderRow>
          <WeekGrid>
            {hours.map((hour, idx) => (
              <React.Fragment key={idx}>
                <TimeLabel>{hour}</TimeLabel>
                {days.map((_, dayIdx) => {
                  const key = `${dayIdx}-${hour}`;
                  const member = dummyScheduleWeek[key];
                  return (
                    <DayCell key={dayIdx}>
                      {member && <ScheduleItem>{member}</ScheduleItem>}
                    </DayCell>
                  );
                })}
              </React.Fragment>
            ))}
          </WeekGrid>
        </ScheduleBox>
      ) : (
        <>
          <ScheduleBox>
            <CalendarHeader>
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                type="button"
              >
                ←
              </button>
              {format(currentMonth, 'MMMM yyyy')}
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                type="button"
              >
                →
              </button>
            </CalendarHeader>

            <CalendarContainer>
              <WeekdaysRow>
                {days.map((day, idx) => (
                  <div key={idx}>{day}</div>
                ))}
              </WeekdaysRow>
              <CustomCalendar>
                {dates.map((day, index) => {
                  const dateStr =
                    day != null
                      ? `${year}-${(month + 1)
                          .toString()
                          .padStart(2, '0')}-${day.toString().padStart(2, '0')}`
                      : null;

                  const isSelected = dateStr && selectedDate === dateStr;
                  const dayOfWeek = index % 7;
                  const isSunday = dayOfWeek === 0;
                  const isSaturday = dayOfWeek === 6;

                  return (
                    <DayCellBox
                      key={index}
                      isSelected={isSelected}
                      isSunday={isSunday}
                      isSaturday={isSaturday}
                      isClickable={!!dateStr}
                      onClick={() => dateStr && handleDayClick(dateStr)}
                    >
                      {day || ''}
                    </DayCellBox>
                  );
                })}
              </CustomCalendar>
            </CalendarContainer>
          </ScheduleBox>

          {showPanel && (
            <SlidePanel initial={{ y: 50 }} animate={{ y: 0 }} exit={{ y: 50 }}>
              <SlidePanelHeader>
                <h3>{selectedDate} 일정</h3>
                <ButtonGroup>
                  <button type="button" onClick={handleAddSchedule}>
                    일정 추가
                  </button>
                  <button type="button" onClick={handleDeleteSchedule}>
                    일정 삭제
                  </button>
                </ButtonGroup>
              </SlidePanelHeader>
              <ul>
                {(dummyScheduleMonth[selectedDate] || ['일정 없음']).map(
                  (item, idx) => (
                    <li key={idx}>{item}</li>
                  )
                )}
              </ul>
              <button type="button" onClick={() => setShowPanel(false)}>
                닫기
              </button>
            </SlidePanel>
          )}

          {showInsertModal && (
            <ScheduleInsertModal
              onClose={closeInsertModal}
              onInsert={handleInsertSchedule}
            />
          )}
        </>
      )}
    </Wrapper>
  );
};

export default TrainerCalendarView;
