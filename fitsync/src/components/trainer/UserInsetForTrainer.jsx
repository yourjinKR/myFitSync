// ✅ UserInsetForTrainer.jsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

/* ---------- styled-components ---------- */
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(20px);
  padding: 2.5rem 2rem;
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  width: 100%;
  max-width: 1200px;
  min-width: 320px;
  margin: 0 auto;
  align-items: stretch;
`;

const Label = styled.label`
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--primary-blue);
  margin-bottom: 0.5rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 1.2rem 2rem;
  border: 1.5px solid var(--border-light);
  border-radius: 10px;
  font-size: 1.6rem;
  background: rgba(255, 255, 255, 0.05);
  margin-top: 0.8rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(74, 144, 226, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  appearance: none;
  outline: none;
  position: relative;

  &:focus {
    border-color: var(--primary-blue-light);
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.12);
    background: linear-gradient(135deg, rgba(74, 144, 226, 0.05), rgba(255, 255, 255, 0.12));
    color: white;
  }

  option[value=''] {
    color: var(--text-secondary);
  }

  option {
    background: #222;
    font-size: 1.5rem;
    padding: 1rem;
    border-radius: 10px;
    font-weight: 500;
  }
  option::hidden{
    color: var(--text-secondary);
  }
`;

const InfoBox = styled.div`
  background: rgba(74, 144, 226, 0.07);
  padding: 2rem 1.5rem;
  border-radius: 14px;
  font-size: 1.5rem;
  color: var(--text-primary);
  line-height: 1.8;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(74, 144, 226, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 0;

  strong {
    color: var(--primary-blue);
    font-size: 1.6rem;
    font-weight: 700;
    margin-right: 0.5rem;
  }
`;

/* ---------- 컴포넌트 ---------- */
const UserInsetForTrainer = ({ matchedUsers = [] }) => {
  const [selectedUserId, setSelectedUserId] = useState(null);

  // 최초 로딩 시 첫 번째 유저 자동 선택
  useEffect(() => {
    if (matchedUsers.length > 0) {
      setSelectedUserId(matchedUsers[0].user_idx);
    }
  }, [matchedUsers]);

  const selectedUser = matchedUsers.find((u) => u.user_idx === parseInt(selectedUserId));

  return (
    <Wrapper>
      <div>
        <Label htmlFor="user">회원 선택</Label>
        <Select
          id="user"
          value={selectedUserId || ''}
          onChange={(e) => setSelectedUserId(e.target.value)}
        >
          <option value="" disabled hidden>
            회원을 선택하세요
          </option>
          {matchedUsers.map((user) => (
            <option key={user.user_idx} value={user.user_idx}>
              {user.member?.member_name || '이름없음'}
            </option>
          ))}
        </Select>
      </div>

      {selectedUser && (
        <InfoBox>
          <div>
            <strong>총 레슨 횟수:</strong> {selectedUser.matching_total}회
          </div>
          <div>
            <strong>남은 레슨:</strong> {selectedUser.matching_remain}회
          </div>
        </InfoBox>
      )}
    </Wrapper>
  );
};

export default UserInsetForTrainer;
