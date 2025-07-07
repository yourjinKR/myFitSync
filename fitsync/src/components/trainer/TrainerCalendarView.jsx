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
import WorkoutInsert from './WorkoutInsert';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const Wrapper = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  font-size: 1.4rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  min-height: 80vh;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-secondary);
  border-radius: 1rem;
  padding: 1rem 2rem;
`;

const MonthTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.8rem;
  font-weight: 700;

  button {
    background: none;
    border: none;
    font-size: 1.8rem;
    cursor: pointer;
    padding: 0.4rem;
    color: var(--primary-blue);
    transition: color 0.2s;
    &:hover {
      color: var(--primary-blue-hover);
    }
  }
`;

const Toggle = styled.div`
  display: flex;
  gap: 0.6rem;
  justify-content: flex-end;

  button {
    padding: 0.4rem 0.8rem;
    border: none;
    border-radius: 1.2rem;
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 1.2rem;
    transition: background 0.2s, color 0.2s;
  }

  button.active {
    background: var(--primary-blue);
    color: var(--text-primary);
  }
`;

const ScheduleBox = styled.div`
  background: var(--bg-secondary);
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 0.1rem 0.8rem rgba(0,0,0,0.10);
  font-size: 1.2rem;
  border: 1px solid var(--border-light);
`;

const HeaderRow = styled.div`
  display: grid;
  grid-template-columns: 4rem repeat(7, 1fr);
  background: var(--bg-tertiary);
  font-weight: bold;

  div {
    text-align: center;
    font-size: 1.2rem;
    padding: 1rem 0;
    line-height: 1.2;
    color: var(--primary-blue-light);
  }
`;

const WeekGrid = styled.div`
  display: grid;
  grid-template-columns: 4rem repeat(7, 1fr);
`;

const TimeLabel = styled.div`
  font-size: 1.2rem;
  text-align: right;
  height: 3rem;
  line-height: 3rem;
  box-sizing: border-box;
  color: var(--text-tertiary);
`;

const DayCell = styled.div`
  border-left: 1px solid var(--border-light);
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-sizing: border-box;
`;

const ScheduleItem = styled.div`
  background-color: var(--primary-blue);
  color: var(--text-primary);
  font-size: 1.2rem;
  border-radius: 0.6rem;
  width: 100%;
  height: 90%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.3rem;
  margin-top: 3rem;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  border: 1px solid var(--primary-blue-dark);
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  font-size: 1.6rem;
  font-weight: bold;
  padding-top: 1.5rem;

  button {
    background: none;
    border: none;
    font-size: 1.6rem;
    cursor: pointer;
    padding: 0.3rem;
    color: var(--primary-blue);
    transition: color 0.2s;
    &:hover {
      color: var(--primary-blue-hover);
    }
  }
`;

const CalendarContainer = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 1rem;
  overflow: hidden;
  background: var(--bg-secondary);
`;

const WeekdaysRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  font-weight: bold;
  background: var(--bg-tertiary);
  padding: 0.8rem 0;
  text-align: center;
  font-size: 1.2rem;
  color: var(--primary-blue-light);
`;

const CustomCalendar = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  background: var(--bg-secondary);
  font-size: 1.2rem;
`;

const DayCellBox = styled.div`
  background: ${({ isSelected }) => (isSelected ? 'var(--primary-blue)' : 'transparent')};
  color: ${({ isSunday, isSaturday, isSelected }) =>
    isSelected
      ? 'var(--text-primary)'
      : isSunday
      ? '#F44336'
      : isSaturday
      ? '#4A90E2'
      : 'var(--text-primary)'};
  padding: 0.8rem 0.2rem;
  border: 1px solid var(--border-light);
  border-top: none;
  border-left: none;
  cursor: ${({ isClickable }) => (isClickable ? 'pointer' : 'default')};
  font-size: 1.2rem;
  position: relative;
  transition: background 0.2s;

  &:hover {
    background: ${({ isSelected }) => (isSelected ? 'var(--primary-blue)' : 'var(--bg-tertiary)')};
  }
