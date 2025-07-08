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

const ScheduleDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin: 1px;
`;

const DotWrapper = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 4px;
  min-height: 10px;
`;

const Legend = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin-top: 1rem;

  div {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .green { background: #4CAF50; }
  .red { background: #F44336; }
  .yellow { background: #FFC107; }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }
`;

const TrainerCalendarView = () => {
  const { trainerIdx } = useParams();

  const [view, setView] = useState('month');
  const [selectedDate, setSelectedDate] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [showInsertModal, setShowInsertModal] = useState(false);
  const [showWorkoutInsert, setShowWorkoutInsert] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const [members, setMembers] = useState([]);
  const [memberMap, setMemberMap] = useState({});

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    const start = subDays(now, getDay(now));
    return start;
  });

  const [monthSchedules, setMonthSchedules] = useState({});
  const [weekSchedules, setWeekSchedules] = useState({});

  // 월별 일정 가져오기
  const fetchSchedules = () => {
    axios.get(`/trainer/${trainerIdx}/schedule`).then((res) => {
      const raw = res.data;
      const monthMap = {};

      raw.forEach((schedule) => {
        const dateKey = format(new Date(schedule.schedule_date), 'yyyy-MM-dd');
        if (!monthMap[dateKey]) monthMap[dateKey] = [];
        monthMap[dateKey].push(schedule);
      });

      setMonthSchedules(monthMap);
    }).catch((err) => {
      console.error('스케줄 불러오기 실패', err);
    });
  };

  // 주간 일정 필터링
  useEffect(() => {
    if (!currentWeekStart || !monthSchedules) return;

    const newWeekSchedules = {};
    const start = currentWeekStart;
    const end = addDays(currentWeekStart, 6);

    Object.entries(monthSchedules).forEach(([dateStr, schedules]) => {
      const date = new Date(dateStr);
      if (date >= start && date <= end) {
        schedules.forEach(schedule => {
          const dayIndex = getDay(date);
          const key = `${dayIndex}-${schedule.schedule_stime}`;
          newWeekSchedules[key] = schedule;
        });
      }
    });

    setWeekSchedules(newWeekSchedules);
  }, [currentWeekStart, monthSchedules]);

  // 초기 설정
  useEffect(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    setSelectedDate(todayStr);
    setShowPanel(true);

    if (trainerIdx) {
      fetchSchedules();

      axios.get(`/trainer/${trainerIdx}/members`).then((res) => {
        setMembers(res.data);
        const map = {};
        res.data.forEach((m) => { map[m.member_idx] = m.member_name });
        setMemberMap(map);
      }).catch((err) => {
        console.error('회원 리스트 불러오기 실패', err);
      });
    }
  }, [trainerIdx]);

  const handleInsertSchedule = async (key, schedule_name, schedule_stime, schedule_etime, schedule_content, user_idx = null) => {
    try {
      await axios.post(`/trainer/${trainerIdx}/schedule`, {
        schedule_name,
        schedule_stime,
        schedule_etime,
        schedule_content,
        user_idx,
        schedule_date: selectedDate,
      });
      fetchSchedules();
      setShowInsertModal(false);
    } catch (error) {
      console.error('일정 추가 실패:', error);
    }
  };

  const handleDeleteSchedule = () => {
    setMonthSchedules((prev) => {
      const prevArr = prev[selectedDate] || [];
      if (prevArr.length === 0) return prev;
      const newArr = prevArr.slice(0, -1);
      return { ...prev, [selectedDate]: newArr };
    });
  };

  const handleDayClick = (dateStr) => {
    setSelectedDate(dateStr);
    setShowPanel(true);
  };

  const handleAddSchedule = () => setShowInsertModal(true);

  const handleMemberClick = (schedule) => {
    setSelectedSchedule(schedule);
    setShowWorkoutInsert(true);
  };

  const closeWorkoutModal = () => setShowWorkoutInsert(false);

  const hours = Array.from({ length: 19 }, (_, i) => `${(6 + i).toString().padStart(2, '0')}:00`);
  const days = ['Su', 'Mo', 'Tu', 'Wd', 'Th', 'Fr', 'Sa'];

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const firstDayOffset = getDay(startOfMonth(currentMonth));
  const dates = [...Array.from({ length: firstDayOffset }, () => null), ...Array.from({ length: lastDate }, (_, i) => i + 1)];
  const weekDates = Array.from({ length: 7 }, (_, i) => format(addDays(currentWeekStart, i), 'yyyy-MM-dd'));

  return (
    <Wrapper>
      <TopBar>
        {view === 'week' ? (
          <MonthTitle>
            <button onClick={() => setCurrentWeekStart(subDays(currentWeekStart, 7))}>{'<'}</button>
            {format(currentWeekStart, 'MMMM yyyy')}
            <button onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}>{'>'}</button>
          </MonthTitle>
        ) : (
          <MonthTitle>
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>{'<'}</button>
            {format(currentMonth, 'MMMM yyyy')}
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>{'>'}</button>
          </MonthTitle>
        )}

        <Toggle>
          <button className={`toggle-btn ${view === 'week' ? 'active' : ''}`} onClick={() => setView('week')}>주간 보기</button>
          <button className={`toggle-btn ${view === 'month' ? 'active' : ''}`} onClick={() => setView('month')}>월간 보기</button>
        </Toggle>
      </TopBar>

      {view === 'week' ? (
        <>
          <ScheduleBox>
            <HeaderRow>
              <div></div>
              {days.map((day, idx) => (
                <div key={idx}>{day} <br /><small>{format(new Date(weekDates[idx]), 'MM/dd')}</small></div>
              ))}
            </HeaderRow>
            <WeekGrid>
              {hours.map((hour, idx) => (
                <React.Fragment key={idx}>
                  <TimeLabel>{hour}</TimeLabel>
                  {days.map((_, dayIdx) => {
                    const key = `${dayIdx}-${hour}`;
                    const schedule = weekSchedules[key];
                    return (
                      <DayCell key={dayIdx}>
                        {schedule && (
                          <ScheduleItem onClick={() => handleMemberClick(schedule)}>
                            {schedule.user_idx ? memberMap[schedule.user_idx] : schedule.user_name || schedule.schedule_content}
                          </ScheduleItem>
                        )}
                      </DayCell>
                    );
                  })}
                </React.Fragment>
              ))}
            </WeekGrid>
          </ScheduleBox>

          <ButtonGroup>
            <button onClick={handleAddSchedule}>일정 추가</button>
          </ButtonGroup>
        </>
      ) : (
        <>
          <ScheduleBox>
            <CalendarContainer>
              <CalendarHeader>
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>{'<'}</button>
                {format(currentMonth, 'MMMM yyyy')}
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>{'>'}</button>
              </CalendarHeader>

              <WeekdaysRow>{days.map((day, idx) => <div key={idx}>{day}</div>)}</WeekdaysRow>

              <CustomCalendar>
                {dates.map((day, index) => {
                  const dateStr = day != null ? `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}` : null;
                  const isSelected = dateStr && selectedDate === dateStr;
                  const dayOfWeek = index % 7;
                  const schedules = dateStr ? monthSchedules[dateStr] || [] : [];

                  // 카테고리별 존재 여부 확인
                  const hasGreen = schedules.some(s => s.user_idx);
                  const hasRed = schedules.some(s => !s.user_idx && !s.user_name);
                  const hasYellow = schedules.some(s => !s.user_idx && s.user_name);

                  return (
                    <DayCellBox
                      key={index}
                      isSelected={isSelected}
                      isSunday={dayOfWeek === 0}
                      isSaturday={dayOfWeek === 6}
                      isClickable={!!dateStr}
                      onClick={() => dateStr && handleDayClick(dateStr)}
                    >
                      {day || ''}
                      <DotWrapper>
                        {hasGreen && <ScheduleDot style={{ background: '#4CAF50' }} />}
                        {hasRed && <ScheduleDot style={{ background: '#F44336' }} />}
                        {hasYellow && <ScheduleDot style={{ background: '#FFC107' }} />}
                      </DotWrapper>
                    </DayCellBox>
                  );
                })}
              </CustomCalendar>
            </CalendarContainer>

            <Legend style={{ justifyContent: 'flex-end', paddingRight: '1rem' }}>
              <div><span className="dot green" /> 내 운동기록</div>
              <div><span className="dot red" /> 스케줄</div>
              <div><span className="dot yellow" /> 외부 스케줄</div>
            </Legend>

          </ScheduleBox>
        </>
      )}

      {view === 'month' && showPanel && (
        <SlidePanel initial={{ y: 50 }} animate={{ y: 0 }} exit={{ y: 50 }}>
          <SlidePanelHeader>
            <h3>{selectedDate} 일정</h3>
            <ButtonGroup>
              <button onClick={handleAddSchedule}>일정 추가</button>
              <button onClick={handleDeleteSchedule}>일정 삭제</button>
            </ButtonGroup>
          </SlidePanelHeader>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ minWidth: '3rem', height: '3rem', borderRadius: '50%', background: 'var(--primary-blue)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 'bold' }}>
              {selectedDate.split('-')[2]}
            </div>
            <div>
              {monthSchedules[selectedDate] && monthSchedules[selectedDate].length > 0 ? (
                monthSchedules[selectedDate]
                  .slice()
                  .sort((a, b) => a.schedule_stime.localeCompare(b.schedule_stime)) // 오름차순 정렬
                  .map((schedule) => (
                    <div key={schedule.schedule_idx} style={{ marginBottom: '0.6rem' }}>
                      {schedule.user_idx ? memberMap[schedule.user_idx] : schedule.user_name || '일정 없음'} - {schedule.schedule_stime} ~ {schedule.schedule_etime} <br />
                      {schedule.schedule_content}
                    </div>
                  ))
              ) : (
                <div>일정이 없습니다.</div>
              )}
            </div>
          </div>
        </SlidePanel>
      )}

      {showInsertModal && (
        <ScheduleInsertModal
          onClose={() => setShowInsertModal(false)}
          onInsert={handleInsertSchedule}
          members={members}
          selectedDate={selectedDate}
        />
      )}

      {showWorkoutInsert && selectedSchedule && (
        <WorkoutInsert
          onClose={closeWorkoutModal}
          memberName={selectedSchedule.user_name || memberMap[selectedSchedule.user_idx]}
          memberIdx={selectedSchedule.user_idx}
          trainerIdx={trainerIdx}
          date={format(new Date(selectedSchedule.schedule_date), 'yyyy-MM-dd')}
          time={selectedSchedule.schedule_stime}
          memo={selectedSchedule.schedule_content}
        />
      )}
    </Wrapper>
  );
};

export default TrainerCalendarView;
