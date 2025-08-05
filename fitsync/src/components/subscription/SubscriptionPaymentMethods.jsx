import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { PaymentUtil } from '../../utils/PaymentUtil';
import AddPaymentMethodModal from './AddPaymentMethodModal';
import PaymentConfirmModal from './PaymentConfirmModal';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useRequireLogin from '../../hooks/useRequireLogin';

// 스타일 컴포넌트들
const Container = styled.div`
  /* 컨테이너에서 이미 패딩과 배경이 설정되므로 여기서는 제거 */
  position: relative;
`;

// 제거: Header, Title, Subtitle (컨테이너로 이동됨)

// 풀 투 리프레시 컨테이너
const PullToRefreshContainer = styled.div`
  position: relative;
  min-height: calc(100vh - 200px);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

const RefreshIndicator = styled.div`
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--primary-blue);
  font-size: 13px;
  transition: all 0.3s ease;
  
  @media (min-width: 375px) {
    font-size: 14px;
  }
  
  @media (min-width: 414px) {
    font-size: 15px;
  }
  
  ${props => props.$visible && `
    top: 20px;
    opacity: 1;
  `}
`;

// 카드 리스트
const MethodsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 100px;
`;

// 카드 컨테이너
const Card = styled.div`
  position: relative;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-light);
  transition: all 0.2s ease;
  overflow: hidden;
`;

// 카드 헤더 (메뉴 버튼 포함)
const CardTopHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

// 메뉴 버튼
const MenuButton = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: var(--bg-tertiary);
  border: none;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s ease;
  position: relative;
  flex-shrink: 0;
  cursor: pointer;
  
  &:hover {
    background: var(--border-light);
    color: var(--text-primary);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &::before {
    line-height: 1;
    letter-spacing: 1px;
  }
`;

// 드롭다운 메뉴
const DropdownMenu = styled.div`
  position: absolute;
  top: 32px;
  right: 0;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  z-index: 100;
  min-width: 110px;
  overflow: hidden;
`;

// 메뉴 옵션
const MenuOption = styled.div`
  width: 100%;
  padding: 10px 12px;
  background: none;
  border: none;
  text-align: left;
  font-size: 13px !important;
  color: var(--text-primary);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  
  @media (min-width: 375px) {
    font-size: 14px !important;
  }
  
  &:hover {
    background: var(--bg-tertiary);
  }
  
  &:active {
    background: var(--border-light);
  }
  
  &.delete {
    color: var(--warning);
  }
`;

// 카드 내용
const CardContent = styled.div`
  padding: 16px 20px;
  background: transparent;
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
`;

// 카드 정보 영역 (유동적 높이)
const CardInfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

// 카드 브랜드/서비스 표시 영역
const CardBrandSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const CardBrand = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 8px !important;
  font-weight: 600;
  color: var(--text-primary);
  
  @media (min-width: 375px) {
    font-size: 12px !important;
  }
  
  @media (min-width: 414px) {
    font-size: 13px !important;
  }
  color: var(--text-secondary);
`;

const CardNumber = styled.span`
  align-items: center;
  color: var(--text-secondary);
  font-weight: 400;
  font-size: 8px !important;
    @media (min-width: 375px) {
    font-size: 10px !important;
  }
  
  @media (min-width: 414px) {
    font-size: 11px !important;
  }
`;

const PaymentProvider = styled.div`
  font-size: 10px !important;
  color: var(--text-tertiary);
  background: var(--bg-tertiary);
  padding: 3px 6px;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 6px;
  font-weight: 500;
  
  @media (min-width: 375px) {
    font-size: 11px !important;
  }
  
  @media (min-width: 414px) {
    font-size: 12px !important;
  }
`;

// 결제하기 버튼
const PaymentButton = styled.button`
  width: 100%;
  padding: 12px;
  margin-top: 16px;
  background: var(--primary-blue);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  
  @media (min-width: 375px) {
    font-size: 15px;
  }
  
  @media (min-width: 414px) {
    font-size: 16px;
  }
  
  &:hover {
    background: var(--primary-blue-hover);
  }
  
  &:active {
    transform: translateY(1px);
    background: var(--primary-blue-dark);
  }
`;

const CardNameContainer = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
`;

const CardName = styled.div`
  font-size: 15px !important;
  font-weight: 600;
  color: var(--text-primary);
  width: 100%;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
  @media (min-width: 375px) {
    font-size: 16px !important;
  }
  
  @media (min-width: 414px) {
    font-size: 17px !important;
  }
`;

const EditableCardName = styled.input`
  background: var(--bg-tertiary);
  border: 2px solid var(--primary-blue);
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 15px !important;
  font-weight: 600;
  color: var(--text-primary);
  width: 100%;
  box-sizing: border-box;
  
  @media (min-width: 375px) {
    font-size: 16px !important;
  }
  
  @media (min-width: 414px) {
    font-size: 17px !important;
  }
  
  &:focus {
    outline: none;
    border-color: var(--primary-blue-hover);
  }
`;

// 플로팅 추가 버튼
const FloatingAddButton = styled.button`
  position: fixed;
  bottom: 100px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--primary-blue);
  color: white;
  border: none;
  font-size: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.4);
  z-index: 1000;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.95);
    box-shadow: 0 2px 8px rgba(74, 144, 226, 0.3);
  }
