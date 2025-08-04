import React, { useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useSelector } from 'react-redux';

const AdminMainWrapper = styled.div`
    display: flex;
    width: 100%;
    height: calc(100vh - 65px);
    overflow: hidden;

    & {
        width:100%;
    }
`;
const AdminNav = styled.div`
    width: 200px;
    height: 100%;
    background: var(--bg-secondary);
    & > a {
        display: block;
        padding: 10px;
        border-bottom: 1px solid var(--border-medium);
        font-size: 1.4rem;
    }
`;

const AdminContent = styled.div`
    width:100%;
    height: 100%;
    overflow: auto;
    padding:15px 0;
`;
const AdminMain = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.user);

    // 관리자 권한 체크
    useEffect(() => {
        const memberType = user?.member_type || sessionStorage.getItem("member_type");
        
        if (memberType !== "admin") {
            alert("관리자만 접근할 수 있습니다.");
            navigate("/"); // 홈으로 리다이렉트
        }
    }, [user, navigate]);

    // 관리자가 아니면 아무것도 렌더링하지 않음
    const memberType = user?.member_type || sessionStorage.getItem("member_type");
    if (memberType !== "admin") {
        return null;
    }

    return (
        <AdminMainWrapper>
            <AdminNav>
                <Link to="/admin">관리자 대시보드</Link>
                <Link to="/admin/ai">ai 이동</Link>
                <Link to="/admin/api">api 모니터링</Link>
                <Link to="/admin/workout">운동관리</Link>
                <Link to="/admin/awards">자격인증</Link>
                <Link to="/admin/report">신고</Link>
                <Link to="/admin/gym">체육관 추가</Link>
            </AdminNav>
            <AdminContent>
                <Outlet />
            </AdminContent>
        </AdminMainWrapper>
    );
};

export default AdminMain;