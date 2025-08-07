import React, { useState, useEffect, useCallback } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  getDay,
  addDays,
  subDays,
  endOfWeek,
} from 'date-fns';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import ScheduleInsertModal from './ScheduleInsertModal';
import WorkoutInsert from './WorkoutInsert';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DailyDetailModal from '../user/DailyDetailModal';


// 스타일 컴포넌트 분리
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  font-size: 1.4rem;
  background: transparent;
  color: var(--text-primary);
  min-height: ${autoHeight => autoHeight ? autoHeight : '100vh'};
  max-width: 1200px;
  margin: 0 auto;
`;

const TopBar = styled.div`
  display: flex;
  gap : 15px;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 10px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
`;

const MonthTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  font-size: 2.4rem;
  font-weight: 300;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 1.5rem 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(74, 144, 226, 0.3), transparent);
  }

  .month-label {
    min-width: 15ch;
    text-align: center;
    flex-shrink: 0;
    flex-grow: 1;
    display: inline-block;
    font-weight: 500;
    font-size: 2.2rem;
    color: var(--text-primary);
    letter-spacing: 0.02em;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 50%;
      transform: translateX(-50%);
      width: 60%;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--primary-blue), transparent);
      border-radius: 1px;
    }
  }

  button {
    background: linear-gradient(135deg, rgba(74, 144, 226, 0.12), rgba(74, 144, 226, 0.08));
    border: 1px solid rgba(74, 144, 226, 0.2);
    font-size: 1.4rem;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    color: var(--primary-blue);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    width: 4rem;
    height: 4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 50%;
    backdrop-filter: blur(15px);
    position: relative;
    box-shadow: 
      0 4px 12px rgba(74, 144, 226, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 10px;
      height: 10px;
      border-left: 2px solid var(--primary-blue);
      border-bottom: 2px solid var(--primary-blue);
      transform: translate(-50%, -40%) rotate(45deg);
      border-radius: 0 0 0 1px;
      transition: all 0.3s ease;
    }

    &::after {
      content: '';
    }

    &:last-child::before {
      border-left: none;
      border-bottom: none;
      border-right: 2px solid var(--primary-blue);
      border-top: 2px solid var(--primary-blue);
      transform: translate(-70%, -50%) rotate(45deg);
      border-radius: 0 1px 0 0;
    }

    &:hover {
      background: linear-gradient(135deg, rgba(74, 144, 226, 0.2), rgba(74, 144, 226, 0.15));
      box-shadow: 
        0 8px 25px rgba(74, 144, 226, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
    }

    &:last-child:hover::before {
      transform: translate(-70%, -50%) rotate(45deg) scale(1.1);
    }

    &:active {
      transform: translateY(-1px) scale(1.02);
    }
  }
`;

const Toggle = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.5rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);

  button {
    padding: 1rem 2rem;
    border: none;
    border-radius: 12px;
    background: ${({ active }) => active ? 'var(--primary-blue)' : 'transparent'};
    color: ${({ active }) => active ? 'white' : 'var(--text-secondary)'};
    cursor: pointer;
    font-size: 1.4rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-weight: 500;
    position: relative;
    overflow: hidden;
    word-break : keep-all;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      transition: left 0.5s;
    }

    &:hover {
      background: ${({ active }) => active ? 'var(--primary-blue-light)' : 'rgba(74, 144, 226, 0.1)'};
      color: ${({ active }) => active ? 'white' : 'var(--primary-blue)'};
      transform: translateY(-1px);
      box-shadow: 0 4px 15px rgba(74, 144, 226, 0.2);

      &::before {
        left: 100%;
      }
    }
  }

  button[data-active='true'] {
    background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-light));
    color: white;
    box-shadow: 0 4px 15px rgba(74, 144, 226, 0.4);
  }
`;

const ScheduleBox = styled.div`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 
    0 20px 50px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  font-size: 1.6rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(74, 144, 226, 0.5), transparent);
  }
