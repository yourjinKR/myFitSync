import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { AiOutlineSearch } from 'react-icons/ai';
import UserInsetForTrainer from './UserInsetForTrainer'; // ✅ 하단 삽입 컴포넌트

/* ---------- styled-components ---------- */
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
`;

const SearchBox = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.85rem 3rem 0.85rem 1.25rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  font-size: 1rem;
  &:focus {
    outline: 2px solid #5b6eff;
  }
`;

const SearchIcon = styled(AiOutlineSearch)`
  position: absolute;
  right: 0.9rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.25rem;
  color: #666;
`;

const Tabs = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
`;

const Tab = styled.button`
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  padding-bottom: 0.25rem;
  ${({ active }) =>
    active &&
    css`
      border-bottom: 2px solid #000;
    `}
  span.count {
    margin-left: 0.25rem;
    color: #5b6eff;
  }
`;

const AddBtn = styled.button`
  margin-left: auto;
  background: #5b6eff;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  border-radius: 0.5rem;
  padding: 0.6rem 1rem;
  cursor: pointer;
  &:hover {
    background: #4a5de0;
  }
`;

const Card = styled.div`
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const CardTop = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 1rem;
  font-weight: 600;
`;

const LessonInfo = styled.div`
  font-size: 0.9rem;
  color: #555;
  line-height: 1.3;
`;

const StatusRow = styled.div`
  display: flex;
  gap: 0.75rem;
  font-size: 0.9rem;
  span {
    font-weight: 600;
  }
  .done {
    color: #007bff;
  }
  .remain {
    color: #30a330;
  }
  .reserved {
    color: #777;
  }
`;

const DotRow = styled.div`
  display: flex;
  gap: 0.25rem;
  margin-top: 0.2rem;
  div {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: #ccc;
  }
`;

/* ---------- 더미 데이터 ---------- */
const dummyMembers = {
  active: [
    {
      id: 1,
      name: '유어진',
      phone: '010-1234-5678',
      lessonInfo: '수업 10회권 / 2025-12-31',
      done: 1,
      remain: 9,
      reserved: 1,
    },
  ],
  expired: [],
};

const MemberManageView = () => {
  const [tab, setTab] = useState('active');
  const [keyword, setKeyword] = useState('');
  const [showInsertForm, setShowInsertForm] = useState(false);

  const members = dummyMembers[tab].filter((m) =>
    m.name.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <Wrapper>
      <SearchBox>
        <SearchInput
          placeholder="검색"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <SearchIcon />
      </SearchBox>

      <Tabs>
        <Tab active={tab === 'active'} onClick={() => setTab('active')}>
          활성 회원 <span className="count">{dummyMembers.active.length}</span>
        </Tab>
        <Tab active={tab === 'expired'} onClick={() => setTab('expired')}>
          만료 회원 <span className="count">{dummyMembers.expired.length}</span>
        </Tab>

        <AddBtn onClick={() => setShowInsertForm((prev) => !prev)}>
          {showInsertForm ? '닫기' : '+ 회원 추가하기'}
        </AddBtn>
      </Tabs>

      {/* 회원 카드 리스트 */}
      {members.map((m) => (
        <Card key={m.id}>
          <CardTop>
            <div>{m.name}</div>
            <div>{m.phone}</div>
          </CardTop>

          <LessonInfo>{m.lessonInfo}</LessonInfo>

          <StatusRow>
            <span className="done">완료 {m.done}</span>
            <span className="remain">잔여 {m.remain}</span>
            <span className="reserved">(예약 {m.reserved})</span>
          </StatusRow>

          <DotRow>
            {Array.from({ length: m.dots || 0 }).map((_, i) => (
              <div key={i} />
            ))}
          </DotRow>
        </Card>
      ))}

      {members.length === 0 && <p>해당 회원이 없습니다.</p>}
      {showInsertForm && <UserInsetForTrainer />}
    </Wrapper>
  );
};

export default MemberManageView;
