import React from 'react';
import { Link } from 'react-router-dom';

const MyPage = () => {
    return (
        <div>
            <h2>my page</h2>
            <Link to="/ai">ai 이동</Link>
        </div>
    );
};

export default MyPage;