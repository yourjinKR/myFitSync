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
  gap: 2rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom : 1.5rem;
  background: transparent;
`;

const SearchBox = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 1rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1.2rem 4rem 1.2rem 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  font-size: 1.6rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  color: var(--text-primary);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &::placeholder {
    color: var(--text-tertiary);
    font-size: 1.4rem;
  }

  &:focus {
    outline: none;
    border-color: var(--primary-blue);
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.12),
      0 0 0 3px rgba(74, 144, 226, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
`;

const SearchIcon = styled(AiOutlineSearch)`
  position: absolute;
  right: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 2rem;
  color: var(--text-tertiary);
  transition: color 0.3s ease;

  ${SearchBox}:focus-within & {
    color: var(--primary-blue);
  }
`;

const Tabs = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  margin-bottom: 1rem;
`;

const Tab = styled.button`
  background: none;
  border: none;
  font-size: 1.6rem;
  font-weight: 600;
  cursor: pointer;
  padding: 1rem 2rem;
  color: ${({ $active }) => ($active ? 'var(--primary-blue)' : 'var(--text-secondary)')};
  border-radius: 10px;
  transition: all 0.3s ease;
  position: relative;
  
  ${({ $active }) => $active && css`
    background: rgba(74, 144, 226, 0.1);
    color: var(--primary-blue);
    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.2);
  `}

  &:hover {
    background: rgba(74, 144, 226, 0.1);
    color: var(--primary-blue);
  }

  span.count {
    margin-left: 0.5rem;
    background: var(--primary-blue);
    color: white;
    font-size: 1.2rem;
    padding: 0.2rem 0.6rem;
    border-radius: 10px;
    font-weight: 700;
  }
`;

const AddBtn = styled.button`
  margin-left: auto;
  background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-light));
  color: white;
  font-size: 1.4rem;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  padding: 1rem 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover {
    box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
  }
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 10px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(74, 144, 226, 0.5), transparent);
  }

  &:hover {
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }
`;

const CardTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  & > div {
    font-size: 1.8rem;
  }
`;

const LessonInfo = styled.div`
  font-size: 1.6rem;
  color: var(--text-secondary);
  line-height: 1.5;
  background: rgba(74, 144, 226, 0.1);
  padding: 0.8rem 1.2rem;
  border-radius: 5px;
  border-left: 3px solid var(--primary-blue);
`;

const StatusRow = styled.div`
  display: flex;
  gap: 1.5rem;
  font-size: 1.4rem;
  flex-wrap: wrap;
  
  span {
    font-weight: 600;
    padding: 0.6rem 1.2rem;
    border-radius: 10px;
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size : 1.4rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    
    &::before {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }
  }
  
  .done {
    color: var(--primary-blue);
    background: rgba(74, 144, 226, 0.1);
    border: 1px solid rgba(74, 144, 226, 0.2);
    
    &::before {
      background: var(--primary-blue);
    }
  }
  
  .remain {
    color: var(--check-green);
    background: rgba(76, 175, 80, 0.1);
    border: 1px solid rgba(76, 175, 80, 0.2);
    
    &::before {
      background: var(--check-green);
    }
  }
  
  .reserved {
    color: var(--text-tertiary);
    background: rgba(158, 158, 158, 0.1);
    border: 1px solid rgba(158, 158, 158, 0.2);
    
    &::before {
      background: var(--text-tertiary);
    }
  }
`;

const DotRow = styled.div`
  display: flex;
  gap: 0.4rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
  
  div {
    width: 0.8rem;
    height: 0.8rem;
    border-radius: 50%;
    background: var(--primary-blue);
    box-shadow: 
      0 0 0 1px rgba(255, 255, 255, 0.3),
      0 2px 4px rgba(0, 0, 0, 0.2);
    transition: all 0.2s ease;
    
    &:hover {
      transform: scale(1.2);
      box-shadow: 
        0 0 0 2px rgba(255, 255, 255, 0.4),
        0 4px 8px rgba(0, 0, 0, 0.3);
    }
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
        <Tab $active={tab === 'active'} onClick={() => setTab('active')}>
          활성 회원 <span className="count">{activeMembers.length}</span>
        </Tab>
        <Tab $active={tab === 'expired'} onClick={() => setTab('expired')}>
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
        </Card>
      ))}

      {members.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          color: 'var(--text-secondary)',
          fontSize: '1.6rem',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)'
        }}>
          해당 회원이 없습니다.
        </div>
      )}
      {showInsertForm && <UserInsetForTrainer />}
      
    </Wrapper>
  );
};

export default MemberManageView;