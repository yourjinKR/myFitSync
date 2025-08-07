import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import ReviewList from './review/ReviewList';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import TrainerCalendarView from './trainer/TrainerCalendarView';
import chatApi from '../utils/ChatApi';
import { BsRocket, BsLightbulb, BsShield, BsHeart, BsChatDots, BsPersonCheck, BsClockHistory, BsShieldCheck } from 'react-icons/bs';

// 애니메이션 정의 (상단으로 이동)
const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const MainWrapper = styled.div`
  position: relative;
  padding: 2rem;
`;

const MatchedTrainerTitle = styled.h3`
  font-size: 2.4rem;
  word-break: keep-all;
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 2rem;
`;

const FindTrainerSection = styled.div`
  padding: 4rem 3rem;
  margin: 4rem 0;
  text-align: center;
  
  .content {
    position: relative;
    z-index: 1;
  }
`;

const FindTrainerTitle = styled.h2`
  font-size: 3.2rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1.5rem;
  position: relative;
  
  @media (max-width: 768px) {
    font-size: 2.6rem;
  }
`;

const FindTrainerSubtitle = styled.p`
  font-size: 1.7rem;
  color: var(--text-secondary);
  margin-bottom: 3.5rem;
  line-height: 1.6;
  font-weight: 400;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 2.5rem;
  }
`;

const FindTrainerCTA = styled.button`
  background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-hover));
  color: white;
  border: none;
  border-radius: 20px;
  padding: 2.2rem 5rem;
  font-size: 2.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 12px 40px rgba(74,144,226,0.3);
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 400px;
  letter-spacing: 0.5px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    transition: left 0.8s;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    right: 2rem;
    width: 20px;
    height: 20px;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 16 16'%3E%3Cpath d='M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H4.5z'/%3E%3C/svg%3E") no-repeat center;
    background-size: contain;
    transform: translateY(-50%) scale(0);
    transition: all 0.4s ease;
  }
  
  &:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 0 20px 60px rgba(74,144,226,0.4);
    
    &::before {
      left: 100%;
    }
    
    &::after {
      transform: translateY(-50%) scale(1);
    }
  }
  
  &:active {
    transform: translateY(-3px) scale(1.01);
  }
  
  @media (max-width: 768px) {
    padding: 2rem 3rem;
    font-size: 1.8rem;
    border-radius: 16px;
    
    &::after {
      right: 1.5rem;
      width: 16px;
      height: 16px;
    }
  }
`;

const FeatureHighlights = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const HighlightItem = styled.div`
  border-radius: 16px;
  padding: 2rem 1.5rem;
  border: 1px solid rgba(74,144,226,0.2);
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-3px);
    border-color: var(--primary-blue);
    box-shadow: 0 8px 25px rgba(74,144,226,0.15);
  }
  
  .icon {
    font-size: 2.5rem;
    color: var(--primary-blue);
    margin-bottom: 1rem;
    display: block;
  }
  
  .title {
    font-size: 1.4rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }
  
  .desc {
    font-size: 1.2rem;
    color: var(--text-secondary);
    line-height: 1.4;
  }
`;

const TrainerCard = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-top: 2.5rem;
  padding: 2rem;
  background: rgba(255,255,255,0.04);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.10);
  border: 1px solid rgba(255,255,255,0.10);
  backdrop-filter: blur(18px);
  transition: box-shadow 0.2s, transform 0.2s;
  position: relative;
  cursor: pointer;

  img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 2px 8px rgba(74,144,226,0.15);
    border: 2px solid var(--primary-blue-light);
    background: var(--bg-secondary);
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }

  h3 {
    margin: 0;
    color: var(--primary-blue);
    font-size: 2.1rem;
    font-weight: 600;
    letter-spacing: -0.5px;
    text-shadow: 0 2px 8px rgba(74,144,226,0.10);
  }

  p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 1.5rem;
    font-weight: 400;
    letter-spacing: 0.02em;
    text-shadow: 0 1px 2px rgba(0,0,0,0.08);
  }
