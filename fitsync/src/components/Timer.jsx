import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import AlarmIcon from '@mui/icons-material/Alarm';

import 'swiper/css';
import 'swiper/css/free-mode';

const TimerBg = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 20px;
  z-index: 1000;
`;

const TimerInner = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 50px;
`;


const TimeController = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 100px;
  display: flex;
  align-items: center;
  gap: 13px;
  letter-spacing: 8px;
  z-index: -1;
  opacity: 0;
  
  &.active {
    z-index: 10;
    opacity: 1;
  }

  font-size: 4rem;
  font-weight: bold;

  .mySwiper {
    height: 100%;
    
    .swiper-slide{
      font-size: 4rem;
      text-align: center;
      line-height: 40px;
    }
  }
`;

const TimerBox = styled.div`
  position: relative;
  width: 300px;
  height: 300px;
  background: var(--bg-primary);
  border-radius: 50%;
  
`;

const TimerText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 4rem;
  font-weight: bold;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  letter-spacing: 7px;
  z-index: 10;
  opacity: 1;
  
  &.active {
    z-index: -1;
    opacity: 0;
  }
`;

const TimeControlBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  & > div {
    width: 100%;
    height: 100%;
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: center;
  }
`;

const Button = styled.button.attrs(props => ({
  color: props.color
}))`
  font-size: 1.8rem;
  color: var(--text-primary);
  background: ${
    props => props.color === 'red' ? 
    'var(--start-red)' : 
    props.color === 'green' ? 
    'var(--stop-green)' : 
    props.color === 'blue' ? 
    'var(--primary-blue)' :
    'var(--reset-gray)'};
  padding: 10px 20px;
  border-radius: 10px;
  text-align: center;
  width: 120px;
 
`;

const Svg = styled.svg`
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
`;

const CircleBackground = styled.circle`
  fill: none;
  stroke: var(--text-primary);
  stroke-width: 10;
`;

const CircleProgress = styled.circle`
  fill: none;
  stroke: var(--primary-blue);
  stroke-width: 10;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s ease;
