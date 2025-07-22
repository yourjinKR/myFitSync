import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import DailyDetailModal from './DailyDetailModal';

const CalendarWrapper = styled.div`
  background: var(--bg-secondary);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 0.1rem 0.8rem rgba(0,0,0,0.08);
  border: 1px solid var(--border-light);

  .react-calendar {
    width: 100%;
    background: transparent;
    border: none;
    font-family: 'Pretendard', sans-serif;
    color: var(--text-primary);
  }

  .react-calendar__navigation {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1.5rem;

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
  }

  .react-calendar__month-view__weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    font-weight: bold;
    background: var(--bg-tertiary);
    padding: 0.8rem 0;
    text-align: center;
    font-size: 1.2rem;
    color: var(--primary-blue-light);
    border-radius: 0.8rem 0.8rem 0 0;
  }

  .react-calendar__tile {
    background: var(--bg-primary);
    border-radius: 0.8rem;
    padding: 0.6rem;
    height: 100px;
    color: var(--text-primary);
    transition: background 0.2s;
    position: relative;
    font-size: 1.2rem;
    border: 1px solid var(--border-light);
    border-top: none;
    border-left: none;

    &:hover {
      background: var(--bg-tertiary);
    }
  }

  .react-calendar__tile--active {
    background: var(--primary-blue-light);
    color: var(--text-primary);
  }

  .dot-container {
    position: absolute;
    bottom: 6px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 4px;
    min-height: 12px;
    flex-wrap: wrap;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .dot.record {
    background-color: #4CAF50; // 운동기록(TrainerCalendarView와 통일)
  }

  .dot.schedule {
    background-color: #F44336; // 스케줄(TrainerCalendarView와 통일)
  }
`;

const MonthlyCalendar = () => {
  const user = useSelector((state) => state.user.user);
  const [value, setValue] = useState(new Date());
  const [recordDates, setRecordDates] = useState([]);
  const [scheduleDates, setScheduleDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!user?.member_idx) return;
    const fetchData = async () => {
      try {
        const [res1, res2] = await Promise.all([
          axios.get(`/user/${user.member_idx}/records/dates`),
          axios.get(`/user/${user.member_idx}/schedules/dates`)
        ]);
        setRecordDates(res1.data); 
        setScheduleDates(res2.data);
        console.log('res1data', res1.data);
        console.log('res2data', res2.data);
        
      } catch (err) {
        console.error('달력 데이터 fetch 실패:', err);
      }
    };
    fetchData();
  }, [user?.member_idx]);

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;

    const ymd = date.toISOString().split('T')[0];
    const hasRecord = recordDates.includes(ymd);
    const hasSchedule = scheduleDates.includes(ymd);

    if (!hasRecord && !hasSchedule) return null;

    return (
      <div className="dot-container">
        {hasRecord && <span className="dot record" />}
        {hasSchedule && <span className="dot schedule" />}
      </div>
    );
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  return (
    <CalendarWrapper>
      <Calendar
        onChange={setValue}
        value={value}
        onClickDay={handleDateClick}
        tileContent={tileContent}
        locale="ko-KR"
        showNeighboringMonth={false} // 이전/다음 달 일자 숨김
        showFixedNumberOfWeeks={false} // 고정 주 수 해제
      />
      {isModalOpen && selectedDate && (
        <DailyDetailModal
          date={selectedDate}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </CalendarWrapper>
  );
};

export default MonthlyCalendar;
