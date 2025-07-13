import React, { useState } from 'react';
import { ButtonSubmit } from '../../../styles/FormStyles';
import axios from 'axios';
import PortOne from "@portone/browser-sdk/v2";

const KaKaoPayTest = () => {
    const [item, setItem] = useState(null);

    const [paymentStatus, setPaymentStatus] = useState({
        status: "IDLE",
    });

    // 카카오 페이 결제 요청 테스트
    const handlePaymentRequest = () => {
        axios.post('/kakaoPay/ready')
        .then(response => {
            console.log('결제 요청 성공:', response.data);
        })
        .catch(error => {
            console.error('결제 요청 실패:', error);
        });
    };

function randomId() {
    return [...crypto.getRandomValues(new Uint32Array(2))]
        .map((word) => word.toString(16).padStart(8, "0"))
        .join("");
}

const handlePortOneTest = async (e) => {
    e.preventDefault();

    setPaymentStatus({ status: "PENDING" });

    const paymentId = randomId();

    const payment = await PortOne.requestPayment({
        storeId: "store-da3337d3-86d4-4ad6-9dff-4e548785f3b4",
        channelKey: "channel-key-c54dccb2-192f-40f8-82e1-c9da6d6522af",
        paymentId,
        orderName: "구독권",
        totalAmount: 3000,
        currency: "CURRENCY_KRW",
        payMethod: "EASY_PAY",
        customData: {item: 0},
        redirectUrl: "https://localhost:3000/payment/kakao",
    }); 

    console.log("결제 요청 결과:", payment);
    

    if (payment.code !== undefined) {
        setPaymentStatus({
        status: "FAILED",
        message: payment.message,
        });
        return;
    }

    const completeResponse = await axios.post("/kakaoPay/portone/complete", {
        paymentId: payment.paymentId,
    });

    if (completeResponse.status === 200) {
        const paymentComplete = await completeResponse;
        console.log("결제 완료:", paymentComplete);
        
        setPaymentStatus({
        status: paymentComplete,
        });
    } else {
        setPaymentStatus({
        status: "FAILED",
        message: await completeResponse.data,
        });
    }
};

const handlePortOneBillingTest = async () => {
    const issueResponse = await PortOne.requestIssueBillingKey({
        storeId: "store-da3337d3-86d4-4ad6-9dff-4e548785f3b4",
        channelKey: "channel-key-6bcdb814-9d86-4f3d-b773-f60a832493d7",
        billingKeyMethod: "CARD",
    });
    console.log("빌링키 발급 결과:", issueResponse);
    // 빌링키가 제대로 발급되지 않은 경우 에러 코드가 존재합니다
    if (issueResponse.code !== undefined) {
        return alert(issueResponse.message);
    }
    // 고객사 서버에 빌링키를 전달합니다
    const response = await fetch(`/kakaoPay/portone/billing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            billingKey: issueResponse.billingKey,
            // ...
        }),
    });
    if (!response.ok) throw new Error(`response: ${await response.json()}`);
}

/** 빌링키 결제 */
const handlePortOneBillingPaymentTest = async () => {
    try {
        const paymentId = randomId();
        console.log("Generated Payment ID:", paymentId);

        const response = await axios.post('/payment/bill/pay', {
            paymentId,
        });
        
        console.log("빌링키 결제 응답 상태:", response.status);
        console.log("빌링키 결제 결과:", response.data);
        
        // 응답 데이터 구조 확인
        if (response.data.success) {
            console.log("✅ 결제 성공!");
            console.log("결제 데이터:", response.data.data);
            alert("결제가 성공적으로 완료되었습니다!");
        } else {
            console.log("❌ 결제 실패!");
            console.log("실패 원인:", response.data.message);
            alert(`결제 실패: ${response.data.message}`);
        }
        
    } catch (error) {
        console.error("빌링키 결제 요청 중 오류 발생:", error);
        
        if (error.response) {
            // 서버에서 응답을 받았지만 에러 상태
            console.log("에러 상태 코드:", error.response.status);
            console.log("에러 응답 데이터:", error.response.data);
            alert(`서버 오류: ${error.response.data?.message || '알 수 없는 오류'}`);
        } else if (error.request) {
            // 요청은 전송되었지만 응답을 받지 못함
            console.log("요청이 전송되었지만 응답을 받지 못함:", error.request);
            alert("서버에서 응답이 없습니다. 네트워크를 확인해주세요.");
        } else {
            // 요청 설정 중 오류 발생
            console.log("요청 설정 오류:", error.message);
            alert(`요청 오류: ${error.message}`);
        }
    }
}

    return (
        <div>
            <ButtonSubmit onClick={handlePaymentRequest}>결제 요청</ButtonSubmit>
            <ButtonSubmit onClick={handlePortOneTest} name='KAKAOPAY'>포트원 테스트</ButtonSubmit>
            <ButtonSubmit onClick={handlePortOneBillingTest} name='KAKAOPAY'>빌링키 발급 테스트</ButtonSubmit>
            <ButtonSubmit onClick={handlePortOneBillingPaymentTest} name='KAKAOPAY'>빌링키 테스트</ButtonSubmit>
        </div>
    );
};

export default KaKaoPayTest;