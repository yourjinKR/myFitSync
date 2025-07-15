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
/** 빌링키 발급 */
const issueBillingKey = async (name) => {
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
        console.log("빌링키 발급 실패:", result);
        return null;
    }

    console.log("발급 요청 결과:", result);
    return result;
};

/** 결제수단 DB 저장 (빌링키) */
const saveBillingKey = async ({method_key, method_provider}) => {
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

        console.log('빌링키 저장 성공:', response.data);
        return response.data;
        
    } catch (error) {
        console.error('Error saving billing key:', error);
        throw error;
    }
};

/** 내 결제수단 불러오기 */
const getBillingKeys = async () => {
    try {
        const response = await axios.get('/payment/bill/list', 
            { 
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('결제수단 목록 조회 성공:', response.data);
        return response.data;
        
    } catch (error) {
        console.error('Error fetching payment methods:', error);
        throw error;
    }
};

/** 결제수단 기본 이름 설정 (PC사 + ) */
const setDefaultPaymentMethodName = (provider) => {
    switch (provider) {
        case KAKAOPAY:
            return "카카오페이";
        case TOSSPAYMENTS:
            return "토스페이먼츠";
        default:
            return "기타 결제수단";
    }
};

/** 결제수단명 이름 변경 */
const renameBillingKey = async ({method_idx, method_name}) => {
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

        console.log('결제수단 이름 변경 성공:', response.data);
        return response.data;
        
    } catch (error) {
        console.error('Error renaming payment method:', error);
        throw error;
    }
};

/** 결제수단 삭제 */
const deletePaymentMethod = async (method_idx) => {
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

        console.log('결제수단 삭제 성공:', response.data);
        return response.data;
        
    } catch (error) {
        console.error('Error deleting payment method:', error);
        throw error;
    }
};

/** 빌링키 결제 */
const payBillingKey = async (method) => {
    const { method_idx, method_provider, member_idx } = method;
    const payment_id = randomId();

    try {
        const response = await axios.post('/payment/bill/pay', {
            payment_id,
            method_idx,
            method_provider,
            member_idx,
        }, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('빌링키 결제 성공:', response);
        return response.data;
    } catch (error) {
        
    }
}

export const PaymentUtil = {
    issueBillingKey : issueBillingKey,
    saveBillingKey : saveBillingKey,
    getBillingKeys : getBillingKeys,
    renameBillingKey : renameBillingKey,
    deletePaymentMethod : deletePaymentMethod,
    setDefaultPaymentMethodName : setDefaultPaymentMethodName,
    payBillingKey : payBillingKey,
}