`;

// 빈 상태
const EmptyState = styled.div`
  text-align: center;
  padding: 48px 20px;
  color: var(--text-secondary);
  
  .icon {
    font-size: 40px;
    margin-bottom: 12px;
    opacity: 0.4;
    
    @media (min-width: 375px) {
      font-size: 44px;
    }
    
    @media (min-width: 414px) {
      font-size: 48px;
    }
  }
  
  h3 {
    font-size: 15px !important;
    margin-bottom: 6px;
    color: var(--text-primary);
    font-weight: 600;
    
    @media (min-width: 375px) {
      font-size: 16px !important;
    }
    
    @media (min-width: 414px) {
      font-size: 17px !important;
    }
  }
  
  p {
    font-size: 12px !important;
    line-height: 1.4;
    margin-bottom: 20px;
    
    @media (min-width: 375px) {
      font-size: 13px !important;
    }
    
    @media (min-width: 414px) {
      font-size: 14px !important;
    }
  }
`;

const EmptyActionButton = styled.button`
  background: var(--primary-blue);
  color: white;
  border: none;
  padding: 14px 20px;
  border-radius: 10px;
  font-size: 14px !important;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
  
  @media (min-width: 375px) {
    font-size: 16px;
  }
  
  @media (min-width: 414px) {
    font-size: 17px;
  }
  
  &:active {
    transform: translateY(1px);
    background: var(--primary-blue-hover);
  }
`;

// 로딩 및 에러 컴포넌트들
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-secondary);
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-light);
  border-top: 3px solid var(--primary-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid var(--warning);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  color: var(--warning);
  text-align: center;
  font-size: 16px;
`;

// 확인 다이얼로그
const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
`;

const DialogContent = styled.div`
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 24px;
  margin: 20px;
  max-width: 400px;
  width: 100%;
  border: 2px solid var(--border-light);
`;

const DialogTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);
`;

const DialogMessage = styled.p`
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 24px;
  line-height: 1.5;
`;

const DialogButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const DialogButton = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s ease;
  
  ${props => props.$primary ? `
    background: var(--warning);
    color: white;
    
    &:active {
      background: #d32f2f;
    }
  ` : `
    background: var(--bg-tertiary);
    color: var(--text-primary);
    
    &:active {
      background: var(--border-light);
    }
  `}
