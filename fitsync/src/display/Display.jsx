import React, { useEffect, useState, useRef } from 'react';
import Header from '../layout/Header';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Main from '../components/Main';
import IsLoading from '../components/IsLoading';
import styled from 'styled-components';
import Nav from '../layout/Nav';
import TrainerSearch from '../components/trainer/TrainerSearch';
import RoutineView from '../components/routine/RoutineView';
import RoutineAdd from '../components/routine/RoutineAdd';
import RoutineSet from '../components/routine/RoutineSet';
import RoutineMain from '../components/routine/RoutineMain';
import Login from '../components/member/Login';
import googleAuthManager from '../utils/googleAuth';
import TrainerMain from '../components/trainer/TrainerMain';
import TrainerDetailView from '../components/trainer/TrainerDetailView';
import Register from '../components/member/Register';
import AItest from '../components/admin/AItest';
import MyPage from '../components/user/MyPage';
import ChatMain from '../components/chat/ChatMain';
import ChatRoom from '../components/chat/ChatRoom';
import AdminApiContainer from '../components/admin/AdminApiContainer';
import AdminMain from '../components/admin/AdminMain';
import RoutineDetail from '../components/routine/RoutineDetail';
import BarbellLoading from '../components/BarbellLoading';
import AiServiceContainer from '../components/ai/AiServiceContainer';
import ChatLoading from '../components/ChatLoading';
import Timer from '../components/Timer';
import SlideInputFormTest from '../components/ai/test/SlideInputFormTest';
import KaKaoPayTest from '../components/payment/test/KaKaoPayTest';
import SubscriptionContainer from '../components/subscription/SubscriptionContainer';
import SubscriptionMain from '../components/subscription/SubscriptionMain';
import SubscriptionPaymentMethods from '../components/subscription/SubscriptionPaymentMethods';
import SubscriptionPaymentHistory from '../components/subscription/SubscriptionPaymentHistory';
import SideNav from '../layout/SideNav';
import Report from '../components/admin/Report';
import BodyInputForm from '../components/user/BodyInputForm';
import Awards from '../components/admin/Awards';
import ResponseResultPage from '../components/ai/test/ResponseResultPage';
import AIWorkoutService from '../components/ai/test/AIWorkoutService';
import Gym from '../components/admin/Gym';
import WorkOut from '../components/admin/WorkOut';
import WorkoutView from '../components/routine/WorkoutView';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser, setUser } from '../action/userAction';
import UserApiLogContainer from '../components/ai/UserApiLogContainer';

const DisplayWrapper = styled.div`
  ${props => props.$isAdmin ? '' : 'max-width: 750px;'}
  width: 100%;
  margin: 0 auto;
  position: relative;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-primary); /* CSS 변수 사용 */
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
`;

const DisplayInnner = styled.div`
  position: relative;
  overflow: auto;
  height: ${props => props.$isAdmin ? '100%' : 'calc( 100vh - 150px )'};
  background: var(--bg-primary);
  margin-top : ${(props) => (props.$isShow ? '0' : '65px')};
`;

