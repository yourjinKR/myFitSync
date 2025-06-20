// ReviewList.js
import React, { useRef, useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import Review from './Review';

const ReviewList = () => {
  const slideRefs = useRef([]);
  const [maxHeight, setMaxHeight] = useState(0);

  const baseSlides = [
    {
      content: `집 근처에 새로 생긴 헬스장이라 등록했는데 기대 이상이에요. 기구도 최신이고 샤워실이나 락커룸도 항상 깨끗하게 유지돼요. 특히 PT 트레이너분이 친절하고 전문성도 있어서 운동 루틴 짜는 데 정말 도움이 됐습니다.`,
      score: 4.5,
    },
    {
      content: `시설은 전반적으로 괜찮은 편인데, 퇴근 시간대엔 사람이 너무 많아요. 기다려야 하는 경우가 종종 있고, 스트레칭 공간이 조금 좁게 느껴집니다. 다만 24시간 운영되는 점은 매우 만족스러워요.`,
      score: 4,
    },
    {
      content: `운동 기구는 다양한데 오래된 것도 몇 개 있고, 환기가 잘 안 되는 시간대가 있어요. PT 등록을 유도하는 느낌이 조금 부담스러웠고, 관리 상태는 보통 수준입니다. 그래도 가성비는 나쁘지 않아요.`,
      score: 3.5,
    },
  ];

  const duplicatedSlides = [...baseSlides, ...baseSlides];

  const calculateMaxHeight = () => {
    if (slideRefs.current.length) {
      const heights = slideRefs.current.map(el => el?.clientHeight || 0);
      const max = Math.max(...heights);
      setMaxHeight(max);
    }
  };

  // 최초 렌더, 그리고 duplicatedSlides 변경 시 실행
  useEffect(() => {
    calculateMaxHeight();
  }, [duplicatedSlides.length]);

  // 윈도우 리사이즈 시 다시 계산
  useEffect(() => {
    window.addEventListener('resize', calculateMaxHeight);
    return () => window.removeEventListener('resize', calculateMaxHeight);
  }, []);

  return (
    <div>
      <Swiper
        slidesPerView={1.2}
        centeredSlides={true}
        loop={true}
        loopedSlides={3}
        spaceBetween={15}
        className="mySwiper"
        style={{ padding: '30px' }}
      >
        {duplicatedSlides.map((slide, idx) => (
          <SwiperSlide key={idx}>
            <div ref={el => (slideRefs.current[idx] = el)}>
              <Review
                content={slide.content}
                score={slide.score}
                height={maxHeight}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ReviewList;
