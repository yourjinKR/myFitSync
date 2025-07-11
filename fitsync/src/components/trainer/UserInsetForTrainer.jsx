// ✅ UserInsetForTrainer.jsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

/* ---------- styled-components ---------- */
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.05);
  width: 100%;
`;

const Label = styled.label`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-secondary);
`;

const Select = styled.select`
  padding: 0.6rem;
  border: 1px solid var(--border-light);
  border-radius: 0.5rem;
  font-size: 1rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  margin-top: 0.5rem;
  &:focus {
    outline: 2px solid var(--primary-blue);
  }
`;

const InfoBox = styled.div`
  background: var(--bg-tertiary);
  padding: 1rem;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  color: var(--text-primary);
  line-height: 1.6;
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
