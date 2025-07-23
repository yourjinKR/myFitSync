import React from 'react';
import { Link } from 'react-router-dom';
import BodyComparisonChart from './BodyComparisonChart';
import TrainerCalendarView from '../trainer/TrainerCalendarView';

const MyPage = () => {
    return (
    <div>
      <TrainerCalendarView />
      <BodyComparisonChart />
    </div>
    );
};

export default MyPage;