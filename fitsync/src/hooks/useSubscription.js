import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { PaymentUtil } from '../utils/PaymentUtil';

export const useSubscription = () => {
  const { member_idx } = useSelector(state => state.user?.user);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const result = await PaymentUtil.checkSubscriptionStatus(member_idx);

      if (result?.success) {
        setData(result.data);
      } else {
        setData(null);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (member_idx) {
      loadSubscriptionData();
    }
  }, [member_idx]);

  // 구조 분해해서 바로 쓸 수 있도록 리턴
  return {
    subscriptionData: data,
    memberIdx: data?.memberIdx,
    isSubscriber: data?.isSubscriber ?? false,
    isLog: data?.isLog ?? false,
    lastPaymentDate: data?.lastPaymentDate || null,
    totalCost: data?.totalCost || 0,
    loading,
    error,
    reload: loadSubscriptionData
  };
};