`;

const Alarm = styled.div`
  position: absolute;
  top: 50%; 
  left: 50%;
  transform: translate(-50%, -50%);
  width: 250px;
  height: 250px;
  border-radius: 10px;
  background: var(--bg-white);
  display: none;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 5px;
  z-index: 10;

  h4 {
    font-size: 3rem;
    font-weight:bold;
    color: var(--text-black);
    font-weight: 500;
  }

  .MuiSvgIcon-root {
    position: relative;
    font-size: 100px;
    z-index: 20;
    path {
      color: var(--text-black);
    }
    animation: Alarm 0.5s infinite linear;
  }

  button {
    width:90%;
  }

  @keyframes Alarm{
    0%, 50%, 100%{
      transform: rotate(0deg);
    }
    25% {
      transform: rotate(-15deg);
    }
    75% {
      transform: rotate(15deg);
    }
`;

function timeFormat(seconds, minutes, type) {
  let result = "";
  if (type === 'seconds') {
    result = `
      ${Math.floor(seconds / 60) < 10 ?
        '0' + Math.floor(seconds / 60) :
        Math.floor(seconds / 60)}
       : 
      ${seconds % 60 < 10 ?
        '0' + seconds % 60 :
        seconds % 60}`;
  } else {
    result = `${minutes * 60 + seconds}  `
  }
  return result;
}

const Timer = ({time, setTime, setIsTimerShow}) => {
  
  const [formatTime, setFormatTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPause, setIsPause] = useState(false);
  const minutesSwiperRef = useRef(null);
  const secondsSwiperRef = useRef(null);
  const timerRef = useRef(null);
  const alarmRef = useRef(null);
  const alarmBgRef = useRef(null);

  const [init, setInit] = useState({
    size : 300, 
    strokeWidth : 10, 
    percentage : 100
  });
  const radius = (init.size - init.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // 진행도 계산: 남은 시간 / 전체 시간 * 100
  const currentPercentage = totalTime > 0 ? (formatTime / totalTime) * 100 : 100;
  const offset = circumference - (currentPercentage / 100) * circumference;

  useEffect(() => {
    // 초기 시간 설정 시 전체 시간도 업데이트
    if(!isPause){
      const newFormatTime = timeFormat(time.seconds, time.minutes);
      setFormatTime(newFormatTime);
  
      if (!isRunning) {
        setTotalTime(newFormatTime);
      }
    }

    console.log("🚀  :  Timer  :  time:", time)
  }, [time, isRunning, isPause]);

  useEffect(() => {
    if(isRunning && parseInt(formatTime) === 0) {
      clearInterval(timerRef.current);
      setIsRunning(false);
      alarmRef.current.style.display = 'flex';
    }
  }, [formatTime]);


  const updateTime = () => {
    minutesSwiperRef.current?.swiper?.slideToClosest(200);
  }
  
  const handleTimerControl = (type) => {
    if( formatTime !== null && formatTime !== undefined) {

      if (!isRunning && parseInt(formatTime) !== 0 && type === 'START') {
        setIsRunning(true);
        setIsPause(false);
        timerRef.current = setInterval(() => {
          setFormatTime(prev => {
            const newTime = prev - 1;
            return newTime >= 0 ? newTime : 0;
          });
        }, 1000);
      
      } else if (type === 'STOP') {
        clearInterval(timerRef.current);
        setIsRunning(false);
        setIsPause(true);
      } else if (type === 'RESET')  {
        setIsRunning(false);
        setIsPause(false);
        if (timerRef.current != null) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        // 시간 상태 초기화
        setTime({
          minutes: 0,
          seconds: 0
        });
        
        // 리셋 시 현재 설정된 시간으로 초기화
        const resetTime = timeFormat(0, 0);
        setFormatTime(resetTime);
        setTotalTime(resetTime);
        
        // 각 Swiper를 0번째 슬라이드로 이동
        minutesSwiperRef.current?.swiper?.slideTo(0, 200);
        secondsSwiperRef.current?.swiper?.slideTo(0, 200);
      }
    }
  }

  const handleAlarm = () => {
    alarmRef.current.style.display = 'none';
    setIsTimerShow(false);
  }
  
  const handleTimer = (e) => {
    if (e.target === e.currentTarget) {
      setIsTimerShow(false);
    }
  }

  const handleAddTime = (seconds) => {
    setFormatTime(prev =>
      parseInt(prev) + seconds
    )

    if(seconds !== 60) {
      const newTime = time.seconds + seconds;
      
      if(newTime >= 60) {
        secondsSwiperRef.current?.swiper?.slideTo(
          parseInt(newTime%60) === 0 ? 0 : parseInt(newTime%60), 100);
        minutesSwiperRef.current?.swiper?.slideTo(
          parseInt(minutesSwiperRef.current?.swiper?.activeIndex) + 1, 
          200
        );
      }else{
        secondsSwiperRef.current?.swiper?.slideTo(newTime, 100);
      }
   
    } else {
      minutesSwiperRef.current?.swiper?.slideTo(
        parseInt(minutesSwiperRef.current?.swiper?.activeIndex) + 1, 
        200
      );
    }
  }

  return (
    <TimerBg ref={alarmBgRef} onClick={handleTimer}>
      <TimerInner>
        <TimerBox>
          <Svg width={init.size} height={init.size}>
            <CircleBackground
              cx={init.size / 2}
              cy={init.size / 2}
              r={radius}
              />
            <CircleProgress
              cx={init.size / 2}
              cy={init.size / 2}
              r={radius}
              strokeDasharray={circumference}
              strokeDashoffset={isRunning ? offset : 0}
              />
          </Svg>
            
          <TimerText ref={timerRef} className={isPause || isRunning? '' : 'active'}>
            {timeFormat(formatTime, 0, 'seconds')}
          </TimerText>
          <TimeController className={!isPause && !isRunning ? 'active' : ''}>
            <Swiper
              direction="vertical"
              initialSlide={time.minutes}
              slidesPerView={2}
              spaceBetween={10}
              loop={false}
              freeMode={{ enabled: true, sticky: true, momentum: true }}
              centeredSlides={true}
              onTouchEnd={() => updateTime("minutes")}
              onTransitionEnd={(swiper) => {
                setTime({
                  ...time,
                  minutes: swiper.activeIndex
                })
              }}
              modules={[FreeMode]}
              className="mySwiper"
              ref={minutesSwiperRef}
            >
              {
                Array.from({ length: 61 }, (_, index) => (
                  <SwiperSlide key={index}>
                    {index < 10 ? '0' + index : index}
                  </SwiperSlide>
                ))
              }
            </Swiper>
            :
            <Swiper
              direction="vertical"
              initialSlide={time.seconds}
              slidesPerView={2}
              spaceBetween={10}
              loop={false}
              freeMode={{ enabled: true, sticky: true, momentum: true }}
              centeredSlides={true}
              onTouchEnd={() => updateTime("seconds")}
              onTransitionEnd={(swiper) => {
                setTime({
                  ...time,
                  seconds: swiper.activeIndex
                })
              }}
              modules={[FreeMode]}
              className="mySwiper"
              ref={secondsSwiperRef}
            >
              {
                Array.from({ length: 60 }, (_, index) => (
                  <SwiperSlide key={index}>
                    {index < 10 ? '0' + index : index}
                  </SwiperSlide>
                ))
              }
            </Swiper>
          </TimeController>

        </TimerBox>
        
        {/* 버튼 */}
        <TimeControlBox>
          <div>
            {
              isRunning ? 
              <Button color={'red'} onClick={() => handleTimerControl('STOP')}>중지</Button> :
              <Button color={'green'} onClick={() => handleTimerControl('START')}>시작</Button>
            }
            <Button color={'gay'} onClick={() => handleTimerControl('RESET')}>초기화</Button>
          </div>
          {
            !isRunning ?
            <div>
              <Button color={'blue'} onClick={() => handleAddTime(30)}>+ 30초</Button>
              <Button color={'blue'} onClick={() => handleAddTime(60)}>+ 1분</Button>
            </div>
            : <></>
          }
        </TimeControlBox>

        {/* 알람 */}
        <Alarm ref={alarmRef}>
            <h4>휴식 알람</h4>
            <AlarmIcon />
            <Button color={'blue'} onClick={handleAlarm}>확인</Button>
        </Alarm>
      </TimerInner>
    </TimerBg>
  );
};

export default Timer;