`;



const WeekdaysRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  font-weight: 500;
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.1), rgba(74, 144, 226, 0.05));
  padding: 2rem 0;
  text-align: center;
  font-size: 1.4rem;
  color: var(--primary-blue);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  letter-spacing: 1px;
  text-transform: uppercase;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--primary-blue), transparent);
  }

  & > div {
    font-size: 1.4rem;
  }
  ${({ weekmode }) => weekmode && `
    & + div > div{
      top: 2.5rem;
    }

    & + div > div:nth-child(n+2):nth-child(-n+8) {
      margin-top: -2.5rem;
      padding-top: 2.5rem;
      box-sizing: content-box;
    }
    & + div > div:nth-child(n+2):nth-child(-n+8) > div{
      top: unset !important;
      bottom: 0 !important; 
    }
  `}
  
`;

const CustomCalendar = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  background: var(--bg-secondary);
  font-size: 1.6rem;
  border-radius: 0;
  overflow: hidden;
  min-width: 420px;
  min-height: 420px;

  @media (max-width: 600px) {
    font-size: 1.4rem;
    min-width: unset;
  }
`;

const DayCellBox = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isSelected', 'isToday', 'isSunday', 'isSaturday', 'isClickable'].includes(prop)
})`
  background: ${({ isSelected, isToday }) =>
    isSelected
      ? 'linear-gradient(135deg, var(--primary-blue), var(--primary-blue-light))'
      : isToday
      ? 'rgba(74, 144, 226, 0.15)'
      : 'transparent'};
  color: ${({ isSelected, isSunday, isSaturday, isToday }) =>
    isSelected
      ? 'white'
      : isToday
      ? 'var(--primary-blue)'
      : isSunday
      ? '#ff6b6b'
      : isSaturday
      ? 'var(--primary-blue-light)'
      : 'var(--text-primary)'};
  padding: 0;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  cursor: ${({ isClickable }) => (isClickable ? 'pointer' : 'default')};
  font-size: 1.5rem;
  font-weight: ${({ isSelected, isToday }) => (isSelected ? '600' : isToday ? '500' : '400')};
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
  backdrop-filter: blur(10px);
  border-radius: 0;
  overflow: hidden;

  /* 마지막 열(일요일)의 오른쪽 테두리 제거 */
  &:nth-child(7n) {
    border-right: none;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ isSelected }) => 
      isSelected 
        ? 'linear-gradient(135deg, var(--primary-blue), var(--primary-blue-light))'
        : 'transparent'
    };
    opacity: ${({ isSelected }) => isSelected ? 1 : 0};
    transition: opacity 0.3s ease;
    z-index: -1;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: -1;
  }

  &:hover {
    background: ${({ isSelected, isToday }) => 
      isSelected 
        ? 'linear-gradient(135deg, var(--primary-blue-light), var(--primary-blue))'
        : isToday 
        ? 'rgba(74, 144, 226, 0.25)' 
        : 'rgba(74, 144, 226, 0.1)'};
    box-shadow: 0 8px 25px rgba(74, 144, 226, 0.2);

    &::after {
      opacity: 1;
    }
  }

  @media (max-width: 600px) {
    font-size: 1.4rem;
  }
`;

const SlidePanel = styled(motion.div)`
  margin-bottom: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 
    0 20px 50px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  z-index: 10;
  padding: 2.5rem;
  color: var(--text-primary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease-in-out;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(74, 144, 226, 0.5), transparent);
  }

  &:hover {
    box-shadow: 
      0 25px 60px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }
`;

const SlidePanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1.5rem;
  margin-bottom: 2.5rem;
  font-size: 2rem;
  font-weight: 600;
  position: relative;

  h3 {
    margin: 0;
    font-size: 2rem;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.02em;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    
    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      width: 60px;
      height: 2px;
      background: linear-gradient(90deg, var(--primary-blue), transparent);
      border-radius: 1px;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: flex-end;

  button {
    padding: 1rem 2rem;
    font-size: 1.4rem;
    font-weight: 600;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 100px;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      transition: left 0.5s;
    }

    &:hover::before {
      left: 100%;
    }

    &.primary {
      color: white;
      background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-light));
      box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);
      }

      &:active {
        transform: translateY(0);
      }

      &:disabled {
        background: rgba(74, 144, 226, 0.3);
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }
    }

    &.secondary {
      color: var(--text-secondary);
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-1px);
        color: var(--text-primary);
      }
    }
  }
`;

const ScheduleDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  gap: 10px;
  background: ${({ color }) => color || '#888'} !important;
  box-shadow: 
    0 0 0 1px rgba(255, 255, 255, 0.3),
    0 2px 6px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  position: relative;
  transition: all 0.2s ease;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 4px;
    height: 4px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    transition: all 0.2s ease;
  }

  &:hover {
    transform: scale(1.2);
    box-shadow: 
      0 0 0 2px rgba(255, 255, 255, 0.4),
      0 4px 12px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.5);
  }