`;

const ScheduleCard = styled.div`
  margin-top: 2rem;
  padding: 2rem 2.5rem;
  background: rgba(74,144,226,0.08);
  border-radius: 14px;
  box-shadow: 0 4px 18px rgba(74,144,226,0.10), 0 1px 0 rgba(255,255,255,0.08);
  border: 1px solid var(--primary-blue-light);
  backdrop-filter: blur(12px);
  transition: box-shadow 0.2s, background 0.2s;
  position: relative;

  h4 {
    margin: 0 0 1rem 0;
    font-size: 1.7rem;
    font-weight: 600;
    color: var(--primary-blue);
    letter-spacing: -0.5px;
    text-shadow: 0 2px 8px rgba(74,144,226,0.10);
  }

  p {
    margin: 0.5rem 0;
    color: var(--text-primary);
    font-size: 1.5rem;
    font-weight: 400;
    letter-spacing: 0.02em;
    text-shadow: 0 1px 2px rgba(0,0,0,0.08);
    background: rgba(255,255,255,0.03);
    border-radius: 6px;
    padding: 0.7rem 1.2rem;
    display: inline-block;
  }
`;

const ChatButton = styled.button`
  padding: 1rem 2.2rem;
  font-size: 1.35rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(90deg, var(--primary-blue) 60%, var(--primary-blue-light) 100%);
  border: none;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(74,144,226,0.18), 0 1px 0 rgba(255,255,255,0.10);
  backdrop-filter: blur(10px);
  transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
  cursor: pointer;
  outline: none;
  text-shadow: 0 2px 8px rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,0.10);
  letter-spacing: 0.02em;
  &:hover {
    background: linear-gradient(90deg, var(--primary-blue-light) 0%, var(--primary-blue) 100%);
    color: #fff;
    box-shadow: 0 6px 24px rgba(74,144,226,0.28);
    transform: translateY(-2px) scale(1.05);
    text-shadow: 0 4px 16px rgba(0,0,0,0.22);
  }
`;

// 홍보 섹션 스타일
const PromoSection = styled.section`
  opacity: 0;
  transform: translateY(50px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  margin: 4rem 0;
  
  &.visible {
    opacity: 1;
    transform: translateY(0);
  }
`;

const HeroSection = styled.div`
  text-align: center;
  padding: 6rem 0 4rem;
  margin: 2rem 0;
  position: relative;
`;

const HeroTitle = styled.h1`
  font-size: 4.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    font-size: 3.5rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.8rem;
  color: var(--text-secondary);
  margin-bottom: 3rem;
  line-height: 1.6;
  position: relative;
  z-index: 1;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  
  @media (max-width: 768px) {
    font-size: 1.6rem;
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 3rem;
  margin: 4rem 0;
`;

const FeatureCard = styled.div`
  border-radius: 20px;
  padding: 3rem 2rem;
  border: 1px solid rgba(74,144,226,0.2);
  text-align: center;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  
  &:hover {
    transform: translateY(-10px) scale(1.02);
    border-color: var(--primary-blue);
    box-shadow: 0 20px 40px rgba(74,144,226,0.2);
  }
`;

const FeatureIcon = styled.div`
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
  
  svg {
    width: 6rem;
    height: 6rem;
    color: var(--primary-blue);
    animation: ${pulse} 3s ease-in-out infinite;
  }
  
  @media (max-width: 768px) {
    svg {
      width: 5rem;
      height: 5rem;
    }
  }
`;

const FeatureTitle = styled.h3`
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
`;

const FeatureDescription = styled.p`
  font-size: 1.4rem;
  color: var(--text-secondary);
  line-height: 1.6;
  position: relative;
  z-index: 1;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin: 4rem 0;
  padding: 3rem;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 2rem;
  
  .number {
    font-size: 3.5rem;
    font-weight: 900;
    color: var(--primary-blue);
    display: block;
    margin-bottom: 1rem;
    animation: ${pulse} 2s ease-in-out infinite;
  }
  
  .label {
    font-size: 1.4rem;
    color: var(--text-secondary);
    font-weight: 600;
  }
`;

const CTASection = styled.div`
  text-align: center;
  padding: 4rem 3rem;
  margin: 4rem 0;
`;

const CTATitle = styled.h2`
  font-size: 3rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
`;

const CTADescription = styled.p`
  font-size: 1.6rem;
  color: var(--text-secondary);
  margin-bottom: 3rem;
  line-height: 1.6;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
`;

const PrimaryButton = styled.button`
  background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-hover));
  color: white;
  border: none;
  border-radius: 16px;
  padding: 1.8rem 4rem;
  font-size: 1.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(74,144,226,0.3);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.6s;
  }
  
  &:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 15px 35px rgba(74,144,226,0.4);
    
    &::before {
      left: 100%;
    }
  }
