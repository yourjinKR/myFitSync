import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { AiOutlineSearch } from 'react-icons/ai';
import UserInsetForTrainer from './UserInsetForTrainer'; // ✅ 하단 삽입 컴포넌트
import { useSelector } from 'react-redux';
import axios from 'axios';

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
  border: 1px solid var(--border-light);
  border-radius: 0.5rem;
  font-size: 1rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  &::placeholder {
    color: var(--text-tertiary);
  }
  &:focus {
    outline: 2px solid var(--primary-blue);
  }
`;

const SearchIcon = styled(AiOutlineSearch)`
  position: absolute;
  right: 0.9rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.25rem;
  color: var(--text-tertiary);
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
  color: ${({ $active }) => ($active ? 'var(--primary-blue)' : 'var(--text-secondary)')};
  border-bottom: ${({ $active }) => ($active ? '2px solid var(--primary-blue)' : 'none')};
  transition: color 0.2s, border-bottom 0.2s;
  span.count {
    margin-left: 0.25rem;
    color: var(--primary-blue-light);
  }
`;

const AddBtn = styled.button`
  margin-left: auto;
  background: var(--primary-blue);
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  border-radius: 0.5rem;
  padding: 0.6rem 1rem;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: var(--primary-blue-hover);
  }
`;

const Card = styled.div`
  background: var(--bg-secondary);
  border-radius: 0.75rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border: 1px solid var(--border-light);
`;

const CardTop = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
`;

const LessonInfo = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
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
    color: var(--primary-blue);
  }
  .remain {
    color: var(--check-green);
  }
  .reserved {
    color: var(--text-tertiary);
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
    background: var(--border-medium);
  }
`;

  const MemberManageView = () => {
      const [tab, setTab] = useState('active');
      const [keyword, setKeyword] = useState('');
      const [showInsertForm, setShowInsertForm] = useState(false);
      const [activeMembers, setActiveMembers] = useState([]);
      const [expiredMembers, setExpiredMembers] = useState([]);
      const { member_idx } = useSelector((state) => state.user.user);

      useEffect(() => {
      if (!member_idx) return;

      axios.get(`/trainer/${member_idx}/matched-members`)
        .then((res) => {
          const active = [];
          const expired = [];

          res.data.forEach((m) => {
            const total = m.matching_total;
            const remain = m.matching_remain;
            const done = total - remain;

            const card = {
              id: m.user_idx,
              name: m.member?.member_name || '이름없음',
              lessonInfo: `수업 ${total}회권`,
              done,
              remain,
              reserved: 0,
              dots: total,
              startDate: m.matching_start,
              endDate: m.matching_end,
            };

            if (m.matching_complete === 1) {
              active.push(card);
            } else if (m.matching_complete === 2) {
              expired.push(card);
            }
          });

          setActiveMembers(active);
          setExpiredMembers(expired);
        })
        .catch((err) => {
          console.error('회원 정보 불러오기 실패:', err);
        });
    }, [member_idx]);

  const members = (tab === 'active' ? activeMembers : expiredMembers).filter((m) =>
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
          활성 회원 <span className="count">{activeMembers.length}</span>
        </Tab>
        <Tab active={tab === 'expired'} onClick={() => setTab('expired')}>
          만료 회원 <span className="count">{expiredMembers.length}</span>
        </Tab>

        <AddBtn onClick={() => setShowInsertForm((prev) => !prev)}>
          {showInsertForm ? '닫기' : '+ 회원 추가하기'}
        </AddBtn>
      </Tabs>

      {members.map((m) => (
        <Card key={m.id}>
          <CardTop>
            <div>{m.name}</div>
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