`;

const SubscriptionPaymentMethods = () => {
  useRequireLogin();

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [originalName, setOriginalName] = useState('');
  const [editingName, setEditingName] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null); // 메뉴 상태 관리
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [isSub, setIsSub] = useState(false);
  const [recentOrder, setRecentOrder] = useState({});
  const user = useSelector(state => state.user);

  const location = useLocation();
  let {changeMode} = location.state || false;
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    const searchParams = new URLSearchParams(location.search);
    const showModal = searchParams.get('showModal');
    const directPay = searchParams.get('directPay');

    if (showModal === 'true' && paymentMethods.length === 0 && !isSub) {
      setShowAddModal(true);
    } 

    if (directPay === 'true' && paymentMethods.length !== 0 && !isSub) {
      // 첫 번째 결제수단을 선택하여 결제 확인 모달 열기
      setSelectedPaymentMethod(paymentMethods[0]);
    }
    
  },[paymentMethods, location.search, loading, isSub])

  useEffect(() => {
    if (selectedPaymentMethod !== null) {
      setShowPaymentConfirm(true);
    }
  },[selectedPaymentMethod])
  
  // 터치 관련 refs (풀 투 리프레시용만)
  const touchStartY = useRef(0);
  const pullDistance = useRef(0);
  const containerRef = useRef(null);
  
  // 더블탭 관련 refs 추가
  const lastTapTime = useRef(0);
  const tapTimeout = useRef(null);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async (isDirectPay=false) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await PaymentUtil.getBillingKeys();

      const isSubResponse = await PaymentUtil.checkSubscriptionStatus(user.user.member_idx);

      const recentOrderResponse = await PaymentUtil.getRecentHistory();
      
      if (response.success && isSubResponse.success) {
        setPaymentMethods(response.data || []);
        setIsSub(isSubResponse.data.isSubscriber || false);
        setRecentOrder(recentOrderResponse.data);
      } else {
        setError(response.message || '결제수단을 불러올 수 없습니다.');
      }
    } catch (err) {
      console.error('결제수단 로드 실패:', err);
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 풀 투 리프레시 구현
  const handleTouchStart = (e) => {
    if (containerRef.current.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (containerRef.current.scrollTop === 0) {
      const currentY = e.touches[0].clientY;
      pullDistance.current = Math.max(0, currentY - touchStartY.current);
      
      if (pullDistance.current > 100) {
        setRefreshing(true);
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance.current > 100 && containerRef.current.scrollTop === 0) {
      loadPaymentMethods();
    }
    pullDistance.current = 0;
  };

  // 메뉴 관리
  const handleMenuToggle = (methodId) => {
    setOpenMenuId(openMenuId === methodId ? null : methodId);
  };

  const handleMenuClose = () => {
    setOpenMenuId(null);
  };

  // 결제수단 등록
  const handleAddPaymentMethod = () => {
    setShowAddModal(true);
  };

  // 모달 완료
  const handleModalSuccess = () => {
    // 결제수단 목록 새로고침
    const searchParams = new URLSearchParams(location.search);
    const directPay = searchParams.get('directPay');

    const isDirectPay = directPay === 'true' ? true : false;

    loadPaymentMethods(isDirectPay);
    setShowAddModal(false);
  };

  // 카드명 편집 시작
  const handleEditStart = (method) => {
    setEditingId(method.method_idx);
    setEditingName(method.method_name);
    setOriginalName(method.method_name); // 원래 이름 저장
    handleMenuClose(); // 메뉴 닫기
  };

  // 모바일용 더블탭 핸들러
  const handleCardNameTouch = (e, method) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300; // 300ms 내 두 번 탭하면 더블탭으로 인식
    
    if (lastTapTime.current && (now - lastTapTime.current) < DOUBLE_TAP_DELAY) {
      // 더블탭 감지됨
      e.preventDefault();
      handleEditStart(method);
      clearTimeout(tapTimeout.current);
      lastTapTime.current = 0;
    } else {
      // 첫 번째 탭
      lastTapTime.current = now;
      
      // 단일 탭 처리를 위한 타이머 (현재는 아무것도 하지 않음)
      tapTimeout.current = setTimeout(() => {
        lastTapTime.current = 0;
      }, DOUBLE_TAP_DELAY);
    }
  };

  // 카드명 편집 완료
  const handleEditComplete = async () => {
    if (editingId && editingName.trim()) {
      if (editingName.trim() === originalName) {
        // 이름이 변경되지 않은 경우
        setEditingId(null);
        setEditingName('');
        return;
      }

      try {
        const response = await PaymentUtil.renameBillingKey({
          method_idx: editingId, 
          method_name: editingName.trim()
        });
        
        if (response.success) {
          setPaymentMethods(prev => 
            prev.map(method => 
              method.method_idx === editingId 
                ? { ...method, method_name: editingName.trim() }
                : method
            )
          );
        } else {
          setError(response.message || '결제수단 이름 변경에 실패했습니다.');
        }
      } catch (err) {
        console.error('카드명 변경 실패:', err);
        setError('카드명 변경에 실패했습니다.');
      }
    }
    
    setEditingId(null);
    setEditingName('');
  };

  // 결제수단 삭제
  const handleDeletePaymentMethod = (method) => {
    setConfirmDialog({
      title: '결제수단 삭제',
      message: `"${method.method_name}" 결제수단을 삭제하시겠습니까?\n\n관련된 모든 예약 결제가 취소됩니다.`,
      onConfirm: () => confirmDelete(method.method_idx),
      onCancel: () => setConfirmDialog(null)
    });
  };

  const confirmDelete = async (methodIdx) => {
    try {
      const response = await PaymentUtil.deletePaymentMethod(methodIdx);
      
      if (response.success) {
        setPaymentMethods(prev => prev.filter(method => method.method_idx !== methodIdx));
      } else {
        setError(response.message || '결제수단 삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('결제수단 삭제 실패:', err);
      setError('결제수단 삭제에 실패했습니다.');
    } finally {
      setConfirmDialog(null);
      handleMenuClose(); // 메뉴 닫기
    }
  };

  // 간편결제 여부 확인 함수
  const isEasyPayMethod = (method) => {
    return !method.method_card || !method.method_card_num;
  };

  // 결제하기 버튼 클릭 핸들러
  const handlePaymentStart = async (method) => {
    // 기존 예약건 변경
    if (recentOrder.order_type === 'SCHEDULE') {
      console.log(recentOrder.method_idx);
      console.log(method.method_idx);
      const response = recentOrder.method_idx !== method.method_idx ? 
        await PaymentUtil.changeSchedulePaymentMethod({order_idx : recentOrder.order_idx, method_idx : method.method_idx})
        : null;

      if (response !== null) {
        loadPaymentMethods();
      }

      return;
    }

    setSelectedPaymentMethod(method);
    setShowPaymentConfirm(true);
  };

  // 결제 성공 핸들러
  const handlePaymentSuccess = (result) => {
    setShowPaymentConfirm(false);
    setSelectedPaymentMethod(null);
    alert(`결제가 완료되었습니다!`);
    loadPaymentMethods();
  };

  // 결제 실패 핸들러
  const handlePaymentError = (errorMessage) => {
    setShowPaymentConfirm(false);
    setSelectedPaymentMethod(null);
    alert(`결제 실패: ${errorMessage}`);
  };

  // 결제 모달 닫기
  const handlePaymentConfirmClose = () => {
    setShowPaymentConfirm(false);
    setSelectedPaymentMethod(null);
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingSpinner />
          <h3 style={{ fontSize: '18px' }}>결제수단을 불러오는 중...</h3>
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}

      <PullToRefreshContainer
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {refreshing && (
          <RefreshIndicator $visible={refreshing}>
            <LoadingSpinner style={{ width: '20px', height: '20px', margin: 0 }} />
            <span style={{ fontSize: '16px' }}>새로고침 중...</span>
          </RefreshIndicator>
        )}

        {paymentMethods.length === 0 ? (
          <EmptyState>
            <div className="icon">💳</div>
            <h3>등록된 결제수단이 없습니다</h3>
            <p>
              구독 서비스를 이용하려면<br />
              결제수단을 등록해주세요
            </p>
            <EmptyActionButton onClick={handleAddPaymentMethod}>
              결제수단 등록하기
            </EmptyActionButton>
          </EmptyState>
        ) : (
          <MethodsList>
            {paymentMethods.map((method) => {
              const isEasyPay = isEasyPayMethod(method);
              
              return (
                <Card key={method.method_idx}>
                  <CardContent>
                    {/* 결제수단명과 메뉴 버튼이 있는 상단 헤더 */}
                    <CardTopHeader>
                      <CardNameContainer>
                        {editingId === method.method_idx ? (
                          <EditableCardName
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onBlur={handleEditComplete}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleEditComplete();
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          <CardName 
                            onTouchEnd={(e) => handleCardNameTouch(e, method)}
                            onDoubleClick={() => handleEditStart(method)}
                            style={{ cursor: 'pointer' }}
                          >
                            {method.method_name}
                          </CardName>
                        )}
                      </CardNameContainer>

                      {/* 메뉴 버튼 */}
                      <MenuButton 
                        onClick={() => handleMenuToggle(method.method_idx)}
                        onBlur={() => setTimeout(handleMenuClose, 150)}
                      >
                        ⋮
                        {openMenuId === method.method_idx && (
                          <DropdownMenu>
                            <MenuOption 
                              onClick={() => {
                                handleEditStart(method);
                                handleMenuClose();
                              }}
                            >
                              <span>✏️</span>
                              <span>이름 수정</span>
                            </MenuOption>
                            <MenuOption 
                              className="delete"
                              onClick={() => {
                                handleDeletePaymentMethod(method);
                                handleMenuClose();
                              }}
                            >
                              <span>🗑️</span>
                              <span>삭제</span>
                            </MenuOption>
                          </DropdownMenu>
                        )}
                      </MenuButton>
                    </CardTopHeader>

                    {/* 카드 정보 영역 - 간편결제와 카드결제 구분 */}
                    <CardInfoSection>
                      <CardBrandSection>
                        <CardBrand>
                            {isEasyPay 
                              ? (method.method_provider === 'KAKAOPAY' ? '카카오페이' : method.method_provider)
                              : `${method.method_card}` 
                            }
                            <CardNumber>{method.method_card_num || ''}</CardNumber>
                        </CardBrand>
                      </CardBrandSection>
                      
                      {/* 결제대행사 정보는 하단에 항상 표시 */}
                      <PaymentProvider>
                        {method.method_provider || 'Unknown'}
                      </PaymentProvider>
                    </CardInfoSection>

                    {/* 결제하기 버튼 */}
                    {isSub === false || (method.method_idx !== recentOrder.method_idx) ? (
                      <PaymentButton onClick={() => handlePaymentStart(method)}>
                        해당 결제수단으로 구독하기
                      </PaymentButton>
                    ) : (<></>)}
                  </CardContent>
                </Card>
              );
            })}
          </MethodsList>
        )}
      </PullToRefreshContainer>

      <FloatingAddButton onClick={handleAddPaymentMethod}>
        +
      </FloatingAddButton>

      {/* 확인 다이얼로그 */}
      {confirmDialog && (
        <DialogOverlay onClick={() => setConfirmDialog(null)}>
          <DialogContent onClick={(e) => e.stopPropagation()}>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogMessage>{confirmDialog.message}</DialogMessage>
            <DialogButtons>
              <DialogButton onClick={confirmDialog.onCancel}>
                취소
              </DialogButton>
              <DialogButton $primary onClick={confirmDialog.onConfirm}>
                삭제
              </DialogButton>
            </DialogButtons>
          </DialogContent>
        </DialogOverlay>
      )}

      {/* 결제수단 추가 모달 */}
      <AddPaymentMethodModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleModalSuccess}
      />

      {/* 결제 확인 모달 */}
      <PaymentConfirmModal
        isOpen={showPaymentConfirm}
        onClose={handlePaymentConfirmClose}
        selectedPaymentMethod={selectedPaymentMethod}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
      />
    </Container>
  );
};

export default SubscriptionPaymentMethods;
