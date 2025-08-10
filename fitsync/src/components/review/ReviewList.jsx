// ReviewList.js
import React, { useRef, useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Autoplay } from 'swiper/modules';
import Review from './Review';

const ReviewList = () => {
  const slideRefs = useRef([]);
  const [maxHeight, setMaxHeight] = useState(0);

  const baseSlides = [
    {
      matching_idx: 1,
      review_title: "3개월 만에 8kg 감량 성공!",
      review_content: `김정호 트레이너님과 3개월 PT를 받았는데 정말 대만족이에요! 처음엔 운동 경험이 전혀 없어서 걱정했는데, 기초부터 차근차근 가르쳐주시고 제 체력에 맞는 운동을 계획해주셔서 부상 없이 안전하게 운동할 수 있었습니다. 무엇보다 식단 관리까지 꼼꼼히 챙겨주셔서 3개월 만에 8kg 감량 성공했어요!`,
      review_star: 5,
      member_name: "김혜진",
      member_image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDUiIGhlaWdodD0iNDUiIHZpZXdCb3g9IjAgMCA0NSA0NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjIuNSIgY3k9IjIyLjUiIHI9IjIyLjUiIGZpbGw9IiNGRkUxRTYiLz4KPGNpcmNsZSBjeD0iMjIuNSIgY3k9IjE3IiByPSI4IiBmaWxsPSIjRkY2RDlBIi8+CjxwYXRoIGQ9Ik0zNiA0MEMzNiAzMi4yNjggMjkuNzMyIDI2IDIyIDI2UzggMzIuMjY4IDggNDBIMzZaIiBmaWxsPSIjRkY2RDlBIi8+Cjwvc3ZnPgo=",
    },
    {
      matching_idx: 2,
      review_title: "인생 운동을 만났어요!",
      review_content: `이수진 트레이너님께 PT 받은 지 6개월째인데, 정말 인생 운동을 만났다고 생각해요. 매번 다른 운동으로 지루하지 않게 해주시고, 제가 힘들어할 때마다 동기부여해주시는 말 한마디 한마디가 정말 큰 힘이 됩니다. 어깨 통증도 많이 좋아졌고 자세도 확실히 개선됐어요. 주변 친구들에게도 적극 추천하고 있습니다!`,
      review_star: 5,
      member_name: "이민호",
      member_image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDUiIGhlaWdodD0iNDUiIHZpZXdCb3g9IjAgMCA0NSA0NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjIuNSIgY3k9IjIyLjUiIHI9IjIyLjUiIGZpbGw9IiNFMUY1RkUiLz4KPGNpcmNsZSBjeD0iMjIuNSIgY3k9IjE3IiByPSI4IiBmaWxsPSIjMzY5M0ZGIi8+CjxwYXRoIGQ9Ik0zNiA0MEMzNiAzMi4yNjggMjkuNzMyIDI2IDIyIDI2UzggMzIuMjY4IDggNDBIMzZaIiBmaWxsPSIjMzY5M0ZGIi8+Cjwvc3ZnPgo=",
    },
    {
      matching_idx: 3,
      review_title: "완전히 새로운 사람이 됐어요",
      review_content: `박민수 트레이너님과 함께한 PT 덕분에 완전히 새로운 사람이 된 기분이에요. 20대 때 몸무게로 돌아갔고, 체력도 훨씬 좋아졌습니다. 특히 개인별 맞춤 운동 프로그램이 정말 체계적이라서 매 회차마다 발전하는 게 눈에 보여요. 실시간 채팅으로 운동 외 시간에도 궁금한 점들을 바로바로 물어볼 수 있어서 너무 좋았습니다!`,
      review_star: 5,
      member_name: "박서연",
      member_image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDUiIGhlaWdodD0iNDUiIHZpZXdCb3g9IjAgMCA0NSA0NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjIuNSIgY3k9IjIyLjUiIHI9IjIyLjUiIGZpbGw9IiNGMEY5RkYiLz4KPGNpcmNsZSBjeD0iMjIuNSIgY3k9IjE3IiByPSI4IiBmaWxsPSIjMzhCREY4Ii8+CjxwYXRoIGQ9Ik0zNiA0MEMzNiAzMi4yNjggMjkuNzMyIDI2IDIyIDI2UzggMzIuMjY4IDggNDBIMzZaIiBmaWxsPSIjMzhCREY4Ii8+Cjwvc3ZnPgo=",
    },
    {
      matching_idx: 4,
      review_title: "운동이 이렇게 재미있는 건지 몰랐어요",
      review_content: `최윤아 트레이너님과 PT 시작한 지 4개월 되었는데, 정말 운동이 이렇게 재미있는 건지 처음 알았어요! 매번 새로운 도전을 주시면서도 제 페이스에 맞춰서 진행해주시니까 스트레스 없이 꾸준히 할 수 있었습니다. 근력도 늘고 유연성도 좋아져서 일상생활이 훨씬 편해졌어요. 정말 감사합니다!`,
      review_star: 5,
      member_name: "정우진",
      member_image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDUiIGhlaWdodD0iNDUiIHZpZXdCb3g9IjAgMCA0NSA0NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjIuNSIgY3k9IjIyLjUiIHI9IjIyLjUiIGZpbGw9IiNGRkY3RUQiLz4KPGNpcmNsZSBjeD0iMjIuNSIgY3k9IjE3IiByPSI4IiBmaWxsPSIjRjU5RTBCIi8+CjxwYXRoIGQ9Ik0zNiA0MEMzNiAzMi4yNjggMjkuNzMyIDI2IDIyIDI2UzggMzIuMjY4IDggNDBIMzZaIiBmaWxsPSIjRjU5RTBCIi8+Cjwvc3ZnPgo=",
    },
    {
      matching_idx: 5,
      review_title: "과학적이고 효율적인 운동법",
      review_content: `강태훈 트레이너님께 PT 받으면서 운동에 대한 인식이 완전히 바뀌었어요. 무작정 힘든 운동만 하는 게 아니라 과학적인 근거를 바탕으로 효율적인 운동법을 알려주셔서 정말 신뢰가 갔습니다. 덕분에 근육량도 늘고 체지방률도 확실히 감소했어요. FitSync 선택한 게 정말 잘한 것 같습니다!`,
      review_star: 5,
      member_name: "최은영",
      member_image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDUiIGhlaWdodD0iNDUiIHZpZXdCb3g9IjAgMCA0NSA0NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjIuNSIgY3k9IjIyLjUiIHI9IjIyLjUiIGZpbGw9IiNGM0U4RkYiLz4KPGNpcmNsZSBjeD0iMjIuNSIgY3k9IjE3IiByPSI4IiBmaWxsPSIjOTMzM0VBIi8+CjxwYXRoIGQ9Ik0zNiA0MEMzNiAzMi4yNjggMjkuNzMyIDI2IDIyIDI2UzggMzIuMjY4IDggNDBIMzZaIiBmaWxsPSIjOTMzM0VBIi8+Cjwvc3ZnPgo=",
    },
    {
      matching_idx: 6,
      review_title: "인생의 터닝포인트가 되었어요",
      review_content: `홍미영 트레이너님과 함께한 6개월이 제 인생의 터닝포인트가 되었어요. 출산 후 망가진 몸매 때문에 자신감을 잃었었는데, 트레이너님의 세심한 케어와 격려 덕분에 예전보다 더 건강하고 아름다운 몸을 만들 수 있었습니다. 아이와 함께 활동적인 엄마가 될 수 있어서 정말 행복해요!`,
      review_star: 5,
      member_name: "장수민",
      member_image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDUiIGhlaWdodD0iNDUiIHZpZXdCb3g9IjAgMCA0NSA0NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjIuNSIgY3k9IjIyLjUiIHI9IjIyLjUiIGZpbGw9IiNGMkZERjIiLz4KPGNpcmNsZSBjeD0iMjIuNSIgY3k9IjE3IiByPSI4IiBmaWxsPSIjMjJDNTVFIi8+CjxwYXRoIGQ9Ik0zNiA0MEMzNiAzMi4yNjggMjkuNzMyIDI2IDIyIDI2UzggMzIuMjY4IDggNDBIMzZaIiBmaWxsPSIjMjJDNTVFIi8+Cjwvc3ZnPgo=",
    },
    {
      matching_idx: 7,
      review_title: "전문적이고 친절한 최고의 트레이너",
      review_content: `조현석 트레이너님과 PT 받기 전까지는 헬스장만 가면 뭘 해야 할지 몰라서 방황했는데, 이제는 혼자서도 자신 있게 운동할 수 있어요. 기본기부터 고급 테크닉까지 차근차근 가르쳐주시고, 부상 예방법도 상세히 알려주셔서 안전하게 운동하고 있습니다. 정말 전문적이고 친절한 최고의 트레이너님이에요!`,
      review_star: 5,
      member_name: "한지우",
      member_image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDUiIGhlaWdodD0iNDUiIHZpZXdCb3g9IjAgMCA0NSA0NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjIuNSIgY3k9IjIyLjUiIHI9IjIyLjUiIGZpbGw9IiNGRUY5RjMiLz4KPGNpcmNsZSBjeD0iMjIuNSIgY3k9IjE3IiByPSI4IiBmaWxsPSIjNjM2NjZGIi8+CjxwYXRoIGQ9Ik0zNiA0MEMzNiAzMi4yNjggMjkuNzMyIDI2IDIyIDI2UzggMzIuMjY4IDggNDBIMzZaIiBmaWxsPSIjNjM2NjZGIi8+Cjwvc3ZnPgo=",
    },
    {
      matching_idx: 8,
      review_title: "요요 없는 건강한 다이어트",
      review_content: `신영희 트레이너님께 3개월 PT 받고 완전히 달라진 제 모습에 스스로도 놀라고 있어요. 특히 식단 관리와 운동의 밸런스를 맞춰주셔서 요요 현상 없이 건강하게 체중 관리하고 있습니다. 주변에서 어떻게 그렇게 예뻐졌냐고 물어볼 정도로 확실한 변화가 있었어요. 정말 추천합니다!`,
      review_star: 5,
      member_name: "오나경",
      member_image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDUiIGhlaWdodD0iNDUiIHZpZXdCb3g9IjAgMCA0NSA0NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjIuNSIgY3k9IjIyLjUiIHI9IjIyLjUiIGZpbGw9IiNGRkYzRjMiLz4KPGNpcmNsZSBjeD0iMjIuNSIgY3k9IjE3IiByPSI4IiBmaWxsPSIjRjIzQTNBIi8+CjxwYXRoIGQ9Ik0zNiA0MEMzNiAzMi4yNjggMjkuNzMyIDI2IDIyIDI2UzggMzIuMjY4IDggNDBIMzZaIiBmaWxsPSIjRjIzQTNBIi8+Cjwvc3ZnPgo=",
    },
    {
      matching_idx: 9,
      review_title: "4개월 만에 마라톤 완주!",
      review_content: `이동현 트레이너님과 함께한 PT는 정말 최고의 선택이었어요! 운동 초보인 저에게 맞는 단계별 프로그램을 짜주시고, 매번 격려해주시면서 동기부여를 해주셔서 포기하지 않고 꾸준히 할 수 있었습니다. 4개월 만에 마라톤 완주까지 할 수 있게 되었어요. 정말 감사드려요!`,
      review_star: 5,
      member_name: "임태영",
      member_image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDUiIGhlaWdodD0iNDUiIHZpZXdCb3g9IjAgMCA0NSA0NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjIuNSIgY3k9IjIyLjUiIHI9IjIyLjUiIGZpbGw9IiNGRkZCRTgiLz4KPGNpcmNsZSBjeD0iMjIuNSIgY3k9IjE3IiByPSI4IiBmaWxsPSIjRUNCMzA5Ii8+CjxwYXRoIGQ9Ik0zNiA0MEMzNiAzMi4yNjggMjkuNzMyIDI2IDIyIDI2UzggMzIuMjY4IDggNDBIMzZaIiBmaWxsPSIjRUNCMzA5Ii8+Cjwvc3ZnPgo=",
    },
    {
      matching_idx: 10,
      review_title: "체계적인 운동의 힘",
      review_content: `김소연 트레이너님께 PT 받으면서 운동이 이렇게 체계적일 수 있다는 걸 처음 알았어요. 매 세션마다 목표를 정하고 달성해나가는 과정이 너무 보람찼고, 실시간 피드백으로 올바른 자세를 익힐 수 있어서 효과가 배가 되었습니다. FitSync 플랫폼도 사용하기 편리해서 운동 기록 관리가 정말 쉬웠어요!`,
      review_star: 5,
      member_name: "유하늘",
      member_image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDUiIGhlaWdodD0iNDUiIHZpZXdCb3g9IjAgMCA0NSA0NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjIuNSIgY3k9IjIyLjUiIHI9IjIyLjUiIGZpbGw9IiNGRUY0RjAiLz4KPGNpcmNsZSBjeD0iMjIuNSIgY3k9IjE3IiByPSI4IiBmaWxsPSIjRDA2NzFGIi8+CjxwYXRoIGQ9Ik0zNiA0MEMzNiAzMi4yNjggMjkuNzMyIDI2IDIyIDI2UzggMzIuMjY4IDggNDBIMzZaIiBmaWxsPSIjRDA2NzFGIi8+Cjwvc3ZnPgo=",
    },
  ];

  const duplicatedSlides = [...baseSlides];

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
      <style>{`
        .mySwiper .swiper-wrapper {
          transition-timing-function: linear !important;
        }
      `}</style>
      <Swiper
        modules={[Autoplay]}
        slidesPerView={1.2}
        centeredSlides={true}
        loop={true}
        spaceBetween={15}
        speed={7500}
        effect="slide"
        autoplay={{
          delay: 0,
          disableOnInteraction: false,
        }}
        allowTouchMove={true}
        className="mySwiper"
        style={{ padding: '30px' }}
        onMouseEnter={swiper => swiper.autoplay && swiper.autoplay.stop()}
        onMouseLeave={swiper => swiper.autoplay && swiper.autoplay.start()}
      >
        {duplicatedSlides.map((slide, idx) => (
          <SwiperSlide key={idx}>
            <div ref={el => (slideRefs.current[idx] = el)}>
              <Review
                review={slide}
                height={maxHeight}
                showReportButton={false}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ReviewList;
