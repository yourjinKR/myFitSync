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
import AiRoutineServiceContainer from '../components/ai/AiRoutineServiceContainer';
import { useWebSocket } from '../hooks/UseWebSocket';

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

  // 컴포넌트가 마운트될 때 로그인 상태를 한 번 확인하고 그 이후에만 WebSocket 훅 사용
  const [isInitialLoginChecked, setIsInitialLoginChecked] = useState(false);
  const [shouldUseWebSocket, setShouldUseWebSocket] = useState(false);

  // 초기 로그인 상태 확인
  useEffect(() => {
    if (!isInitialLoginChecked) {
      // Redux 상태에서 로그인 여부 확인
      const isLoggedIn = user && user.isLogin;
      setShouldUseWebSocket(isLoggedIn);
      setIsInitialLoginChecked(true);
    }
  }, [user, isInitialLoginChecked]);

  // 로그인 상태 변경 시 WebSocket 사용 여부 업데이트
  useEffect(() => {
    if (isInitialLoginChecked) {
      const isLoggedIn = user && user.isLogin;
      setShouldUseWebSocket(isLoggedIn);
    }
  }, [user?.isLogin, isInitialLoginChecked]);

  // 조건부 WebSocket 훅 사용
  const webSocketResult = useWebSocket(shouldUseWebSocket);
  const disconnectWebSocket = webSocketResult?.disconnect || null;
  const connected = webSocketResult?.connected || false;

  useEffect(() => {
    // 앱 시작 시 Google API 미리 로드
    initializeApp();
  }, []);

  useEffect(() => {
    // 로그인 상태일 때만 인증 확인 타이머 시작
    if (user && user.isLogin) {
      startAuthCheck();
    } else {
      stopAuthCheck();
      // 로그아웃 시 WebSocket 연결 해제
      if (disconnectWebSocket) {
        disconnectWebSocket();
        
        // 세션 스토리지도 함께 정리
        sessionStorage.removeItem('chat_member_idx');
      }
    }

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      stopAuthCheck();
    };
  }, [user?.isLogin, disconnectWebSocket]);

  const initializeApp = async () => {
    try {
      // Google API 스크립트 미리 로드 (백그라운드에서)
      await googleAuthManager.loadScript();
    } catch (error) {
      console.error('앱 초기화 실패:', error);
    }
  };

  // 인증 확인 함수
  const startAuthCheck = () => {
    // 기존 타이머가 있다면 정리
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // 30분마다 인증 확인
    intervalRef.current = setInterval(async () => {
      try {
        const response = await axios.get('/member/check', { 
          withCredentials: true,
          timeout: 10000, // 10초 타임아웃
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        // 응답 검증
        if (!response.data || typeof response.data !== 'object') {
          throw new Error('Invalid response format');
        }

        if (!response.data.isLogin) {
          // 로그인이 만료된 경우 WebSocket 연결 해제
          if (disconnectWebSocket) {
            disconnectWebSocket();
          }

          // 세션 스토리지 정리
          sessionStorage.removeItem('chat_member_idx');
          
          alert('로그인이 만료되었습니다. 다시 로그인해주세요.');

          // 로그아웃 처리
          dispatch(logoutUser());

          // 로그인 페이지로 이동
          navigate('/login');
          
          // 타이머 정지
          stopAuthCheck();
        }
      } catch (error) {
        // 에러 타입별 처리
        if (error.code === 'ECONNABORTED') {
          // 타임아웃은 일시적 문제일 수 있으므로 로그만 출력
          console.warn('인증 확인 요청 타임아웃');
        } else if (error.response?.status === 401) {
          // 401 오류 시
          if (disconnectWebSocket) {
            disconnectWebSocket();
          }

          sessionStorage.removeItem('chat_member_idx');
          alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
          dispatch(logoutUser());
          navigate('/login');
          stopAuthCheck();
        } else if (error.message === 'Invalid response format') {
          // HTML 응답을 받은 경우 (로그인 페이지 리다이렉트)
          if (disconnectWebSocket) {
            disconnectWebSocket();
          }
          
          sessionStorage.removeItem('chat_member_idx');
          dispatch(logoutUser());
          navigate('/login');
          stopAuthCheck();
        }
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

          <Route path='/ai/routine' element={<AiRoutineServiceContainer />}/>
          <Route path='/ai/userLog' element={<UserApiLogContainer />} />

          <Route path='/ai/test/input' element={<SlideInputFormTest />} />
          <Route path='/ai/test/result' element={<ResponseResultPage resultData={{}} />} />
          <Route path='/ai/test/total' element={<AIWorkoutService />} />

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