const Display = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);
  const [isOpen, setIsOpen] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    // 앱 시작 시 Google API 미리 로드
    initializeApp();
  }, []);

  useEffect(() => {
    // 로그인 상태일 때만 인증 확인 타이머 시작
    if (user.isLogin) {
      startAuthCheck();
    } else {
      stopAuthCheck();
    }

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      stopAuthCheck();
    };
  }, [user.isLogin]);

  const initializeApp = async () => {
    try {
      // Google API 스크립트 미리 로드 (백그라운드에서)
      await googleAuthManager.loadScript();
    } catch (error) {
      console.error('앱 초기화 실패:', error);
    }
  };

  const startAuthCheck = () => {
    // 기존 타이머가 있다면 정리
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // 30분마다 인증 확인
    intervalRef.current = setInterval(async () => {
      try {
        const response = await axios.get('/auth/check', { 
          withCredentials: true,
          timeout: 10000 // 10초 타임아웃
        });

        if (!response.data.isLogin) {
          // 로그인이 만료된 경우
          alert('로그인이 만료되었습니다. 다시 로그인해주세요.');

          dispatch(logoutUser());

          // 로그인 페이지로 이동
          navigate('/login');
          
          // 타이머 정지
          stopAuthCheck();
        }
      } catch (error) {
        console.error('인증 확인 중 오류:', error);
        
        // 네트워크 오류나 서버 오류 시에는 경고만 표시
        if (error.code === 'ECONNABORTED') {
          console.warn('인증 확인 요청 타임아웃');
        } else if (error.response?.status === 401) {
          // 401 오류 시 로그아웃 처리
          alert('세션이 만료되었습니다. 다시 로그인해주세요.');
          
          dispatch(logoutUser());

          navigate('/login');
          stopAuthCheck();
        }
        // 다른 오류는 무시 (서버 일시적 장애 등)
      }
    }, 30 * 60 * 1000); // 30분마다
  };

  const stopAuthCheck = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const isShow =
    !location.pathname.includes("/routine/detail") &&
    location.pathname !== '/routine/add' &&
    location.pathname !== '/routine/set' &&
    location.pathname !== '/test123';

  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <DisplayWrapper $isAdmin={isAdmin}>
      {isShow && <Header setIsOpen={setIsOpen} />}
      {isOpen ? <SideNav setIsOpen={setIsOpen} /> : <></>}

      <DisplayInnner $isShow={isShow} $isAdmin={isAdmin}>
        <Routes>
          <Route path='/' element={<Main />} />
          <Route path='/login' element={<Login />} />
          <Route path='/Register' element={<Register />} />
          <Route path="/body/input" element={<BodyInputForm />} />
          <Route path='/trainer/:trainerIdx' element={<TrainerMain />} />
          <Route path='/trainer/view/:trainerIdx' element={<TrainerDetailView />} />
          <Route path='/trainer/search' element={<TrainerSearch />} />
          <Route path='/routine' element={<RoutineMain />}>
            <Route path='view' element={<RoutineView />} />
            <Route path='add' element={<RoutineAdd />} />
            <Route path='set' element={<RoutineSet />} />
            <Route path='detail/:routine_list_idx' element={<RoutineDetail />} />
          </Route>
          <Route path='/mypage' element={<MyPage />} />
          <Route path='/chat' element={<ChatMain />} />
          <Route path='/chat/:roomId' element={<ChatRoom />} />
          <Route path='/loading' element={<IsLoading />} />
          <Route path='/BarbellLoading' element={<BarbellLoading />} />
          <Route path='/ChatLoading' element={<ChatLoading />} />
          <Route path='/Timer' element={<Timer />} />
          <Route path='/workout/:ptId' element={<WorkoutView key={location.pathname} />} />

          <Route path='/ai' element={<AiServiceContainer />}>
          </Route>
          <Route path='/ai/test/input' element={<SlideInputFormTest />} />
          <Route path='/ai/test/result' element={<ResponseResultPage resultData={{}} />} />
          <Route path='/ai/test/total' element={<AIWorkoutService />} />
          <Route path='/ai/userLog' element={<UserApiLogContainer />} />

          <Route path='/subscription' element={<SubscriptionContainer />}>
            <Route path='test' element={<KaKaoPayTest />} />
            <Route index element={<SubscriptionMain />} />
            <Route path='methods' element={<SubscriptionPaymentMethods />} />
            <Route path='history' element={<SubscriptionPaymentHistory />} />
          </Route>

          <Route path='/admin' element={<AdminMain />}>
            <Route path='workout' element={<WorkOut />} />
            <Route path='report' element={<Report />} />
            <Route path='awards' element={<Awards />} />
            <Route path='ai' element={<AItest />} />
            <Route path='api' element={<AdminApiContainer />} />
            <Route path='gym' element={<Gym />} />
          </Route>

        </Routes>
      </DisplayInnner>
      {isShow && !isAdmin && <Nav />}
    </DisplayWrapper>
  );
};

export default Display;