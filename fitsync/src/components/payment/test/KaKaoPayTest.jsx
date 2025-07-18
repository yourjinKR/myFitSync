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

                // order_idx 목록을 별도로 출력하여 취소 테스트에 활용
                const orderIndexes = history
                    .filter(item => item.order_status === 'READY' && item.order_type === 'SCHEDULE')
                    .map(item => ({
                        order_idx: item.order_idx,
                        order_name: item.order_name,
                        schedule_date: item.schedule_date,
                        order_status: item.order_status
                    }));

                if (orderIndexes.length > 0) {
                    console.log("🔢 취소 가능한 예약 주문 번호들:");
                    console.table(orderIndexes);
                    
                    const orderIdxList = orderIndexes.map(item => item.order_idx).join(', ');
                    alert(`취소 가능한 예약 주문 번호들:\n${orderIdxList}\n\n콘솔에서 상세 정보를 확인하세요.`);
                } else {
                    alert("취소 가능한 예약이 없습니다.\n(READY 상태의 SCHEDULE 타입 주문만 취소 가능)");
                }

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
            // 현재 한국 시간에서 1시간 후로 설정 (테스트용)
            const now = new Date();
            
            // 한국 시간대로 변환 (UTC+9)
            const koreaTime = new Date(now.getTime() + (1 * 60 * 60 * 1000));
            // koreaTime.setHours(koreaTime.getHours() + 1);
            
            // yyyy-MM-dd HH:mm:ss 형식으로 변환 (한국 시간 기준)
            const year = koreaTime.getFullYear();
            const month = String(koreaTime.getMonth() + 1).padStart(2, '0');
            const day = String(koreaTime.getDate()).padStart(2, '0');
            const hours = String(koreaTime.getHours()).padStart(2, '0');
            const minutes = String(koreaTime.getMinutes()).padStart(2, '0');
            const seconds = String(koreaTime.getSeconds()).padStart(2, '0');
            
            const scheduleDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            
            console.log("현재 로컬 시간:", now);
            console.log("한국 시간 (+1시간):", koreaTime);
            console.log("서버 전송 형식:", scheduleDateTime);
            
            const response = await PaymentUtil.scheduleBillingKey({ 
                method_idx: 32,
                schedule_datetime: scheduleDateTime
            });
            
            if (response.success) {
                console.log("✅ 결제 예약 성공!");
                console.log("예약 정보:", response.data);
                alert(`결제 예약이 성공적으로 완료되었습니다!\n예약 시간 (한국시간): ${scheduleDateTime}`);
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
            // 선택된 시간을 한국 시간 기준으로 처리
            // selectedDateTime은 이미 사용자가 의도한 한국 시간
            const year = selectedDateTime.getFullYear();
            const month = String(selectedDateTime.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDateTime.getDate()).padStart(2, '0');
            const hours = String(selectedDateTime.getHours()).padStart(2, '0');
            const minutes = String(selectedDateTime.getMinutes()).padStart(2, '0');
            const seconds = String(selectedDateTime.getSeconds()).padStart(2, '0');
            
            const scheduleDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            
            console.log("달력에서 선택한 원본 시간:", selectedDateTime);
            console.log("한국 시간 기준 서버 전송 형식:", scheduleDateTime);
            
            const response = await PaymentUtil.scheduleBillingKey({ 
                method_idx: 32,
                schedule_datetime: scheduleDateTime
            });
            
            if (response.success) {
                console.log("✅ 달력 UI 결제 예약 성공!");
                console.log("예약 정보:", response.data);
                alert(`결제 예약이 성공적으로 완료되었습니다!\n예약 시간 (한국시간): ${scheduleDateTime}`);
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

    /** 결제 예약 취소 테스트 */
    const handleCancelScheduledPayment = async () => {
        const orderIdx = prompt("취소할 주문 번호(order_idx)를 입력하세요:", "");
        
        if (!orderIdx) {
            alert("주문 번호를 입력해주세요.");
            return;
        }
        
        const isConfirmed = window.confirm(`주문 번호 ${orderIdx}의 결제 예약을 취소하시겠습니까?`);
        if (!isConfirmed) {
            return;
        }
        
        try {
            const response = await PaymentUtil.cancelScheduledPayment(parseInt(orderIdx));
            
            console.log("✅ 결제 예약 취소 성공!");
            console.log("취소 결과:", response);
            alert(`결제 예약이 성공적으로 취소되었습니다!\n주문 번호: ${orderIdx}`);
            
        } catch (error) {
            console.error("결제 예약 취소 중 오류:", error);
            alert(`결제 예약 취소 실패: ${error.message}`);
        }
    }

    /** 최근 예약 자동 취소 (간편 테스트용) */
    const handleCancelLatestSchedule = async () => {
        try {
            // 먼저 결제 내역을 조회하여 최신 예약을 찾기
            const response = await PaymentUtil.getPaymentHistory();
            
            if (!response.success) {
                alert(`내역 조회 실패: ${response.message}`);
                return;
            }

            const history = response.data;
            const latestSchedule = history
                .filter(item => item.order_status === 'READY' && item.order_type === 'SCHEDULE')
                .sort((a, b) => new Date(b.order_regdate) - new Date(a.order_regdate))[0];

            if (!latestSchedule) {
                alert("취소할 수 있는 최근 예약이 없습니다.");
                return;
            }

            const isConfirmed = window.confirm(
                `최근 예약을 취소하시겠습니까?\n` +
                `주문번호: ${latestSchedule.order_idx}\n` +
                `주문명: ${latestSchedule.order_name}\n` +
                `예약일시: ${latestSchedule.schedule_date}`
            );

            if (!isConfirmed) {
                return;
            }

            const cancelResponse = await PaymentUtil.cancelScheduledPayment(latestSchedule.order_idx);
            
            console.log("✅ 최근 예약 취소 성공!");
            console.log("취소 결과:", cancelResponse);
            alert(`최근 예약이 성공적으로 취소되었습니다!\n주문 번호: ${latestSchedule.order_idx}`);
            
        } catch (error) {
            console.error("최근 예약 취소 중 오류:", error);
            alert(`최근 예약 취소 실패: ${error.message}`);
        }
    }


    return (
        <div>
            <ButtonSubmit onClick={billingKey} name={KAKAOPAY}>빌링키 발급 및 저장 테스트(kakao)</ButtonSubmit>
            <ButtonSubmit onClick={billingKey} name={TOSSPAYMENTS}>빌링키 발급 및 저장 테스트(toss-payments)</ButtonSubmit>
            <ButtonSubmit onClick={() => PaymentUtil.getBillingKeyInfo({method_idx: 1})}>내 빌링키 정보 조회</ButtonSubmit>
            <ButtonSubmit onClick={() => PaymentUtil.payBillingKey({method_idx: 32})}>빌링키 결제</ButtonSubmit>
            <ButtonSubmit onClick={handleGetPaymentMethods}>내 결제수단 목록 조회</ButtonSubmit>
            <ButtonSubmit onClick={handleGetPaymentHistory}>📋 결제 내역 조회 (order_idx 확인)</ButtonSubmit>
            <ButtonSubmit onClick={goToPaymentHistory}>🎨 결제 내역 UI 페이지</ButtonSubmit>
            <ButtonSubmit onClick={handleScheduleBillingKey}>⏰ 결제 예약 (1시간 후)</ButtonSubmit>
            <ButtonSubmit onClick={handleCustomScheduleBillingKey}>📅 결제 예약 (사용자 입력)</ButtonSubmit>
            <ButtonSubmit onClick={handleCancelScheduledPayment}>❌ 결제 예약 취소 (order_idx 입력)</ButtonSubmit>
            <ButtonSubmit onClick={handleCancelLatestSchedule}>🔄 최근 예약 자동 취소</ButtonSubmit>
            
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