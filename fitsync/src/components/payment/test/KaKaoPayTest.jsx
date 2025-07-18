import React, { useState } from 'react';
import { ButtonSubmit } from '../../../styles/FormStyles';
import { KAKAOPAY, PaymentUtil, TOSSPAYMENTS } from '../../../utils/PaymentUtil';
import { useNavigate } from 'react-router-dom';
import DateTimePicker from '../DateTimePicker';
import styled from 'styled-components';

const CalendarContainer = styled.div`
    position: relative;
    display: inline-block;
    margin: 10px 0;
`;

const DateTimeButton = styled(ButtonSubmit)`
    margin-right: 10px;
`;

const KaKaoPayTest = () => {
    const [showCalendar, setShowCalendar] = useState(false);
    const navigate = useNavigate();

    /** 빌링키 발급 및 저장 */
    const billingKey = async (e) => {
        const { name } = e.target;
        e.preventDefault();

        try {
            const result = await PaymentUtil.issueBillingKey(name);
            
            if (result !== null) {
                // 빌링키 저장
                await PaymentUtil.saveBillingKey({
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
                console.log('결제수단 목록:', methods);
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

    /** 결제 내역 조회 함수 */
    const handleGetPaymentHistory = async () => {
        try {
            const response = await PaymentUtil.getPaymentHistory();
            
            if (response.success) {
                const history = response.data;
                console.log("📋 결제 내역:", history);
                console.log(`📊 총 ${response.totalCount}건의 결제 기록이 있습니다.`);

            } else {
                alert(`조회 실패: ${response.message}`);
            }
        } catch (error) {
            console.error("결제 내역 조회 중 오류:", error);
            alert(`오류: ${error.message}`);
        }
    }

    /** 결제 내역 UI 페이지로 이동 */
    const goToPaymentHistory = () => {
        navigate('/payment/history');
    }

    /** 빌링키 결제 예약 테스트 (사용자 입력 날짜) */
    const handleScheduleBillingKey = async () => {
        try {
            // 현재 시간에서 1시간 후로 설정 (테스트용)
            const scheduleDate = new Date();
            scheduleDate.setHours(scheduleDate.getHours() + 1);
            
            // yyyy-MM-dd HH:mm:ss 형식으로 변환
            const scheduleDateTime = scheduleDate.toISOString()
                .slice(0, 19) // YYYY-MM-DDTHH:mm:ss
                .replace('T', ' '); // 공백으로 구분
            
            console.log("예약 날짜/시간:", scheduleDateTime);
            
            const response = await PaymentUtil.scheduleBillingKey({ 
                method_idx: 32,
                schedule_datetime: scheduleDateTime
            });
            
            if (response.success) {
                console.log("✅ 결제 예약 성공!");
                console.log("예약 정보:", response.data);
                alert(`결제 예약이 성공적으로 완료되었습니다!\n예약 시간: ${scheduleDateTime}`);
            } else {
                console.log("❌ 결제 예약 실패!");
                console.log("실패 원인:", response.message);
                alert(`결제 예약 실패: ${response.message}`);
            }
            
        } catch (error) {
            console.error("결제 예약 중 오류:", error);
            
            if (error.response) {
                console.log("서버 응답 오류:", error.response.data);
                alert(`서버 오류: ${error.response.data?.message || '알 수 없는 오류'}`);
            } else {
                console.log("기타 오류:", error.message);
                alert(`오류: ${error.message}`);
            }
        }
    }

    /** 달력 UI를 통한 결제 예약 */
    const handleCalendarSchedule = () => {
        setShowCalendar(true);
    }

    /** 달력에서 날짜/시간 선택 완료 */
    const handleDateTimeSelect = async (selectedDateTime) => {
        setShowCalendar(false);
        
        try {
            // yyyy-MM-dd HH:mm:ss 형식으로 변환
            const scheduleDateTime = selectedDateTime.toISOString()
                .slice(0, 19) // YYYY-MM-DDTHH:mm:ss
                .replace('T', ' '); // 공백으로 구분
            
            console.log("달력에서 선택한 예약 날짜/시간:", scheduleDateTime);
            
            const response = await PaymentUtil.scheduleBillingKey({ 
                method_idx: 32,
                schedule_datetime: scheduleDateTime
            });
            
            if (response.success) {
                console.log("✅ 달력 UI 결제 예약 성공!");
                console.log("예약 정보:", response.data);
                alert(`결제 예약이 성공적으로 완료되었습니다!\n예약 시간: ${scheduleDateTime}`);
            } else {
                console.log("❌ 결제 예약 실패!");
                console.log("실패 원인:", response.message);
                alert(`결제 예약 실패: ${response.message}`);
            }
            
        } catch (error) {
            console.error("달력 UI 결제 예약 중 오류:", error);
            
            if (error.response) {
                console.log("서버 응답 오류:", error.response.data);
                alert(`서버 오류: ${error.response.data?.message || '알 수 없는 오류'}`);
            } else {
                console.log("기타 오류:", error.message);
                alert(`오류: ${error.message}`);
            }
        }
    }

    /** 달력 취소 */
    const handleCalendarCancel = () => {
        setShowCalendar(false);
    }

    /** 사용자 정의 시간으로 결제 예약 */
    const handleCustomScheduleBillingKey = async () => {
        const customDateTime = prompt("결제 예약 날짜/시간을 입력하세요 (형식: yyyy-MM-dd HH:mm:ss)", "2025-01-20 14:30:00");
        
        if (!customDateTime) {
            alert("날짜/시간을 입력해주세요.");
            return;
        }
        
        try {
            const response = await PaymentUtil.scheduleBillingKey({ 
                method_idx: 32,
                schedule_datetime: customDateTime
            });
            
            if (response.success) {
                console.log("✅ 사용자 정의 결제 예약 성공!");
                console.log("예약 정보:", response.data);
                alert(`결제 예약이 성공적으로 완료되었습니다!\n예약 시간: ${customDateTime}`);
            } else {
                console.log("❌ 결제 예약 실패!");
                console.log("실패 원인:", response.message);
                alert(`결제 예약 실패: ${response.message}`);
            }
            
        } catch (error) {
            console.error("결제 예약 중 오류:", error);
            
            if (error.response) {
                console.log("서버 응답 오류:", error.response.data);
                alert(`서버 오류: ${error.response.data?.message || '알 수 없는 오류'}`);
            } else {
                console.log("기타 오류:", error.message);
                alert(`오류: ${error.message}`);
            }
        }
    }


    return (
        <div>
            <ButtonSubmit onClick={billingKey} name={KAKAOPAY}>빌링키 발급 및 저장 테스트(kakao)</ButtonSubmit>
            <ButtonSubmit onClick={billingKey} name={TOSSPAYMENTS}>빌링키 발급 및 저장 테스트(toss-payments)</ButtonSubmit>
            <ButtonSubmit onClick={() => PaymentUtil.getBillingKeyInfo({method_idx: 1})}>내 빌링키 정보 조회</ButtonSubmit>
            <ButtonSubmit onClick={() => PaymentUtil.payBillingKey({method_idx: 32})}>빌링키 결제</ButtonSubmit>
            <ButtonSubmit onClick={handleGetPaymentMethods}>내 결제수단 목록 조회</ButtonSubmit>
            <ButtonSubmit onClick={handleGetPaymentHistory}>📋 결제 내역 조회 (콘솔)</ButtonSubmit>
            <ButtonSubmit onClick={goToPaymentHistory}>🎨 결제 내역 UI 페이지</ButtonSubmit>
            <ButtonSubmit onClick={handleScheduleBillingKey}>⏰ 결제 예약 (1시간 후)</ButtonSubmit>
            <ButtonSubmit onClick={handleCustomScheduleBillingKey}>📅 결제 예약 (사용자 입력)</ButtonSubmit>
            
            <CalendarContainer>
                <DateTimeButton onClick={handleCalendarSchedule}>
                    🗓️ 달력으로 결제 예약
                </DateTimeButton>
                {showCalendar && (
                    <DateTimePicker
                        onSelect={handleDateTimeSelect}
                        onCancel={handleCalendarCancel}
                        initialDate={new Date()}
                    />
                )}
            </CalendarContainer>
        </div>
    );
};

export default KaKaoPayTest;