import PortOne from "@portone/browser-sdk/v2";

export const KAKAOPAY = "KAKAOPAY";
export const TOSSPAYMENTS = "TOSSPAYMENTS";

/** 결제수단 필요정보 매핑 */
const paymentMethodInfo = {
    KAKAOPAY: {channelKey: process.env.REACT_APP_PORTONE_KAKAOPAY_KEY, billingKeyMethod: "EASY_PAY"},
    TOSSPAYMENTS: {channelKey: process.env.REACT_APP_PORTONE_TOSSPAYMENTS_KEY, billingKeyMethod: "CARD",},
};

/** 빌링키 등록 */
const issueBillingKey = async (e) => {
    const {name} = e.target;
    const inputInfo = paymentMethodInfo[name];

    e.preventDefault();

    const result = await PortOne.requestIssueBillingKey({
        ...inputInfo,
        storeId: process.env.REACT_APP_PORTONE_STORE_ID,
        issueName : "fitsync",
        redirectUrl: "https://localhost:3000/payment/kakao",
    }); 

    console.log("결제 요청 결과:", result);
};

export const PaymentUtil = {
    issueBillingKey : issueBillingKey,
}