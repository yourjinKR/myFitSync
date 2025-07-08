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

// 스타일 컴포넌트 분리
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
  display: flex;
  flex-direction: column;
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

const WeekdaysRow = styled.div`
  display: grid;
  grid-template-columns: 4rem repeat(7, 1fr);
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
  flex-grow: 1;
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
    &:disabled {
      background: var(--border-light);
      cursor: not-allowed;
    }
  }
`;

const ScheduleDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin: 0 2px;
  background-color: ${({ color }) => color || 'gray'};
`;

const DotWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 4px;
  min-height: 12px;
  flex-wrap: wrap;
`;

const Legend = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
  gap: 8px;
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-left: 1.5rem;

  div {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }
`;

const LegendContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const DateCircle = styled.div`
  min-width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: var(--primary-blue);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: bold;
`;

const ScheduleLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-bottom: 0.6rem;
`;

const ScheduleContent = styled.div`
  flex: 1;
  cursor: ${({ isDeleteMode }) => (isDeleteMode ? 'default' : 'pointer')};
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

  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedDeleteIds, setSelectedDeleteIds] = useState([]);

  // 스케줄 API 불러오기 (전체)
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

  // 주간 스케줄 필터링
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

  // 초기 데이터 로딩
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

  // 일정 추가
  const handleInsertSchedule = async (key, schedule_name, schedule_stime, schedule_etime, schedule_content, user_idx = null) => {
    try {
      await axios.post(`/trainer/${trainerIdx}/schedule`, { 
        user_name : schedule_name,
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

  // 삭제 모드 토글
  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
    setSelectedDeleteIds([]);
  };

  // 체크박스 상태 변경
  const handleCheckboxChange = (schedule_idx) => {
    setSelectedDeleteIds((prev) => {
      if (prev.includes(schedule_idx)) {
        return prev.filter(id => id !== schedule_idx);
      } else {
        return [...prev, schedule_idx];
      }
    });
  };

  const handleDeleteSelectedSchedules = () => {
    if (selectedDeleteIds.length === 0) return;

    if (window.confirm('선택한 일정을 삭제하시겠습니까?')) {
      // 삭제 실행
      executeDelete();
    }
  };

  const executeDelete = async () => {
    try {
      await Promise.all(selectedDeleteIds.map(id =>
        axios.delete(`/trainer/${trainerIdx}/schedule/${id}`)
      ));
      fetchSchedules();
      setSelectedDeleteIds([]);
      setIsDeleteMode(false);
    } catch (error) {
      console.error('일정 삭제 실패:', error);
    }
  };
  
  // 날짜 클릭
  const handleDayClick = (dateStr) => {
    setSelectedDate(dateStr);
    setShowPanel(true);
    if (isDeleteMode) {
      setSelectedDeleteIds([]); // 삭제 모드에서는 클릭시 선택 초기화
    }
  };

  // 일정 추가 모달 열기
  const handleAddSchedule = () =>{
    console.log('추가 버튼 클릭, selectedDate:', selectedDate);
    setShowInsertModal(true);
  } 

  // 회원 클릭 (운동 추가 모달 열기)
  const handleMemberClick = (schedule) => {
    setSelectedSchedule(schedule);
    setShowWorkoutInsert(true);
  };

  // 운동 추가 모달 닫기
  const closeWorkoutModal = () => setShowWorkoutInsert(false);

  // 스케줄 색상 분류: 'green' (운동기록), 'red' (스케줄), 'yellow' (user_name 스케줄)
  const getScheduleColorsByDate = (dateStr) => {
    const schedules = monthSchedules[dateStr];
    if (!schedules || schedules.length === 0) return [];

    const colors = new Set();
    for (const s of schedules) {
      if (s.category === 'my_workout') colors.add('green');
      else if (s.category === 'schedule') colors.add('red');
      else if (s.user_name && !s.user_idx) colors.add('yellow');
    }
    return Array.from(colors);
  };

  // 주간 일정 시간 및 요일 설정
  const hours = Array.from({ length: 19 }, (_, i) => `${(6 + i).toString().padStart(2, '0')}:00`);
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // 월별 달력 날짜 계산
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const firstDayOffset = getDay(startOfMonth(currentMonth));
  const dates = [
    ...Array.from({ length: firstDayOffset }, () => null),
    ...Array.from({ length: lastDate }, (_, i) => i + 1),
  ];
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
          <button className={view === 'week' ? 'active' : ''} onClick={() => setView('week')}>주간 보기</button>
          <button className={view === 'month' ? 'active' : ''} onClick={() => setView('month')}>월간 보기</button>
        </Toggle>
      </TopBar>

      {view === 'week' ? (
        <>
          <ScheduleBox>
            <WeekdaysRow>
              <div></div>
              {days.map((day, idx) => (
                <div key={idx}>
                  {day}
                  <br />
                  <small>{format(new Date(weekDates[idx]), 'MM/dd')}</small>
                </div>
              ))}
            </WeekdaysRow>
            <div style={{ display: 'grid', gridTemplateColumns: '4rem repeat(7, 1fr)' }}>
              {hours.map((hour, idx) => (
                <React.Fragment key={idx}>
                  <div
                    style={{
                      fontSize: '1.2rem',
                      textAlign: 'right',
                      paddingRight: '8px',
                      color: 'var(--text-tertiary)',
                      lineHeight: '3rem',
                    }}
                  >
                    {hour}
                  </div>
                  {days.map((_, dayIdx) => {
                    const key = `${dayIdx}-${hour}`;
                    const schedule = weekSchedules[key];
                    return (
                      <div
                        key={dayIdx}
                        style={{
                          borderLeft: '1px solid var(--border-light)',
                          height: '3rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxSizing: 'border-box',
                        }}
                      >
                        {schedule && (
                          <div
                            style={{
                              backgroundColor: 'var(--primary-blue)',
                              color: 'var(--text-primary)',
                              fontSize: '1.2rem',
                              borderRadius: '0.6rem',
                              width: '100%',
                              height: '90%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '0 0.3rem',
                              marginTop: '3rem',
                              boxSizing: 'border-box',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              cursor: 'pointer',
                              border: '1px solid var(--primary-blue-dark)',
                            }}
                            onClick={() => handleMemberClick(schedule)}
                          >
                            {schedule.user_idx
                              ? memberMap[schedule.user_idx]
                              : schedule.user_name || schedule.schedule_content}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </ScheduleBox>

          <ButtonGroup style={{ justifyContent: 'flex-end' }}>
            <button onClick={handleAddSchedule}>일정 추가</button>
          </ButtonGroup>
        </>
      ) : (
        <>
          <ScheduleBox style={{ flexDirection: 'column', minWidth: '350px' }}>
            <div style={{ flex: 1, minWidth: '350px' }}>
              <CalendarHeader>
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>{'<'}</button>
                {format(currentMonth, 'MMMM yyyy')}
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>{'>'}</button>
              </CalendarHeader>

              <WeekdaysRow>
                {days.map((day, idx) => (
                  <div key={idx}>{day}</div>
                ))}
              </WeekdaysRow>

              <CustomCalendar>
              {dates.map((day, index) => {
                const dateStr =
                  day != null
                    ? `${year}-${(month + 1).toString().padStart(2, '0')}-${day
                        .toString()
                        .padStart(2, '0')}`
                    : null;
                const isSelected = dateStr && selectedDate === dateStr;
                const dayOfWeek = index % 7;
                const scheduleColors = dateStr ? getScheduleColorsByDate(dateStr) : [];

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
                      {[...new Set(scheduleColors)].map(color => (
                        <ScheduleDot
                          key={color}
                          color={
                            color === 'green'
                              ? '#4CAF50'
                              : color === 'red'
                              ? '#F44336'
                              : color === 'yellow'
                              ? '#FFEB3B'
                              : 'gray'
                          }
                        />
                      ))}
                    </DotWrapper>
                  </DayCellBox>
                );
              })}
            </CustomCalendar>
            </div>

            <LegendContainer>
              <Legend>
                <div>
                  <ScheduleDot color="#F44336" /> 스케줄
                </div>
                <div>
                  <ScheduleDot color="#4CAF50" /> 운동기록
                </div>
                <div>
                  <ScheduleDot color="#FFEB3B" /> 외부 스케줄
                </div>
              </Legend>
            </LegendContainer>
          </ScheduleBox>

          {isDeleteMode && (
            <ButtonGroup style={{ justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button onClick={handleDeleteSelectedSchedules} disabled={selectedDeleteIds.length === 0}>
                선택 삭제
              </button>
              <button onClick={toggleDeleteMode}>삭제 취소</button>
            </ButtonGroup>
          )}

          {showPanel && (
            <SlidePanel initial={{ y: 50 }} animate={{ y: 0 }} exit={{ y: 50 }}>
              <SlidePanelHeader>
                <h3>{selectedDate} 일정</h3>
                <ButtonGroup>
                  {!isDeleteMode && <button onClick={handleAddSchedule}>일정 추가</button>}
                  {!isDeleteMode && <button onClick={toggleDeleteMode}>일정 삭제</button>}
                </ButtonGroup>
              </SlidePanelHeader>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <DateCircle>{selectedDate.split('-')[2]}</DateCircle>
                <div style={{ flex: 1 }}>
                  {monthSchedules[selectedDate] && monthSchedules[selectedDate].length > 0 ? (
                    monthSchedules[selectedDate]
                      .slice()
                      .sort((a, b) => a.schedule_stime.localeCompare(b.schedule_stime))
                      .map(schedule => (
                        <ScheduleLabel key={schedule.schedule_idx}>
                          {isDeleteMode && (
                            <input
                              type="checkbox"
                              checked={selectedDeleteIds.includes(schedule.schedule_idx)}
                              onChange={() => handleCheckboxChange(schedule.schedule_idx)}
                              style={{ marginRight: '8px' }}
                            />
                          )}
                          <ScheduleContent
                            isDeleteMode={isDeleteMode}
                            onClick={() => !isDeleteMode && handleMemberClick(schedule)}
                            title={!isDeleteMode ? '운동 추가' : ''}
                          >
                            {schedule.user_idx
                              ? memberMap[schedule.user_idx]
                              : schedule.user_name || '일정 없음'}{' '}
                            - {schedule.schedule_stime} ~ {schedule.schedule_etime}
                            <br />
                            {schedule.schedule_content}
                          </ScheduleContent>
                        </ScheduleLabel>
                      ))
                  ) : (
                    <div>일정이 없습니다.</div>
                  )}
                </div>
              </div>

              {isDeleteMode && (
                <ButtonGroup style={{ justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button onClick={handleDeleteSelectedSchedules} disabled={selectedDeleteIds.length === 0}>
                    선택 삭제
                  </button>
                  <button onClick={toggleDeleteMode}>삭제 취소</button>
                </ButtonGroup>
              )}
            </SlidePanel>
          )}
        </>
      )}
          {showInsertModal && (
            <ScheduleInsertModal
              onClose={() => setShowInsertModal(false)}
              onInsert={handleInsertSchedule}
              members={members}
              selectedDate={selectedDate}
              trainerIdx={trainerIdx}
            />
          )}

          {showWorkoutInsert && selectedSchedule && (
            <WorkoutInsert
              onClose={closeWorkoutModal}
              memberName={selectedSchedule.user_name || memberMap[selectedSchedule.user_idx]}
              memberIdx={selectedSchedule.user_idx}
              trainerIdx={trainerIdx}
              date={format(new Date(selectedSchedule.schedule_date), 'yyyy-MM-dd')}
              stime={selectedSchedule.schedule_stime}
              etime={selectedSchedule.schedule_etime}
              memo={selectedSchedule.schedule_content}
            />
          )}
    </Wrapper>
  );
};

export default TrainerCalendarView;
