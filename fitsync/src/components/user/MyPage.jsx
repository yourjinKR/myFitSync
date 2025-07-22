import React from 'react';
import { Link } from 'react-router-dom';
import MonthlyCalendar from './MonthlyCalendar';
import BodyComparisonChart from './BodyComparisonChart';

const MyPage = () => {
    return (
    <div>
      <MonthlyCalendar />
      <BodyComparisonChart />
    </div>
    );
};

export default MyPage;