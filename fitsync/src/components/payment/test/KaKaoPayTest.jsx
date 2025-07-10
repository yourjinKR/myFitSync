import React from 'react';
import { ButtonSubmit } from '../../../styles/FormStyles';
import axios from 'axios';

const KaKaoPayTest = () => {
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


    return (
        <div>
            <h1>KaKaoPay Test</h1>
            <p>카카오 페이 결제 테스트입니다.</p>
            <ButtonSubmit onClick={handlePaymentRequest}>결제 요청</ButtonSubmit>

        </div>
    );
};

export default KaKaoPayTest;