`;

const DotWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 8px;
  height: 12px;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  min-height: 12px;
  position: relative;

  @media (max-width: 600px) {
    margin-top: 6px;
    height: 10px;
    gap: 3px;
    min-height: 10px;
  }
`;

const Legend = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2.5rem;
  font-size: 1.4rem;
  color: var(--text-primary);
  margin: 0;
  font-weight: 500;
  
  div {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    font-weight: 500;
    padding: 0.5rem 1rem;
    border-radius: 12px;
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    transition: all 0.3s ease;
  }

  & > div {
    font-size: 1.6rem;
  }


  @media (max-width: 600px) {
    gap: 1.5rem;
  }
`;

const LegendContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 1.5rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
      background: linear-gradient(135deg, rgba(74, 144, 226, 0.1), rgba(74, 144, 226, 0.05));
  backdrop-filter: blur(10px);
  border-radius: 0 0 10px 10px;
`;

const DateCircle = styled.div`
  min-width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-light));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  font-weight: 700;
  box-shadow: 
    0 4px 12px rgba(74, 144, 226, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.1);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary-blue-light), var(--primary-blue));
    z-index: -1;
  }
`;

const ScheduleLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-bottom: 1.2rem;
  padding: 1.2rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(74, 144, 226, 0.1), transparent);
    transition: left 0.5s;
  }

  &:hover {
    background: rgba(74, 144, 226, 0.1);
    box-shadow: 0 4px 15px rgba(74, 144, 226, 0.2);
    transform: translateY(-2px);
    border-color: rgba(74, 144, 226, 0.2);

    &::before {
      left: 100%;
    }
  }

  input[type='checkbox'] {
    margin-right: 1.2rem;
    transform: scale(1.3);
    accent-color: var(--primary-blue);
    border-radius: 4px;
  }
`;

const ScheduleContent = styled.div`
  cursor: ${({ $isDeleteMode }) => ($isDeleteMode ? 'default' : 'pointer')};
  line-height: 1.6;
  font-size: 1.6rem;
  color: var(--text-primary);
  font-weight: 500;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  .schedule-title {
    font-size: 1.6rem;
    font-weight: 600;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }

  .schedule-time {
    font-size: 1.4rem;
    color: var(--primary-blue);
    font-weight: 500;
    background: rgba(74, 144, 226, 0.1);
    padding: 0.3rem 0.8rem;
    border-radius: 8px;
    display: inline-block;
    width: fit-content;
  }

  .schedule-content {
    font-size: 1.4rem;
    color: var(--text-secondary);
    margin-top: 0.3rem;
    font-weight: 400;
  }
