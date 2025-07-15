import React, { useState } from 'react';
import styled from 'styled-components';
import { PaymentUtil } from '../../utils/PaymentUtil';

const Card = styled.div`
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 2rem;
  background: var(--bg-tertiary);
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--primary-blue);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.2);
  }
`;

const MethodInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
`;

const MethodDetails = styled.div`
  flex: 1;
`;

const MethodName = styled.h3`
  margin: 0 0 0.8rem 0;
  color: var(--text-primary);
  font-size: 1.8rem;
  font-weight: 600;
`;

const MethodMeta = styled.div`
  color: var(--text-secondary);
  font-size: 1.4rem;
  line-height: 1.4;
`;

const ProviderBadge = styled.span`
  display: inline-block;
  background: ${props => props.provider === 'KAKAOPAY' ? '#FEE500' : '#4A90E2'};
  color: ${props => props.provider === 'KAKAOPAY' ? '#000' : '#ffffff'};
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.4rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.8rem;
`;

const Button = styled.button`
  border: none;
  padding: 0.8rem 1.6rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.4rem;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const EditButton = styled(Button)`
  background: var(--primary-blue);
  color: var(--text-primary);
  
  &:hover:not(:disabled) {
    background: var(--primary-blue-hover);
    transform: translateY(-1px);
  }
`;

const DeleteButton = styled(Button)`
  background: var(--warning);
  color: var(--text-primary);
  
  &:hover:not(:disabled) {
    background: #c82333;
    transform: translateY(-1px);
  }
`;

const EditForm = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-light);
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 1.2rem;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  font-size: 1.4rem;
  margin-bottom: 1rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  
  &:focus {
    outline: none;
    border-color: var(--primary-blue);
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.25);
  }
  
  &::placeholder {
    color: var(--text-tertiary);
  }
`;

const FormButtons = styled.div`
  display: flex;
  gap: 0.8rem;
`;

const SaveButton = styled(Button)`
  background: var(--success);
  color: var(--text-primary);
  
  &:hover:not(:disabled) {
    background: #228B22;
    transform: translateY(-1px);
  }
`;

const CancelButton = styled(Button)`
  background: var(--text-tertiary);
  color: var(--text-primary);
  
  &:hover:not(:disabled) {
    background: var(--border-dark);
    transform: translateY(-1px);
  }
`;

const PaymentMethodCard = ({ method, onRenamed, onDeleted, onError }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(method.method_name);
  const [isLoading, setIsLoading] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
    setNewName(method.method_name);
  };

  const handleSaveEdit = async () => {
    if (!newName.trim()) {
      onError('결제수단 이름을 입력해주세요.');
      return;
    }

    if (newName.length > 50) {
      onError('결제수단 이름은 50자 이하로 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await PaymentUtil.renameBillingKey({
        method_idx: method.method_idx,
        method_name: newName.trim()
      });
      
      if (result.success) {
        onRenamed(method.method_idx, newName.trim());
        setIsEditing(false);
      } else {
        onError(result.message || '이름 변경에 실패했습니다.');
      }
    } catch (err) {
      console.error('이름 변경 실패:', err);
      onError('이름 변경 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewName(method.method_name);
  };

  const handleDeleteClick = async () => {
    if (!window.confirm('정말로 이 결제수단을 삭제하시겠습니까?')) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await PaymentUtil.deletePaymentMethod(method.method_idx);
      
      if (result.success) {
        onDeleted(method.method_idx);
      } else {
        onError(result.message || '결제수단 삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('삭제 실패:', err);
      onError('결제수단 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Card>
      <MethodInfo>
        <MethodDetails>
          <MethodName>{method.method_name}</MethodName>
          <MethodMeta>
            <ProviderBadge provider={method.method_provider}>
              {method.method_provider === 'KAKAOPAY' ? '카카오페이' : '토스페이먼츠'}
            </ProviderBadge>
            <br />

            <br />
            <small>등록일: {formatDate(method.method_regdate)}</small>
          </MethodMeta>
        </MethodDetails>
        
        {!isEditing && (
          <ActionButtons>
            <EditButton onClick={handleEditClick} disabled={isLoading}>
              이름 변경
            </EditButton>
            <DeleteButton onClick={handleDeleteClick} disabled={isLoading}>
              삭제
            </DeleteButton>
          </ActionButtons>
        )}
      </MethodInfo>
      
      {isEditing && (
        <EditForm>
          <Input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="새로운 결제수단 이름을 입력하세요"
            maxLength={50}
            disabled={isLoading}
          />
          <FormButtons>
            <SaveButton onClick={handleSaveEdit} disabled={isLoading}>
              {isLoading ? '저장 중...' : '저장'}
            </SaveButton>
            <CancelButton onClick={handleCancelEdit} disabled={isLoading}>
              취소
            </CancelButton>
          </FormButtons>
        </EditForm>
      )}
    </Card>
  );
};

export default PaymentMethodCard;
