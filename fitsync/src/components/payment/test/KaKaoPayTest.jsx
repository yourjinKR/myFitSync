import React, { use, useEffect, useState } from 'react';
import { ButtonSubmit } from '../../../styles/FormStyles';
import axios from 'axios';
import { KAKAOPAY, PaymentUtil, TOSSPAYMENTS } from '../../../utils/PaymentUtil';

const initwallet = {
    method_idx : null,
    member_idx : null,
    method_key : null,
    method_provider : null,
    method_name : "결제수단을 등록해주세요",
    method_regdate : null
};

const KaKaoPayTest = () => {
    const [wallet, setWallet] = useState([initwallet]);

    /** 난수 return 함수 (paymentId 전용)  */
    const randomId = () => {
        return [...crypto.getRandomValues(new Uint32Array(2))]
            .map((word) => word.toString(16).padStart(8, "0"))
            .join("");
    }

    /** 빌링키 결제 */
    const handlePortOneBillingPaymentTest = async () => {
        try {
            const payment_id = randomId();
            console.log("Generated Payment ID:", payment_id);

            const response = await axios.post('/payment/bill/pay', {
                payment_id,
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

    /** 빌링키 발급 및 저장 */
    const billingKey = async (e) => {
        const { name } = e.target;
        e.preventDefault();

        try {
            const result = await PaymentUtil.issueBillingKey(name);
            
            if (result !== null) {
                // 빌링키 저장
                const saveResponse = await PaymentUtil.saveBillingKey({
                    method_key: result.billingKey,
                    method_provider: name,
                });
                
                alert("빌링키가 성공적으로 발급되고 저장되었습니다!");
            } else {
                console.error("빌링키 발급 실패:", result);
                alert(`빌링키 발급 실패: ${result.message || '알 수 없는 오류'}`);
            }
            
        } catch (error) {
            console.error("빌링키 발급 및 저장 중 오류:", error);
            
            if (error.response) {
                console.log("서버 응답 오류:", error.response.data);
                alert(`서버 오류: ${error.response.data?.message || error.response.status}`);
            } else if (error.request) {
                console.log("네트워크 오류:", error.request);
                alert("네트워크 오류가 발생했습니다. 연결을 확인해주세요.");
            } else {
                console.log("기타 오류:", error.message);
                alert(`오류: ${error.message}`);
            }
        }
    }

    /** 내 결제수단 목록 리턴 함수 */
    const handleGetPaymentMethods = async () => {
        try {
            const response = await PaymentUtil.getBillingKeys();
            
            if (response.success) {
                const methods = response.data;
                setWallet(methods);
                return methods.length > 0 ? methods : null;
            } else {
                alert(`조회 실패: ${response.message}`);
            }
        } catch (error) {
            console.error("결제수단 목록 조회 중 오류:", error);
            
            if (error.response) {
                alert(`서버 오류: ${error.response.data?.message || error.response.status}`);
            } else {
                alert(`오류: ${error.message}`);
            }
        }
    }


    return (
        <div>
            

            <ButtonSubmit onClick={billingKey} name={KAKAOPAY}>빌링키 발급 및 저장 테스트(kakao)</ButtonSubmit>
            <ButtonSubmit onClick={billingKey} name={TOSSPAYMENTS}>빌링키 발급 및 저장 테스트(toss-payments)</ButtonSubmit>
            <ButtonSubmit onClick={() => PaymentUtil.getBillingKeyInfo({method_idx: 20})}>내 빌링키 정보 조회</ButtonSubmit>
            <ButtonSubmit onClick={handlePortOneBillingPaymentTest}>빌링키 결제</ButtonSubmit>
            <ButtonSubmit onClick={handleGetPaymentMethods}>내 결제수단 목록 조회</ButtonSubmit>
        </div>
    );
};

export default KaKaoPayTest;