`;

const TrainerCalendarView = ({autoHeight}) => {
  const { trainerIdx } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  const [view, setView] = useState('month');
  const [selectedDate, setSelectedDate] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [showInsertModal, setShowInsertModal] = useState(false);
  const [showWorkoutInsert, setShowWorkoutInsert] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [recordDates, setRecordDates] = useState([]);
  const [scheduleDates, setScheduleDates] = useState([]);
  const [members, setMembers] = useState([]);
  const [memberMap, setMemberMap] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    return subDays(now, getDay(now));
  });
  const [monthSchedules, setMonthSchedules] = useState({});
  const [weekSchedules, setWeekSchedules] = useState({});
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedDeleteIds, setSelectedDeleteIds] = useState([]);
  const [selectedStime, setSelectedStime] = useState('06:00');
  const [selectedEtime, setSelectedEtime] = useState('');
  const [showModal, setShowModal] = useState(false);
  

  const isTrainer = user?.member_type === 'trainer';
  const isUser = user?.member_type === 'user';
  
useEffect(() => {
  // 사용자 정보가 완전히 로드될 때까지 대기
  if (!user || Object.keys(user).length === 0) {
    return;
  }
  
  if (!user?.isLogin) {
    alert('로그인이 필요합니다.');
    navigate('/');
    return;
  }

  if (user.member_type !== 'trainer' && user.member_type !== 'user') {
    alert('권한이 없습니다.');
    navigate('/');
    return;
  }

  // trainer라면 trainerIdx 체크 (보안 강화)
  // trainerIdx가 없거나 undefined인 경우는 체크하지 않음 (아직 URL 파라미터가 로드되지 않은 상태)
  if (user.member_type === 'trainer' && trainerIdx) {
    const userTrainerIdx = user.member_idx; // 실제로는 member_idx에 트레이너 ID가 저장됨
    const urlTrainerIdx = parseInt(trainerIdx, 10);
    
    // ID가 일치하지 않으면 접근 차단
    if (userTrainerIdx !== urlTrainerIdx) {
      alert('다른 트레이너의 페이지에 접근할 수 없습니다.');
      navigate('/');
      return;
    }
  }
}, [user, trainerIdx, navigate]);

  // 스케줄 불러오기 함수
  const fetchSchedules = useCallback(() => {
    axios
      .get(`/trainer/${trainerIdx}/schedule`)
      .then((res) => {
        const raw = res.data;
        const monthMap = {};
        raw.forEach((schedule) => {
          const dateKey = format(new Date(schedule.schedule_date), 'yyyy-MM-dd');
          if (!monthMap[dateKey]) monthMap[dateKey] = [];
          monthMap[dateKey].push(schedule);
        });
        setMonthSchedules(monthMap);
      })
      .catch((err) => {
        console.error('스케줄 불러오기 실패', err);
      });
  }, [trainerIdx]);

  // 컴포넌트 초기 마운트 및 trainerIdx 변경 시
  useEffect(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    setSelectedDate(todayStr);
    setShowPanel(true);

    if (trainerIdx) {
      fetchSchedules();

      // **매칭된 회원 리스트 불러오기 (matching_complete === 1 필터링)**
      axios.get(`/trainer/${trainerIdx}/matched-members`)
        .then((res) => {
          const matched = res.data.filter(m => m.matching_complete === 1);
          const transformed = matched.map((m) => ({
            member: {
              member_idx: m.user_idx,
              member_name: m.member?.member_name || '이름없음',
            },
          }));
          setMembers(transformed);

          // memberMap도 같이 만들어서 편의성 증가
          const map = {};
          transformed.forEach(({ member }) => {
            map[String(member.member_idx)] = member.member_name;
          });
          setMemberMap(map);
        })
        .catch((err) => {
          console.error('매칭된 회원 리스트 불러오기 실패:', err);
          setMembers([]);
          setMemberMap({});
        });
    }
  }, [trainerIdx, fetchSchedules]);

  // 주간 스케줄 추출
  useEffect(() => {
    if (!currentWeekStart || !monthSchedules) return;

    const newWeekSchedules = {};
    const start = currentWeekStart;
    const end = addDays(currentWeekStart, 6);

    Object.entries(monthSchedules).forEach(([dateStr, schedules]) => {
      const date = new Date(dateStr);
      if (date >= start && date <= end) {
        schedules.forEach((schedule) => {
          const dayIndex = getDay(date);
          const key = `${dayIndex}-${schedule.schedule_stime}`;
          newWeekSchedules[key] = schedule;
        });
      }
    });

    setWeekSchedules(newWeekSchedules);
  }, [currentWeekStart, monthSchedules]);

  useEffect(() => {
    // 로그인한 유저가 트레이너가 아니면 리턴
    if (!user?.member_email || user?.member_type !== 'trainer') return;
    if (!trainerIdx) return;

    const fetchRecordDates = async () => {
      try {
        const response = await axios.get(`/trainer/${trainerIdx}/records?month=${format(currentMonth, 'yyyy-MM')}`);
        setRecordDates(response.data);
      } catch (error) {
        console.error('운동기록 날짜 불러오기 실패:', error);
      }
    };

    fetchRecordDates();
  }, [currentMonth, user?.member_email, user?.member_type, trainerIdx]);

    

    useEffect(() => {
      if (isUser) {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        setSelectedDate(todayStr);
        setShowPanel(true);

        // 특정 날짜(오늘 기준) PT 예약 조회
        axios.get(`/user/${user.member_idx}/schedules?date=${todayStr}`)
          .then((res) => {
            const raw = res.data;
            const monthMap = {};
            raw.forEach((schedule) => {
              const dateKey = format(new Date(schedule.schedule_date), 'yyyy-MM-dd');
              if (!monthMap[dateKey]) monthMap[dateKey] = [];
              monthMap[dateKey].push(schedule);
            });
            setMonthSchedules(monthMap);
            
          })
          .catch((err) => console.error('유저 스케줄 불러오기 실패', err));

        // 운동 기록 날짜 리스트 가져오기
        axios.get(`/user/${user.member_idx}/records/dates`)
          .then((res) => setRecordDates(res.data))
          .catch((err) => console.error('운동 기록 날짜 리스트 불러오기 실패', err));
        // 스케줄 날짜 리스트 가져오기
        axios.get(`/user/${user.member_idx}/schedules/dates`)
          .then((res) => setScheduleDates(res.data))
          .catch((err) => console.error('예약 날짜 리스트 불러오기 실패', err));  
      }
    }, [user, currentMonth, isUser]);

  // 일정 추가 함수
  const handleInsertSchedule = async (key, schedule_name, schedule_stime, schedule_etime, schedule_content, user_idx) => {
    try {
      await axios.post(`/trainer/${trainerIdx}/schedule`, {
        user_name: schedule_name,
        schedule_stime,
        schedule_etime,
        schedule_content,
        user_idx: user_idx ?? 0, // null인 경우 0으로 대체
        schedule_date: selectedDate,
      });
      fetchSchedules();
      setShowInsertModal(false);
    } catch (error) {
      console.error('일정 추가 실패:', error);
    }
  };

  // 삭제 모드 토글, 체크박스 처리, 삭제 실행 등은 그대로 유지
  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
    setSelectedDeleteIds([]);
  };

  const handleCheckboxChange = (schedule_idx) => {
    setSelectedDeleteIds((prev) =>
      prev.includes(schedule_idx) ? prev.filter((id) => id !== schedule_idx) : [...prev, schedule_idx]
    );
  };

  const handleDeleteSelectedSchedules = () => {
    if (selectedDeleteIds.length === 0) return;
    if (window.confirm('선택한 일정을 삭제하시겠습니까?')) {
      executeDelete();
    }
  };

  const executeDelete = async () => {
    try {
      await Promise.all(selectedDeleteIds.map((id) => axios.delete(`/trainer/${trainerIdx}/schedule/${id}`)));
      fetchSchedules();
      setSelectedDeleteIds([]);
      setIsDeleteMode(false);
    } catch (error) {
      console.error('일정 삭제 실패:', error);
    }
  };

  // 날짜 클릭 핸들러
  const handleDayClick = (dateStr) => {
    setSelectedDate(dateStr);
    
    // 트레이너의 경우 운동기록이 있는 날짜만 모달 열기
    if (isTrainer) {
      if (recordDates.includes(dateStr)) {
        setShowModal(true);
      } else {
        setShowPanel(true);
      }
    } else {
      setShowModal(true);
    }
  };

  // 일정 추가 모달 열기
  const handleAddSchedule = () => {
    setSelectedStime('06:00'); // 기본 시작 시간 고정
    setShowInsertModal(true);
  };

  // 운동 추가 모달 열기
  const handleMemberClick = (schedule) => {
    setSelectedSchedule(schedule);
    setShowWorkoutInsert(true);
  };

  const closeWorkoutModal = () => setShowWorkoutInsert(false);

  const getScheduleColorsByDate = (dateStr) => {
    const colors = new Set();

    if (recordDates.includes(dateStr)) colors.add('green');

    if (isUser && scheduleDates.includes(dateStr)) colors.add('red');

    const schedules = monthSchedules[dateStr];
    if (!schedules) return Array.from(colors);
    for (const s of schedules) {
      if (s.user_idx) colors.add('red');
      else if (s.category === 'schedule') colors.add('red');
      else if (s.user_name && !s.user_idx) colors.add('yellow');
    }
    return Array.from(colors);
  };

  const hours = Array.from({ length: 19 }, (_, i) => `${(6 + i).toString().padStart(2, '0')}:00`);
  const days = ['일', '월', '화', '수', '목', '금', '토']; // 요일을 한글로 변경
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
    <>
      <Wrapper autoHeight={autoHeight}>
        {isTrainer ? (
          <>
            <TopBar>
              {view === 'week' ? (
                <MonthTitle>
                  <button onClick={() => setCurrentWeekStart(subDays(currentWeekStart, 7))}></button>
                  <span className="month-label">
                    {(() => {
                      // 1주차 계산 함수
                      const getWeekOfMonth = (date) => {
                        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
                        const firstDayOfWeek = firstDay.getDay();
                        const offsetDate = date.getDate() + firstDayOfWeek - 1;
                        return Math.floor(offsetDate / 7) + 1;
                      };
                      const weekNum = getWeekOfMonth(currentWeekStart);
                      const year = currentWeekStart.getFullYear();
                      const month = currentWeekStart.getMonth() + 1;
                      return `${year}년 ${month}월 ${weekNum}주차`;
                    })()}
                  </span>
                  <button onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}></button>
                </MonthTitle>
              ) : (
                <MonthTitle>
                  <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}></button>
                  <span className="month-label">{`${currentMonth.getFullYear()}년 ${currentMonth.getMonth() + 1}월`}</span> {/* '년월'을 한글로 표시 */}
                  <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}></button>
                </MonthTitle>
              )}

              <Toggle>
                <button
                  type="button"
                  data-active={view === 'week'}
                  onClick={() => setView('week')}
                >
                  주간 보기
                </button>
                <button
                  type="button"
                  data-active={view === 'month'}
                  onClick={() => setView('month')}
                >
                  월간 보기
                </button>
              </Toggle>
            </TopBar>

            {view === 'week' ? (
              <>
                <ScheduleBox style={{ 
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  backdropFilter: 'blur(25px)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: `
                    0 25px 60px rgba(0, 0, 0, 0.18),
                    inset 0 1px 0 rgba(255, 255, 255, 0.15)
                  `,
                  overflow: 'hidden'
                }}>
                  <WeekdaysRow
                    weekmode={true}
                    style={{
                      background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.1), rgba(74, 144, 226, 0.05))',
                      padding: '1.5rem 0',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                      gridTemplateColumns: '8rem repeat(7, 1fr)',
                      fontSize: '1.4rem',
                      fontWeight: '500'
                    }}
                  >
                    <div style={{ 
                      color: 'var(--text-secondary)', 
                      fontSize: '1.3rem',
                      fontWeight: '600',
                      textAlign: 'center',
                      position: 'relative',
                      background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.05), rgba(74, 144, 226, 0.02))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '0.8rem',
                        right: '1rem',
                        fontSize: '1.1rem',
                        fontWeight: '500',
                        color: 'var(--primary-blue)',
                        zIndex: 2
                      }}>Day</div>
                      <div style={{
                        position: 'absolute',
                        bottom: '0.8rem',
                        left: '1rem',
                        fontSize: '1.1rem',
                        fontWeight: '500',
                        color: 'var(--primary-blue)',
                        zIndex: 2
                      }}>Time</div>
                      <div style={{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(45deg, transparent 48%, rgba(74, 144, 226, 0.3) 49%, rgba(74, 144, 226, 0.3) 51%, transparent 52%)',
                        zIndex: 1
                      }}></div>
                    </div>
                    {days.map((day, idx) => (
                      <div key={idx} style={{
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: '600', marginBottom: '0.3rem' }}>{day}</div>
                        <div style={{ 
                          fontSize: '1.2rem', 
                          opacity: 0.7,
                          color: 'var(--primary-blue)'
                        }}>{format(new Date(weekDates[idx]), 'MM/dd')}</div>
                      </div>
                    ))}
                  </WeekdaysRow>

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '8rem repeat(7, 1fr)'
                  }}>
                    {hours.map((hour, idx) => (
                      <React.Fragment key={idx}>
                        {/* 시간 표시 셀 */}
                        <div
                          style={{
                            fontSize: '1.2rem',
                            textAlign: 'center',
                            color: 'var(--text-secondary)',
                            lineHeight: '4rem',
                            fontWeight: '500',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                            background: 'rgba(255, 255, 255, 0.03)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {hour}
                        </div>

                        {/* 요일별 셀 */}
                        {days.map((_, dayIdx) => {
                          const clickedDate = format(addDays(currentWeekStart, dayIdx), 'yyyy-MM-dd');
                          const hourNum = parseInt(hour.split(':')[0], 10);
                          const key = `${dayIdx}-${hour}`;
                          const schedule = weekSchedules[key];
                          const todayStr = format(new Date(), 'yyyy-MM-dd');
                          const isToday = clickedDate === todayStr;

                          const isStart =
                            !!schedule && parseInt(schedule.schedule_stime.split(':')[0], 10) === hourNum;

                          let duration = 1;
                          if (isStart) {
                            const start = parseInt(schedule.schedule_stime.split(':')[0], 10);
                            const end = parseInt(schedule.schedule_etime.split(':')[0], 10);
                            duration = Math.max(end - start, 1);
                          }

                          return (
                            <div
                              key={dayIdx}
                              style={{
                                borderLeft: dayIdx === 0 ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                                height: '5rem',
                                position: 'relative',
                                cursor: 'pointer',
                                background: isToday 
                                  ? 'rgba(74, 144, 226, 0.06)' 
                                  : 'transparent',
                                transition: 'background-color 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                if (!isStart) {
                                  e.target.style.background = 'rgba(74, 144, 226, 0.08)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isStart) {
                                  e.target.style.background = isToday ? 'rgba(74, 144, 226, 0.06)' : 'transparent';
                                }
                              }}
                              onClick={() => {
                                setSelectedDate(clickedDate);
                                setSelectedStime(hour);
                                const nextHour = (hourNum + 1).toString().padStart(2, '0') + ':00';
                                setSelectedEtime(nextHour);
                                setShowInsertModal(true);
                              }}
                            >
                              {isStart && (
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: '0',
                                    left: '2px',
                                    right: '2px',
                                    height: `${duration * 5}rem`,
                                    background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.8), rgba(74, 144, 226, 0.6))',
                                    color: 'white',
                                    fontSize: '1.3rem',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '0.6rem',
                                    boxSizing: 'border-box',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    boxShadow: '0 2px 8px rgba(74, 144, 226, 0.25)',
                                    zIndex: 2,
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-1px)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(74, 144, 226, 0.35)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 2px 8px rgba(74, 144, 226, 0.25)';
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMemberClick(schedule);
                                  }}
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
                  
                  <style jsx>{`
                    .schedule-cell:hover {
                      background: rgba(74, 144, 226, 0.1) !important;
                    }
                  `}</style>
                </ScheduleBox>
              </>
            ) : (
              <>
                <ScheduleBox style={{ flexDirection: 'column', minWidth: '350px' }}>
                  <div style={{ flex: 1, minWidth: '350px' }}>

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
                      const todayStr = format(new Date(), 'yyyy-MM-dd');
                      const isToday = dateStr === todayStr;

                      return (
                        <DayCellBox
                          key={index}
                          isSelected={isSelected}
                          isToday={isToday}
                          isSunday={dayOfWeek === 0}
                          isSaturday={dayOfWeek === 6}
                          isClickable={!!dateStr}
                          tabIndex={!!dateStr ? 0 : -1}
                          aria-label={dateStr ? `${day}일` : ''}
                          onClick={() => dateStr && handleDayClick(dateStr)}
                          onKeyDown={e => {
                            if ((e.key === 'Enter' || e.key === ' ') && dateStr) handleDayClick(dateStr);
                          }}
                        >
                          <div style={{
                            fontSize: '1.5rem',
                            fontWeight: isSelected ? '600' : isToday ? '500' : '400',
                            marginBottom: '6px',
                            textShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
                            letterSpacing: isSelected ? '0.5px' : '0'
                          }}>
                            {day || ''}
                          </div>
                          <DotWrapper>
                            {[...new Set(scheduleColors)].map((color) => (
                              <ScheduleDot
                                key={color}
                                color={
                                  color === 'green'
                                    ? 'var(--check-green)'
                                    : color === 'red'
                                    ? 'var(--warning)'
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.6rem' }} >
                        <ScheduleDot color="#F44336" /> PT 일정
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.6rem' }} >
                        <ScheduleDot color="#4CAF50" /> 운동기록
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.6rem' }} >
                        <ScheduleDot color="#FFEB3B" /> 외부 일정
                      </div>
                    </Legend>
                  </LegendContainer>
                </ScheduleBox>

                {showPanel && (
                  <SlidePanel initial={{ y: 50 }} animate={{ y: 0 }} exit={{ y: 50 }}>
                    <SlidePanelHeader>
                      <h3>{selectedDate} 일정</h3>
                      <ButtonGroup>
                        {!isDeleteMode && <button className="primary" onClick={handleAddSchedule}>일정 추가</button>}
                        {!isDeleteMode && <button className="secondary" onClick={toggleDeleteMode}>일정 삭제</button>}
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
                                  $isDeleteMode={isDeleteMode}
                                  onClick={() => !isDeleteMode && handleMemberClick(schedule)}
                                  title={!isDeleteMode ? '운동 추가' : ''}
                                >
                                  <div className="schedule-title">
                                    {/* user_idx가 있으면 memberMap에서 문자열로 조회 */}
                                    {schedule.user_idx
                                      ? memberMap[String(schedule.user_idx)]
                                      : schedule.user_name || '일정 없음'}
                                  </div>
                                  <div className="schedule-time">
                                    {schedule.schedule_stime} ~ {schedule.schedule_etime}
                                  </div>
                                  <div className="schedule-content">
                                    {schedule.schedule_content}
                                  </div>
                                </ScheduleContent>
                              </ScheduleLabel>
                            ))
                        ) : (
                          <div style={{
                            fontSize: '2rem',
                            color: 'var(--text-secondary)',
                            textAlign: 'center',
                            padding: '2rem 0',
                            fontWeight: 600,
                            letterSpacing: '0.02em',
                          }}>일정이 없습니다.</div>
                        )}
                      </div>
                    </div>

                    {isDeleteMode && (
                      <ButtonGroup style={{ justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button 
                          className="primary" 
                          onClick={handleDeleteSelectedSchedules} 
                          disabled={selectedDeleteIds.length === 0}
                        >
                          선택 삭제
                        </button>
                        <button className="secondary" onClick={toggleDeleteMode}>삭제 취소</button>
                      </ButtonGroup>
                    )}
                  </SlidePanel>
                )}
              </>
            )}
            {showInsertModal  && (
              <ScheduleInsertModal
                onClose={() => setShowInsertModal(false)}
                onInsert={handleInsertSchedule}
                members={members}
                selectedDate={selectedDate}
                selectedStime={selectedStime}
                selectedEtime={selectedEtime}
                trainerIdx={trainerIdx}
                schedulesForDate={monthSchedules[selectedDate] || []}
              />
            )}


            {showWorkoutInsert && selectedSchedule && (
              <WorkoutInsert
                onClose={closeWorkoutModal}
                onUpdate={fetchSchedules}
                memberName={
                  selectedSchedule.user_name ||
                  memberMap[String(selectedSchedule.user_idx)] ||
                  ''
                }
                memberIdx={selectedSchedule.user_idx}
                trainerIdx={trainerIdx}
                date={format(new Date(selectedSchedule.schedule_date), 'yyyy-MM-dd')}
                stime={selectedSchedule.schedule_stime}
                etime={selectedSchedule.schedule_etime}
                memo={selectedSchedule.schedule_content}
                scheduleIdx={selectedSchedule.schedule_idx}
              />
            )}
          </>
        ) : isUser ? (
          <>
            <MonthTitle>
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}></button>
              {`${currentMonth.getFullYear()}년 ${currentMonth.getMonth() + 1}월`}
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}></button>
            </MonthTitle>

            <ScheduleBox style={{ flexDirection: 'column', minWidth: '350px' }}>
              <WeekdaysRow>
                {days.map((day, idx) => (
                  <div key={idx}>{day}</div>
                ))}
              </WeekdaysRow>

              <CustomCalendar>
                {dates.map((day, index) => {
                  const dateStr =
                    day != null
                      ? `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
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
                        {[...new Set(scheduleColors)].map((color) => (
                          <ScheduleDot
                            key={color}
                            color={
                              color === 'green'
                                ? '#4CAF50'
                                : color === 'red'
                                ? '#F44336'
                                : '#FFC107'
                            }
                          />
                        ))}
                      </DotWrapper>
                    </DayCellBox>
                  );
                })}
              </CustomCalendar>
                
            
              
              <LegendContainer>
                <Legend>
                  <div>
                    <ScheduleDot color="#F44336" /> 스케줄
                  </div>
                  <div>
                    <ScheduleDot color="#4CAF50" /> 운동기록
                  </div>
                </Legend>
              </LegendContainer>
            </ScheduleBox>
          </>
        ) : null}
      </Wrapper>
       {showModal && (
          <DailyDetailModal
            date={selectedDate}
            schedules={monthSchedules[selectedDate] || []}
            onClose={() => setShowModal(false)}
          />
        )}
    </>
    
  );
};

export default TrainerCalendarView;
