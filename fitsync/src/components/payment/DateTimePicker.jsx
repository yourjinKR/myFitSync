import React, { useState } from 'react';
import styled from 'styled-components';

const CalendarContainer = styled.div`
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 1000;
    background: var(--bg-secondary);
    border: 1px solid var(--border-light);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    padding: 20px;
    min-width: 320px;
`;

const CalendarHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
`;

const MonthYear = styled.h3`
    margin: 0;
    color: var(--text-primary);
    font-size: 1.8rem;
`;

const NavButton = styled.button`
    background: none;
    border: none;
    font-size: 1.8rem;
    cursor: pointer;
    padding: 8px;
    border-radius: 4px;
    color: var(--text-primary);
    
    &:hover {
        background: var(--bg-tertiary);
    }
`;

const CalendarGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
    margin-bottom: 20px;
`;

const DayHeader = styled.div`
    text-align: center;
    padding: 8px;
    font-weight: bold;
    color: var(--text-secondary);
    font-size: 1.2rem;
`;

const DayCell = styled.div`
    text-align: center;
    padding: 8px;
    cursor: pointer;
    border-radius: 4px;
    font-size: 1.4rem;
    color: var(--text-primary);
    
    ${props => props.isToday && `
        background: var(--primary-blue-light);
        font-weight: bold;
        color: var(--text-primary);
    `}
    
    ${props => props.isSelected && `
        background: var(--primary-blue);
        color: var(--bg-white);
    `}
    
    ${props => props.isOtherMonth && `
        color: var(--text-tertiary);
    `}
    
    ${props => props.isPast && `
        color: var(--text-tertiary);
        cursor: not-allowed;
    `}
    
    &:hover {
        ${props => !props.isPast && !props.isSelected && `
            background: var(--bg-tertiary);
        `}
    }
`;

const TimeContainer = styled.div`
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 20px;
    
    label {
        color: var(--text-primary);
        font-size: 1.4rem;
    }
`;

const TimeInput = styled.input`
    padding: 8px;
    border: 1px solid var(--border-light);
    border-radius: 4px;
    font-size: 1.4rem;
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    
    &:focus {
        border-color: var(--primary-blue);
        outline: none;
    }
    
    &::placeholder {
        color: var(--text-tertiary);
    }
`;

const ButtonContainer = styled.div`
    display: flex;
    gap: 10px;
    justify-content: flex-end;
`;

const Button = styled.button`
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1.4rem;
    transition: all 0.2s ease;
    
    ${props => props.primary ? `
        background: var(--primary-blue);
        color: var(--bg-white);
        
        &:hover {
            background: var(--primary-blue-hover);
        }
    ` : `
        background: var(--bg-tertiary);
        color: var(--text-primary);
        border: 1px solid var(--border-light);
        
        &:hover {
            background: var(--border-light);
        }
    `}
`;

const DateTimePicker = ({ onSelect, onCancel, initialDate = null }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(initialDate || new Date());
    const [selectedTime, setSelectedTime] = useState(
        initialDate ? 
        `${String(initialDate.getHours()).padStart(2, '0')}:${String(initialDate.getMinutes()).padStart(2, '0')}` : 
        '14:30'
    );

    const today = new Date();
    const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
    const months = [
        '1월', '2월', '3월', '4월', '5월', '6월',
        '7월', '8월', '9월', '10월', '11월', '12월'
    ];

    // 달력 날짜 생성
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];
        
        // 이전 달의 마지막 날들
        const prevMonth = new Date(year, month - 1, 0);
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            days.push({
                day: prevMonth.getDate() - i,
                isOtherMonth: true,
                date: new Date(year, month - 1, prevMonth.getDate() - i)
            });
        }
        
        // 현재 달의 날들
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            days.push({
                day,
                isOtherMonth: false,
                date,
                isToday: date.toDateString() === today.toDateString(),
                isPast: date < today.setHours(0, 0, 0, 0)
            });
        }
        
        // 다음 달의 첫 날들 (42개 셀을 채우기 위해)
        const remainingCells = 42 - days.length;
        for (let day = 1; day <= remainingCells; day++) {
            days.push({
                day,
                isOtherMonth: true,
                date: new Date(year, month + 1, day)
            });
        }
        
        return days;
    };

    const days = getDaysInMonth(currentDate);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const handleDayClick = (dayInfo) => {
        if (dayInfo.isPast) return;
        setSelectedDate(dayInfo.date);
    };

    const handleConfirm = () => {
        const [hours, minutes] = selectedTime.split(':');
        const finalDateTime = new Date(selectedDate);
        finalDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        // 과거 시간 체크
        if (finalDateTime <= new Date()) {
            alert('현재 시간보다 미래 시간을 선택해주세요.');
            return;
        }
        
        onSelect(finalDateTime);
    };

    return (
        <CalendarContainer>
            <CalendarHeader>
                <NavButton onClick={handlePrevMonth}>‹</NavButton>
                <MonthYear>
                    {currentDate.getFullYear()}년 {months[currentDate.getMonth()]}
                </MonthYear>
                <NavButton onClick={handleNextMonth}>›</NavButton>
            </CalendarHeader>
            
            <CalendarGrid>
                {daysOfWeek.map(day => (
                    <DayHeader key={day}>{day}</DayHeader>
                ))}
                {days.map((dayInfo, index) => (
                    <DayCell
                        key={index}
                        isToday={dayInfo.isToday}
                        isSelected={selectedDate.toDateString() === dayInfo.date.toDateString()}
                        isOtherMonth={dayInfo.isOtherMonth}
                        isPast={dayInfo.isPast}
                        onClick={() => handleDayClick(dayInfo)}
                    >
                        {dayInfo.day}
                    </DayCell>
                ))}
            </CalendarGrid>
            
            <TimeContainer>
                <label>시간:</label>
                <TimeInput
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                />
            </TimeContainer>
            
            <ButtonContainer>
                <Button onClick={onCancel}>취소</Button>
                <Button primary onClick={handleConfirm}>확인</Button>
            </ButtonContainer>
        </CalendarContainer>
    );
};

export default DateTimePicker;