`;


const Main = () => {
  const nav = useNavigate();

  const { isLogin, member_type, member_idx } = useSelector((state) => state.user.user);
  const [isMatched, setIsMatched] = useState(false);
  const [trainerInfo, setTrainerInfo] = useState(null);
  const [nextSchedule, setNextSchedule] = useState(null);
  const { user } = useSelector(state => state.user);
  
  // 스크롤 애니메이션을 위한 Intersection Observer
  useEffect(() => {
    // 로그인 상태가 아닐 때만 애니메이션 설정
    if (!isLogin) {
      // 먼저 모든 섹션의 visible 클래스를 제거하여 초기 상태로 리셋
      const sections = document.querySelectorAll('.promo-section');
      sections.forEach((section) => {
        section.classList.remove('visible');
      });

      // Intersection Observer 설정
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
            }
          });
        },
        { threshold: 0.1 }
      );

      // 약간의 딜레이 후 Observer 적용 (DOM 업데이트 후)
      const timeoutId = setTimeout(() => {
        const sectionsToObserve = document.querySelectorAll('.promo-section');
        sectionsToObserve.forEach((section) => observer.observe(section));
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        observer.disconnect();
      };
    }
  }, [isLogin]); // isLogin 상태 변화에 따라 재실행
  
  // 트레이너면 강제로 트레이너 메인페이지로 이동
  useEffect(() => {
    if (isLogin && member_type === 'trainer' && member_idx) {
      nav(`/trainer/${member_idx}`);
    }
  }, [isLogin, member_type, member_idx, nav]);

  // 매칭 확인
  useEffect(() => {
    if (isLogin && member_type === 'user' && member_idx) {
      axios.get(`/user/matched-member/${member_idx}`)
        .then(res => {
          const matched = res.data && res.data.matching_complete === 1;
          console.log('matched 상태:', matched);
          setIsMatched(matched);
        })
        .catch(err => {
          console.error('매칭 확인 실패', err);
          setIsMatched(false); // 실패 시 기본값 false
        });
    }
  }, [isLogin, member_type, member_idx]);

  // 트레이너 정보 및 스케줄 조회
  useEffect(() => {
    if (isLogin && member_type === 'user' && member_idx) {
      // 매칭된 트레이너 정보 조회
      axios.get(`/user/${member_idx}/matched-trainer`)
        .then(res => setTrainerInfo(res.data))
        .catch(err => console.error('트레이너 정보 조회 실패', err));

      // 다음 PT 스케줄 조회
      axios.get(`/user/${member_idx}/next-schedule`)
        .then(res => setNextSchedule(res.data))
        .catch(err => console.error('다음 스케줄 조회 실패', err));
    }
  }, [isLogin, member_type, member_idx]);

  const handleChatCTA = async (trainer) => {

     const response = await chatApi.registerRoom(trainer.member_idx, null, trainer.member_name);
     if(response) {
        // trainerInfo 객체 생성
      const completeTrainerInfo = {
        member_idx: trainer.member_idx,
        member_name: trainer.name || trainer.member_name || '트레이너',
        member_image: trainer.profile_image || trainer.member_image,
        member_gender: trainer.member_gender,
        member_birth: trainer.member_birth,
        member_email: trainer.member_email,
        member_type: trainer.member_type || 'trainer',
        member_info: trainer.description || trainer.member_info,
        member_purpose: trainer.member_purpose,
        member_time: trainer.availableTime || trainer.member_time,
        member_activity_area: trainer.member_activity_area,
        member_intro: trainer.intro || trainer.member_intro,
        member_disease: trainer.member_disease
      };

      // roomData 생성
      const enhancedRoomData = {
        ...response,
        // 트레이너 정보
        trainer_idx: trainer.member_idx,
        trainer_name: trainer.name || trainer.member_name || '트레이너',
        trainer_image: trainer.profile_image || trainer.member_image,
        trainer_gender: trainer.member_gender,
        trainer_birth: trainer.member_birth,
        trainer_email: trainer.member_email,
        trainer_type: trainer.member_type || 'trainer',
        
        // 현재 사용자(회원) 정보
        user_idx: user.member_idx,
        user_name: user.member_name || '회원',
        user_image: user.member_image,
        user_gender: user.member_gender,
        user_birth: user.member_birth,
        user_email: user.member_email,
        user_type: user.member_type || 'user'
      };


      nav(`/chat/${response.room_idx}`, {
        state: {
          roomData: enhancedRoomData,
          trainerInfo: completeTrainerInfo
        }
      });
     }
  }

return (
  <>
    {isLogin && (
      <div style={{padding:'2rem 2rem 0'}}>
        <TrainerCalendarView autoHeight={'auto'}/>
      </div>
    )}
    <MainWrapper>
      {!isLogin && (
        <>
          {/* 히어로 섹션 */}
          <PromoSection className="promo-section">
            <HeroSection>
              <HeroTitle>FitSync와 함께하는 스마트 피트니스</HeroTitle>
              <HeroSubtitle>
                AI 기반 맞춤 트레이닝과 전문 트레이너 매칭으로<br/>
                당신의 건강한 라이프스타일을 완성하세요
              </HeroSubtitle>
              <PrimaryButton onClick={() => nav('/login')}>
                FitSync 시작하기 <BsRocket style={{ marginLeft: '0.5rem' }} />
              </PrimaryButton>
            </HeroSection>
          </PromoSection>

          {/* 통계 섹션 */}
          <PromoSection className="promo-section">
            <StatsContainer>
              <StatItem>
                <span className="number">15,000+</span>
                <span className="label">만족한 회원들</span>
              </StatItem>
              <StatItem>
                <span className="number">1,200+</span>
                <span className="label">전문 트레이너</span>
              </StatItem>
              <StatItem>
                <span className="number">98%</span>
                <span className="label">목표 달성률</span>
              </StatItem>
            </StatsContainer>
          </PromoSection>

          {/* 핵심 기능 섹션 */}
          <PromoSection className="promo-section">
            <FeatureGrid>
              <FeatureCard>
                <FeatureIcon>
                  <BsLightbulb />
                </FeatureIcon>
                <FeatureTitle>AI 맞춤 루틴</FeatureTitle>
                <FeatureDescription>
                  당신의 체력, 목표, 선호도를 분석하여 최적화된 운동 루틴을 AI가 생성합니다
                </FeatureDescription>
              </FeatureCard>
              
              <FeatureCard>
                <FeatureIcon>
                  <BsHeart />
                </FeatureIcon>
                <FeatureTitle>전문 트레이너 매칭</FeatureTitle>
                <FeatureDescription>
                  검증된 전문 트레이너와의 1:1 매칭으로 개인 맞춤 지도를 받으세요
                </FeatureDescription>
              </FeatureCard>
              
              <FeatureCard>
                <FeatureIcon>
                  <BsShield />
                </FeatureIcon>
                <FeatureTitle>안전한 운동 환경</FeatureTitle>
                <FeatureDescription>
                  부상 예방과 안전한 운동을 위한 체계적인 가이드라인을 제공합니다
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard>
                <FeatureIcon>
                  <BsChatDots />
                </FeatureIcon>
                <FeatureTitle>실시간 소통</FeatureTitle>
                <FeatureDescription>
                  트레이너와 실시간 채팅으로 언제든지 궁금한 점을 해결하고 동기부여를 받으세요
                </FeatureDescription>
              </FeatureCard>
            </FeatureGrid>
          </PromoSection>

          {/* PT 트레이너 찾기 섹션 */}
          <PromoSection className="promo-section">
            <FindTrainerSection>
              <div className="content">
                <FindTrainerTitle>당신만의 전문 트레이너를 찾아보세요</FindTrainerTitle>
                <FindTrainerSubtitle>
                  검증된 전문 트레이너들과 함께 건강한 변화를 시작하세요. 
                  개인 맞춤 케어로 목표 달성이 더욱 확실해집니다.
                </FindTrainerSubtitle>
                
                <FindTrainerCTA onClick={() => nav('/trainer/search')}>
                  전문 트레이너 찾기
                </FindTrainerCTA>
                
                <FeatureHighlights>
                  <HighlightItem>
                    <BsPersonCheck className="icon" />
                    <div className="title">검증된 전문가</div>
                    <div className="desc">자격증과 경력을 검증한 우수 트레이너</div>
                  </HighlightItem>
                  <HighlightItem>
                    <BsClockHistory className="icon" />
                    <div className="title">유연한 스케줄</div>
                    <div className="desc">나에게 맞는 시간대 선택 가능</div>
                  </HighlightItem>
                  <HighlightItem>
                    <BsShieldCheck className="icon" />
                    <div className="title">만족도 보장</div>
                    <div className="desc">체계적인 관리와 피드백 제공</div>
                  </HighlightItem>
                  <HighlightItem>
                    <BsShieldCheck className="icon" />
                    <div className="title">실시간 소통</div>
                    <div className="desc">자체 메신저를 통해 트레이너와 소통</div>
                  </HighlightItem>
                </FeatureHighlights>
              </div>
            </FindTrainerSection>
          </PromoSection>

          {/* 후기 섹션 */}
          <PromoSection className="promo-section">
            <CTATitle style={{ textAlign: 'center', marginBottom: '3rem' }}>
              FitSync 이용자들의 생생한 후기
            </CTATitle>
            <ReviewList />
          </PromoSection>

          {/* CTA 섹션 */}
          <PromoSection className="promo-section">
            <CTASection>
              <CTATitle>FitSync와 함께 시작할 준비가 되셨나요?</CTATitle>
              <CTADescription>
                지금 FitSync에 가입하고 당신만의 피트니스 여정을 시작하세요.<br/>
              </CTADescription>
              <PrimaryButton onClick={() => nav('/login')}>
                회원가입 후 바로시작 !
              </PrimaryButton>
            </CTASection>
          </PromoSection>
        </>
      )}

      {isLogin && member_type === 'user' && (
        isMatched ? (
          <>
            <MatchedTrainerTitle>매칭된 트레이너와 함께<br />운동을 이어가보세요!</MatchedTrainerTitle>

            {/* 매칭된 트레이너 정보 카드 */}
            {trainerInfo && (
              <TrainerCard>
                <img src={trainerInfo.member_image} alt="트레이너 프로필" />
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems : 'center' , width: '100%'}}>
                  <div className="info">
                    <h3>{trainerInfo.member_name} 트레이너</h3>
                    <p>{trainerInfo.member_email}</p>
                  </div>
                  <ChatButton onClick={() => handleChatCTA(trainerInfo)}>
                    대화하기
                  </ChatButton>
                </div>
              </TrainerCard>
            )}

            {/* 다음 PT 스케줄 정보 카드 */}
            {nextSchedule && (
              <ScheduleCard>
                <h4>다음 스케줄</h4>
                <p>
                  {new Date(nextSchedule.schedule_date).toLocaleDateString()} (
                  {nextSchedule.schedule_stime} ~ {nextSchedule.schedule_etime})
                </p>
                <p>{nextSchedule.schedule_content}</p>
              </ScheduleCard>
            )}
          </>
        ) : (
          <>
            {/* <Slogan>아직 트레이너가 없으신가요?<br />지금 바로 찾아보세요!</Slogan>
            <FindTrainerCTA onClick={handleCTA}>
              PT찾기
            </FindTrainerCTA>
            {isLog !== undefined && isLog === false && (
              <GradientButton 
                fullWidth 
                onClick={() => nav("/ai/routine")}
                style={{ 
                  padding: '30px', 
                  fontSize: '3rem', 
                  margin: '15px 0',
                  width : '100%',
                }}
              >
                1회 무료 루틴 추천받기<BsStars/>
              </GradientButton>
            )} */}
          </>
        )
      )}
    </MainWrapper>
  </>
);

};

export default Main;