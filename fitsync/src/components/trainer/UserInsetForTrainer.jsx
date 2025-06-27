// ✅ UserInsetForTrainer.jsx
import React, { useState } from 'react';
import styled from 'styled-components';

// 🟦 더미 데이터 (나중에 API로 대체)
const matchedUsers = [
  { id: 1, name: '김회원', total: 20, remain: 15 },
  { id: 2, name: '박회원', total: 10, remain: 3 },
  { id: 3, name: '최회원', total: 15, remain: 15 },
];

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: #fff;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.05);
  width: 100%;
`;

const Label = styled.label`
  font-size: 1rem;
  font-weight: 600;
`;

const Select = styled.select`
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  font-size: 1rem;
  &:focus {
    outline: 2px solid #5b6eff;
  }
`;

const InfoBox = styled.div`
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  color: #333;
  line-height: 1.6;
`;

const UserInsetForTrainer = () => {
  const [selectedUserId, setSelectedUserId] = useState(matchedUsers[0].id);

  const selectedUser = matchedUsers.find((u) => u.id === parseInt(selectedUserId));

  return (
    <Wrapper>
      <div>
        <Label htmlFor="user">회원 선택</Label>
        <Select
          id="user"
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}>
          {matchedUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </Select>
      </div>

      <InfoBox>
        <div><strong>총 레슨 횟수:</strong> {selectedUser.total}회</div>
        <div><strong>남은 레슨:</strong> {selectedUser.remain}회</div>
      </InfoBox>
    </Wrapper>
  );
};

export default UserInsetForTrainer;
