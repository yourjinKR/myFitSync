import PortOne from "@portone/browser-sdk/v2";
import axios from "axios";

export const KAKAOPAY = "KAKAOPAY";
export const TOSSPAYMENTS = "TOSSPAYMENTS";

/** 난수 return 함수 (paymentId 전용)  */
export const randomId = () => {
    return [...crypto.getRandomValues(new Uint32Array(2))]
        .map((word) => word.toString(16).padStart(8, "0"))
        .join("");
}

/** 결제수단 필요정보 매핑 */
const paymentMethodInfo = {
    KAKAOPAY: {channelKey: process.env.REACT_APP_PORTONE_KAKAOPAY_KEY, billingKeyMethod: "EASY_PAY", },
    TOSSPAYMENTS: {channelKey: process.env.REACT_APP_PORTONE_TOSSPAYMENTS_KEY, billingKeyMethod: "CARD", },
};
// easyPay : {availableCards : ["CARD_COMPANY_SHINHAN_CARD"]}

export const PaymentUtil = {
    /** 빌링키 발급 */
    issueBillingKey : async (name) => {
        const inputInfo = paymentMethodInfo[name];

        const result = await PortOne.requestIssueBillingKey({
            ...inputInfo,
            storeId: process.env.REACT_APP_PORTONE_STORE_ID,
            issueName : "fitsync",
            displayAmount : 3000,
            currency : "CURRENCY_KRW",
            redirectUrl: "https://localhost:3000/payment/kakao",
        });

        if (result.code) {
            return null;
        }

        return result;
    },

    /** 결제수단 DB 저장 (빌링키) */
    saveBillingKey : async ({method_key, method_provider}) => {
        try {
            const response = await axios.post('/payment/bill/issue', 
                {
                    method_key: method_key,
                    method_provider: method_provider,
                    method_name: PaymentUtil.setDefaultPaymentMethodName(method_provider),
                },
                { 
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
            
        } catch (error) {
            console.error('Error saving billing key:', error);
            throw error;
        }
    },

    /** 내 결제수단 불러오기 */
    getBillingKeys : async () => {
        try {
            const response = await axios.get('/payment/bill/list', 
                { 
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
            
        } catch (error) {
            console.error('Error fetching payment methods:', error);
            throw error;
        }
    },

    /** 빌링키 정보 가져오기 */
    getBillingKeyInfo : async ({method_idx}) => {
        try {
            const response = await axios.post('/payment/bill/info',
                {method_idx},
                { withCredentials: true,
                    headers: {'Content-Type': 'application/json'}
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching billing key info:', error);
            throw error;
        }
    },

    /** 결제수단 기본 이름 설정 (PC사 + ) */
    setDefaultPaymentMethodName : (provider) => {
        switch (provider) {
            case KAKAOPAY:
                return "카카오페이";
            case TOSSPAYMENTS:
                return "토스페이먼츠";
            default:
                return "기타 결제수단";
        }
    },

    /** 결제수단명 이름 변경 */
    renameBillingKey : async ({method_idx, method_name}) => {
        try {
            const response = await axios.patch('/payment/bill/rename', 
                {
                    method_idx: method_idx,
                    method_name: method_name
                },
                { 
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
            
        } catch (error) {
            console.error('Error renaming payment method:', error);
            throw error;
        }
    },

    /** 결제수단 삭제 */
    deletePaymentMethod : async (method_idx) => {
        try {
            const response = await axios.delete('/payment/bill/delete', 
                {
                    data: {
                        method_idx: method_idx
                    },
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
            
        } catch (error) {
            console.error('Error deleting payment method:', error);
            throw error;
        }
    },

    /** 결제수단 등록 전 중복 체크 */
    checkDuplicatePaymentMethod: async (billingKey) => {
        try {
            const response = await axios.post('/payment/bill/check', {
                billing_key: billingKey
            }, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
            
        } catch (error) {
            console.error('중복 체크 중 오류:', error);
            throw error;
        }
    },

    /** 중복 처리 후 결제수단 저장 */
    saveBillingKeyWithDuplicateHandling: async ({ billing_key, method_provider, method_name, replace_existing }) => {
        try {
            const response = await axios.post('/payment/bill/save', {
                billing_key,
                method_provider,
                method_name,
                replace_existing
            }, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
            
        } catch (error) {
            console.error('중복 처리 후 저장 중 오류:', error);
            throw error;
        }
    },

    /** 빌링키 결제 */
    payBillingKey : async ({ method_idx, method_provider, member_idx }) => {
        const payment_id = randomId();

        try {
            const response = await axios.post('/payment/bill/pay', {
                payment_id,
                method_idx,
            }, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('빌링키 결제 중 오류:', error);
            throw error;
        }
    },

    /** 사용자별 결제 내역 조회 */
    getPaymentHistory: async () => {
        try {
            const response = await axios.get('/payment/history/v2', {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
            
        } catch (error) {
            console.error('결제 내역 조회 중 오류:', error);
            
            if (error.response) {
                console.error('서버 응답 오류:', error.response.data);
                throw new Error(`서버 오류: ${error.response.data?.message || error.response.status}`);
            } else if (error.request) {
                console.error('네트워크 오류:', error.request);
                throw new Error('네트워크 오류가 발생했습니다. 연결을 확인해주세요.');
            } else {
                console.error('기타 오류:', error.message);
                throw new Error(`오류: ${error.message}`);
            }
        }
    },

    /** 빌링키 결제 예약 */
    scheduleBillingKey: async ({ method_idx, schedule_datetime }) => {
        const payment_id = randomId();
        try {
            const response = await axios.post('/payment/bill/schedule', {
                payment_id,
                method_idx,
                schedule_datetime
            }, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
            
        } catch (error) {
            console.error('빌링키 결제 예약 중 오류:', error);
            throw error;
        }
    },

    /** 결제 예약 취소 */
    cancelScheduledPayment: async (order_idx) => {
        try {
            const response = await axios.delete('/payment/bill/schedule', {
                data: {
                    order_idx: order_idx
                },
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
            
        } catch (error) {
            console.error('결제 예약 취소 중 오류:', error);
            
            if (error.response) {
                console.error('서버 응답 오류:', error.response.data);
                throw new Error(`서버 오류: ${error.response.data?.message || error.response.status}`);
            } else if (error.request) {
                console.error('네트워크 오류:', error.request);
                throw new Error('네트워크 오류가 발생했습니다. 연결을 확인해주세요.');
            } else {
                console.error('기타 오류:', error.message);
                throw new Error(`오류: ${error.message}`);
            }
        }
    },

    /** 예약 내역 조회 */
    consultScheduledPayment: async () => {
        try {
            const response = await axios.get('/payment/bill/schedule', {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
            
        } catch (error) {
            console.error('예약 내역 조회 중 오류:', error);
            
            if (error.response) {
                console.error('서버 응답 오류:', error.response.data);
                throw new Error(`서버 오류: ${error.response.data?.message || error.response.status}`);
            } else if (error.request) {
                console.error('네트워크 오류:', error.request);
                throw new Error('네트워크 오류가 발생했습니다. 연결을 확인해주세요.');
            } else {
                console.error('기타 오류:', error.message);
                throw new Error(`오류: ${error.message}`);
            }
        }
    },

    /** 구독자 판별 */
    checkSubscriptionStatus: async (member_idx) => {
        try {
            const response = await axios.get(`/payment/subscription/${member_idx}`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
            
        } catch (error) {
            console.error('구독자 상태 조회 중 오류:', error);
            throw error;
        }
    },

    /** 모니터링 테스트 */
    testPaymentMonitor: async () => {
        try {
            const response = await axios.post('/payment/monitor/manual', {}, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
            
        } catch (error) {
            console.error('모니터링 테스트 중 오류:', error);
            throw error;
        }
    },

    /** 가장 최근 내역 1개*/
    getRecentHistory : async () => {
        try {
            const response = await axios.get('/payment/history/recent', {}, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
            
        } catch (error) {
            console.error('가장 최근 결제건 불러오기 오류:', error);
            throw error;
        }
    },

    /** 기존의 예약의 결제수단 바꾸기 */
    changeSchedulePaymentMethod : async ({order_idx, method_idx}) => {
        try {
            const response = await axios.patch('/payment/bill/schedule', {order_idx, method_idx}, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
            
        } catch (error) {
            console.error('결제수단 변경 실패 :', error);
            throw error;
        }
    },

    /** 구독 재연장 */
    reschedule : async ({recentOrder}) => {
        try {
            const response = await axios.post('/payment/bill/reschedule', {recentOrder}, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
            
        } catch (error) {
            console.error('구독 재연장 실팽 :', error);
            throw error;
        }
    },

    /** 구독자 수 불러오기 */ 
    getSubscriberNow : async () => {
        try {
            const response = await axios.get('/admin/subscription/count');

            return response.data;

        } catch (error) {
            console.error('구독자 수 불러오지 못함 :', error);
            throw error;
        }
    },
}


  // FAQ 데이터
export const initFaqData = [
    {
      id: 1,
      question: "구독시 어떤 혜택이 포함되어 있나요?",
      answer: (
        <>
          <p>FitSync Premium은 AI가 추천하는 맞춤형 운동 루틴, 루틴 일정 자동 생성, 운동 피드백 기능 등을 제공합니다.</p>
          <p>기본 사용자보다 더 정교한 분석과 코칭을 받을 수 있으며, 트레이너 매칭 기능도 강화됩니다.</p>
          <p>운동 목적에 따라 최적화된 루틴을 받아볼 수 있어 효율적인 운동이 가능합니다.</p>
          <p>월 정액제로 모든 프리미엄 기능을 자유롭게 이용할 수 있습니다.</p>
        </>
      )
    },
    {
      id: 2,
      question: "루틴추천과 일정관리는 어떻게 만들어지나요?",
      answer: (
        <>
          <p>AI가 사용자의 목표, 신체 부위 선호도, 운동 수준 등을 분석해 루틴을 추천합니다.</p>
          <p>추천 루틴은 자동으로 주간 스케줄에 배정되며, 원하는 요일이나 시간대로 조정도 가능합니다.</p>
          <p>사용자가 피드백을 남기면 다음 추천에 반영되어 점점 더 개인화된 루틴이 생성됩니다.</p>
          <p>불필요한 루틴은 삭제하거나 새로 요청할 수 있습니다.</p>
        </>
      )
    },
    {
      id: 3,
      question: "결과는 어디서 확인하나요?",
      answer: (
        <>
          <p>추천된 루틴과 일정은 [루틴 관리] 탭에서 확인할 수 있습니다.</p>
          <p>완료한 운동 기록은 자동 저장되며, 지난 운동 이력도 한눈에 확인 가능합니다.</p>
          <p>루틴별 세트 구성과 피드백 내역도 함께 제공되어 트레이닝 성과를 추적할 수 있습니다.</p>
          <p>기록은 구독 종료 후에도 유지됩니다.</p>
        </>
      )
    },
    {
      id: 4,
      question: "구독 해지는 어떻게 하나요?",
      answer: (
        <>
          <p>[구독 관리] 화면에서 '구독 해지' 버튼을 통해 언제든지 해지할 수 있습니다.</p>
          <p>해지하더라도 남은 기간 동안은 프리미엄 혜택을 계속 이용할 수 있습니다.</p>
          <p>구독 기간이 끝나면 자동으로 프리미엄 기능이 종료됩니다.</p>
          <p>필요 시 다시 구독을 재개할 수 있습니다.</p>
        </>
      )
    }
  ];
