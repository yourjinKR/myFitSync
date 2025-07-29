import React, { useEffect, useState } from 'react';
import TrainerProfileList from './TrainerProfileList';
import TrainerInfoList from './TrainerInfoList';
import styled from 'styled-components';
import axios from 'axios';
import { FaFilter } from 'react-icons/fa';

const SearchBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px;
  gap: 10px;

  input[type="text"] {
    flex: 1;
    border: 1px solid var(--border-light);
    border-radius: 5px;
    font-size: 1.4rem;
    padding: 5px 10px;
    background: var(--bg-secondary);
    color: var(--text-primary);
  }

  button {
    background-color: var(--primary-blue);
    color: white;
    border: none;
    border-radius: 5px;
    padding: 8px 12px;
    cursor: pointer;
    font-size: 1rem;
  }

  button:hover {
    background-color: var(--primary-blue-hover);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`;

const FilterModal = styled.div`
  background-color: var(--bg-secondary);
  padding: 20px;
  border-radius: 10px;
  width: 320px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  color: var(--text-primary);

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
  }

  input[type="radio"],
  input[type="time"] {
    margin-right: 10px;
  }

  .modal-footer {
    margin-top: 15px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  button {
    padding: 6px 12px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }

  .apply {
    background: var(--primary-blue);
    color: white;
  }

  .cancel {
    background: var(--border-dark);
    color: white;
  }
`;

const TrainerSearch = () => {
  const [trainers, setTrainers] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [filter, setFilter] = useState({ gender: null, time: null, startTime: '', endTime: '' });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchTrainers();
  }, []);

  /** 필터 초기화 */
  const clearFilter = () => {
    setFilter({ gender: null, time: null, startTime: '', endTime: '' });
  }

  /** 로딩 */
  const fetchTrainers = async () => {
    try {
      const response = await axios.get('/member/trainers', {
        params: {
          keyword,
          gender: filter.gender,
          time: filter.time,
        },
      });
      setTrainers(response.data || []);
    } catch (error) {
      console.error('트레이너 목록 조회 실패:', error);
      setTrainers([]);
    }
  };

  const handleTrainerSearchSubmit = (e) => {
    e.preventDefault();
    fetchTrainers();
  };

  const applyFilter = () => {
    const { startTime, endTime } = filter;
    setFilter((prev) => ({
      ...prev,
      time: startTime && endTime ? `${startTime}~${endTime}` : null,
    }));
    setShowModal(false);
  };

  return (
    <div>
      <TrainerProfileList />
      <SearchBox>
        <form onSubmit={handleTrainerSearchSubmit} style={{ flex: 1, display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="이름 또는 지역"
          />
          <button type="submit">검색</button>
        </form>
        <button type="button" onClick={() => setShowModal(true)}>
          <FaFilter /> 필터
        </button>
      </SearchBox>

      {showModal && (
        <ModalOverlay>
          <FilterModal>
            <button onClick={clearFilter} className='apply'>초기화</button>
            <label>성별</label>
            <label>
              <input
                type="radio"
                name="gender"
                value="남자"
                checked={filter.gender === '남자'}
                onChange={(e) => setFilter({ ...filter, gender: e.target.value })}
              />
              남자
            </label>
            <label>
              <input
                type="radio"
                name="gender"
                value="여자"
                checked={filter.gender === '여자'}
                onChange={(e) => setFilter({ ...filter, gender: e.target.value })}
              />
              여자
            </label>

            <label>운동 가능 시간</label>
            <input
              type="time"
              value={filter.startTime}
              onChange={(e) => setFilter({ ...filter, startTime: e.target.value })}
            />
            ~
            <input
              type="time"
              value={filter.endTime}
              onChange={(e) => setFilter({ ...filter, endTime: e.target.value })}
            />

            <div className="modal-footer">
              <button className="cancel" onClick={() => setShowModal(false)}>취소</button>
              <button className="apply" onClick={applyFilter}>적용</button>
            </div>
          </FilterModal>
        </ModalOverlay>
      )}

      <TrainerInfoList
        trainers={trainers}
        setTrainers={setTrainers}
        fetchTrainers={fetchTrainers}
      />
    </div>
  );
};

export default TrainerSearch;
