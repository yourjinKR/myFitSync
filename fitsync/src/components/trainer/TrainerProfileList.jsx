import React from 'react';
import TrainerProfile from './TrainerProfile';
import styled from 'styled-components';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/free-mode';
import { FreeMode } from 'swiper/modules';

const ProfileListWrapper = styled.div`
  padding: 15px;
  border-bottom:1px solid #ccc;
`;

const TrainerProfileList = () => {
  const arr = [1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5];

  return (
    <ProfileListWrapper>
      <Swiper
        slidesPerView={'auto'}  // 자동 너비에 맞춰서 슬라이드 크기 조절
        freeMode={true}
        spaceBetween={30}        // 간격 없애기
        className="mySwiper"
        modules={[FreeMode]}
      >
        {arr.map((el) => (
          <SwiperSlide
            key={el}
            style={{ width: 'auto' }}  // 각 슬라이드가 컨텐츠 크기만큼만 너비 가지도록
          >
            <TrainerProfile idx={el} />
          </SwiperSlide>
        ))}
      </Swiper>
    </ProfileListWrapper>
  );
};

export default TrainerProfileList;