`;
const SlidePanel = styled(motion.div)`
  margin-top: 1rem;
  background: var(--bg-secondary);
  border-radius: 1rem;
  box-shadow: 0 0.1rem 0.5rem rgba(0, 0, 0, 0.1);
  z-index: 10;
  padding: 1rem;
  color: var(--text-primary);
  border: 1px solid var(--border-light);
`;

const SlidePanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-light);
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.6rem;
  
  button {
    background: var(--primary-blue);
    color: var(--text-primary);
    border-radius: 0.8rem;
    padding: 0.4rem 1.2rem;
    border: none;
    font-size: 1.2rem;
    transition: background 0.2s;
    &:hover {
      background: var(--primary-blue-hover);
    }
  }
`;

const ScheduleIndicator = styled.div`
  width: 60%;
  height: 4px;
  background: var(--primary-blue);
  border-radius: 2px;
  margin: 2px auto 0;
`;

const TrainerCalendarView = () => {
  const { trainerIdx } = useParams(); // ✅ 라우터 param 가져오기

  const [view, setView] = useState('month');
  const [selectedDate, setSelectedDate] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [showInsertModal, setShowInsertModal] = useState(false);
  const [showWorkoutInsert, setShowWorkoutInsert] = useState(false);
  const [selectedMember, setSelectedMember] = useState('');

  const [members, setMembers] = useState([]); // 회원 리스트 상태 추가

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    return subDays(today, getDay(today));
  });

  const [monthSchedules, setMonthSchedules] = useState({});
  const [weekSchedules, setWeekSchedules] = useState({});

  // ✅ 데이터 불러오기 - 스케줄 + 회원 리스트
  useEffect(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    setSelectedDate(todayStr);
    setShowPanel(true);

    if (trainerIdx) {
      // 스케줄 데이터 가져오기
      axios.get(`/trainer/${trainerIdx}/schedule`)
        .then(res => {
          const raw = res.data;

          const monthMap = {};
          const weekMap = {};

          raw.forEach(schedule => {
            const { schedule_date, schedule_stime, schedule_content } = schedule;
            const nameTime = `${schedule_content} ${schedule_stime}`;
            const dateKey = schedule_date;

            // 월간용
            if (!monthMap[dateKey]) monthMap[dateKey] = [];
            monthMap[dateKey].push(nameTime);

            // 주간용
            const date = new Date(schedule_date);
            const dayIndex = getDay(date);
            const time = schedule_stime;
            const weekKey = `${dayIndex}-${time}`;
            weekMap[weekKey] = schedule_content;
          });

          setMonthSchedules(monthMap);
          setWeekSchedules(weekMap);
        })
        .catch(err => console.error('스케줄 불러오기 실패', err));

      // 회원 리스트 가져오기
      axios.get(`/trainer/${trainerIdx}/members`)
        .then(res => {
          setMembers(res.data);
        })
        .catch(err => {
          console.error('회원 리스트 불러오기 실패', err);
        });
    }
  }, [trainerIdx]);

  const handleDayClick = (dateStr) => {
    setSelectedDate(dateStr);
    setShowPanel(true);
  };

  const handleAddSchedule = () => setShowInsertModal(true);
  const closeInsertModal = () => setShowInsertModal(false);
  const closeWorkoutModal = () => setShowWorkoutInsert(false);

  const handleDeleteSchedule = () => {
    setMonthSchedules((prev) => {
      const prevArr = prev[selectedDate] || [];
      if (prevArr.length === 0) return prev;
      const newArr = prevArr.slice(0, prevArr.length - 1);
      return {
        ...prev,
        [selectedDate]: newArr,
      };
    });
  };

  // handleInsertSchedule에 params 순서 변경
  const handleInsertSchedule = (key, memberName, startTime, endTime) => {
    setWeekSchedules((prev) => ({
      ...prev,
      [key]: memberName,
    }));
    closeInsertModal();
  };

  const handleMemberClick = (memberName) => {
    setSelectedMember(memberName);
    setShowWorkoutInsert(true);
  };

  const hours = Array.from({ length: 19 }, (_, i) => `${(6 + i).toString().padStart(2, '0')}:00`);
  const days = ['Su', 'Mo', 'Tu', 'Wd', 'Th', 'Fr', 'Sa'];

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const firstDayOffset = getDay(startOfMonth(currentMonth));
  const dates = [
    ...Array.from({ length: firstDayOffset }, () => null),
    ...Array.from({ length: lastDate }, (_, i) => i + 1),
  ];
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  return (
    <Wrapper>
      <TopBar>
        {view === 'week' ? (
          <MonthTitle>
            <button onClick={() => setCurrentWeekStart(subDays(currentWeekStart, 7))}>{'<'}</button>
            {format(currentWeekStart, 'MMMM')}
            <button onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}>{'>'}</button>
          </MonthTitle>
        ) : <div />}

        <Toggle>
          <button className={`toggle-btn ${view === 'week' ? 'active' : ''}`} onClick={() => setView('week')}>주간 보기</button>
          <button className={`toggle-btn ${view === 'month' ? 'active' : ''}`} onClick={() => setView('month')}>월간 보기</button>
        </Toggle>
      </TopBar>

      {view === 'week' ? (
        <ScheduleBox>
          <HeaderRow>
            <div></div>
            {days.map((day, idx) => (
              <div key={idx}>{day} <br /><small>{format(weekDates[idx], 'MM/dd')}</small></div>
            ))}
          </HeaderRow>
          <WeekGrid>
            {hours.map((hour, idx) => (
              <React.Fragment key={idx}>
                <TimeLabel>{hour}</TimeLabel>
                {days.map((_, dayIdx) => {
                  const key = `${dayIdx}-${hour}`;
                  const member = weekSchedules[key];
                  return (
                    <DayCell key={dayIdx}>
                      {member && (
                        <ScheduleItem onClick={() => handleMemberClick(member)}>{member}</ScheduleItem>
                      )}
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
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>←</button>
              {format(currentMonth, 'MMMM yyyy')}
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>→</button>
            </CalendarHeader>
            <CalendarContainer>
              <WeekdaysRow>{days.map((day, idx) => <div key={idx}>{day}</div>)}</WeekdaysRow>
              <CustomCalendar>
                {dates.map((day, index) => {
                  const dateStr =
                    day != null ? `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}` : null;
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
                      onClick={() => dateStr && handleDayClick(dateStr)}>
                      {day || ''}
                      {dateStr && monthSchedules[dateStr] && monthSchedules[dateStr].length > 0 && (
                        <ScheduleIndicator />
                      )}
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
                  <button onClick={handleAddSchedule}>일정 추가</button>
                  <button onClick={handleDeleteSchedule}>일정 삭제</button>
                </ButtonGroup>
              </SlidePanelHeader>
              <ul>
                {(monthSchedules[selectedDate] || ['일정 없음']).map((item, idx) => (
                  <li key={idx}>
                    <span style={{ cursor: 'pointer', color: '#5b6eff' }}
                      onClick={() => handleMemberClick(item.split(' ')[0])}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <button onClick={() => setShowPanel(false)}>닫기</button>
            </SlidePanel>
          )}

          {showInsertModal && (
          <ScheduleInsertModal
            members={members}
            trainerIdx={trainerIdx}
            selectedDate={selectedDate}
            onClose={closeInsertModal}
            onInsert={handleInsertSchedule}
          />
          )}
        </>
      )}

      {showWorkoutInsert && (
        <WorkoutInsert memberName={selectedMember} onClose={closeWorkoutModal} date={selectedDate} />
      )}
    </Wrapper>
  );
};

export default TrainerCalendarView;
