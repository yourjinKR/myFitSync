import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const PaymentContainer = () => {
    return (
        <div>
            <h1>Payment</h1>
            <p>결제 관련 내용이 들어갈 영역입니다.</p>
            <Link to="/payment/kakao">
                <button>카카오 페이 결제 테스트</button>
            </Link>
            <Outlet/>
        </div>
    );
};

export default PaymentContainer;