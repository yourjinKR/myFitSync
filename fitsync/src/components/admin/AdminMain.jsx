import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const AdminMain = () => {
    return (
        <div>
            <Link to="/admin">관리자 대시보드</Link><br />
            <Link to="/admin/ai">ai 이동</Link><br />
            <Link to="/admin/api">api 모니터링</Link><br />
            <Outlet/>
        </div>
    );
};

export default AdminMain;