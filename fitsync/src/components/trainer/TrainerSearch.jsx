import React, { useEffect, useState, useCallback } from 'react';
import TrainerInfoList from './TrainerInfoList';
import styled from 'styled-components';
import axios from 'axios';
import { FaFilter, FaSearch } from 'react-icons/fa';

const Container = styled.div`
  max-width: 100%;
  margin: 0;
  padding: 16px;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  min-height: 100vh;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 200px;
    background: linear-gradient(135deg, 
      rgba(74, 144, 226, 0.1) 0%, 
      rgba(53, 122, 189, 0.05) 100%);
    border-radius: 0 0 50px 50px;
    z-index: 0;
  }
  
  > * {
    position: relative;
    z-index: 1;
  }
  
  @media (min-width: 768px) {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    
    &::before {
      height: 250px;
    }
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 30px;
  padding: 20px 0;
  
  h1 {
    color: var(--text-primary);
    font-size: 2.4rem;
    font-weight: 800;
    margin-bottom: 10px;
    background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-hover));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    
    @media (min-width: 768px) {
      font-size: 3.2rem;
      margin-bottom: 16px;
    }
  }
  
  p {
    color: var(--text-secondary);
    font-size: 1.3rem;
    font-weight: 400;
    opacity: 0.9;
    
    @media (min-width: 768px) {
      font-size: 1.5rem;
    }
  }
`;

const SearchSection = styled.div`
  background: var(--bg-secondary);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid var(--border-light);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--primary-blue), var(--primary-pink), var(--primary-blue));
  }
  
  @media (min-width: 768px) {
    padding: 25px;
    border-radius: 24px;
  }
`;

const SearchBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  .search-form {
    background: var(--bg-primary);
    border-radius: 16px;
    padding: 4px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    display: flex;
    align-items: center;
    gap: 8px;
    border: 2px solid var(--border-light);
    transition: all 0.3s ease;
    
    &:focus-within {
      border-color: var(--primary-blue);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  }

  .search-input-wrapper {
    flex: 1;
    position: relative;
  }

  input[type="text"] {
    width: 100%;
    border: none;
    border-radius: 12px;
    font-size: 1.1rem;
    padding: 14px 18px 14px 44px;
    background: transparent;
    color: var(--text-primary);
    outline: none;
    
    &::placeholder {
      color: var(--text-secondary);
      font-size: 1rem;
    }
    
    @media (min-width: 768px) {
      font-size: 1.2rem;
      padding: 16px 22px 16px 50px;
      
      &::placeholder {
        font-size: 1.1rem;
      }
    }
  }

  .search-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-secondary);
    font-size: 1.1rem;
    
    @media (min-width: 768px) {
      left: 18px;
      font-size: 1.2rem;
    }
  }

  .search-btn {
    background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-hover));
    color: white;
    border: none;
    border-radius: 12px;
    padding: 14px 18px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 90px;
    justify-content: center;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 3px 12px rgba(59, 130, 246, 0.25);
    }

    &:active {
      transform: translateY(0);
    }
    
    @media (min-width: 768px) {
      padding: 16px 26px;
      font-size: 1.1rem;
      gap: 10px;
      
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
      }
    }
  }

  .filter-section {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding: 4px 0;
    
    &::-webkit-scrollbar {
      display: none;
    }
    
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .filter-chip {
    background: var(--bg-primary);
    color: var(--text-primary);
    border: 2px solid var(--border-light);
    border-radius: 20px;
    padding: 10px 18px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    transition: all 0.3s ease;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 8px;
    
    &.active {
      background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-hover));
      color: white;
      border-color: transparent;
    }

    &:hover {
      border-color: var(--primary-blue);
      color: var(--primary-blue);
      background: rgba(59, 130, 246, 0.03);
    }
    
    &.active:hover {
      color: white;
    }
    
    @media (min-width: 768px) {
      padding: 12px 22px;
      font-size: 1.1rem;
      border-radius: 24px;
      gap: 10px;
    }
  }
  
  @media (min-width: 768px) {
    gap: 16px;
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
  align-items: flex-end;
  justify-content: center;
  z-index: 999;
  backdrop-filter: blur(4px);
  
  @media (min-width: 768px) {
    align-items: center;
  }
`;

const FilterModal = styled.div`
  background: var(--bg-secondary);
  border-radius: 24px 24px 0 0;
  width: 100%;
  color: var(--text-primary);
  animation: slideUp 0.3s ease-out;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border-light);
  
  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
  
  @media (min-width: 768px) {
    border-radius: 20px;
    width: 480px;
    animation: fadeIn 0.3s ease-out;
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  }

  .modal-header {
    padding: 24px 24px 16px;
    border-bottom: 1px solid var(--border-light);
    position: sticky;
    top: 0;
    background: var(--bg-secondary);
    z-index: 10;
    border-radius: 24px 24px 0 0;
    
    @media (min-width: 768px) {
      border-radius: 20px 20px 0 0;
    }
    
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    
    h3 {
      font-size: 1.7rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
      background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-hover));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .close-btn {
      background: var(--bg-primary);
      border: 1px solid var(--border-light);
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        background: var(--primary-blue);
        color: white;
        border-color: var(--primary-blue);
        transform: scale(1.05);
      }
    }
    
    .subtitle {
      color: var(--text-secondary);
      font-size: 1.1rem;
      margin: 0;
      opacity: 0.8;
    }
  }

  .modal-content {
    padding: 24px;
  }

  .filter-group {
    margin-bottom: 32px;
    
    .filter-label {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      font-weight: 600;
      color: var(--text-primary);
      font-size: 1.2rem;
      
      &::before {
        content: '';
        width: 4px;
        height: 16px;
        background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-hover));
        border-radius: 2px;
      }
    }
    
    .radio-group {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      
      .radio-item {
        background: var(--bg-primary);
        border: 2px solid var(--border-light);
        border-radius: 12px;
        padding: 16px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        position: relative;
        overflow: hidden;
        
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--primary-blue), var(--primary-pink));
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }
        
        &:hover {
          border-color: var(--primary-blue);
          background: rgba(59, 130, 246, 0.03);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        &.selected {
          border-color: var(--primary-blue);
          background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-hover));
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
          
          &::before {
            transform: scaleX(1);
          }
        }
        
        input[type="radio"] {
          display: none;
        }
        
        span {
          font-size: 1.1rem;
          font-weight: 500;
        }
      }
    }
    
    .time-inputs {
      background: var(--bg-primary);
      border-radius: 16px;
      padding: 20px;
      border: 1px solid var(--border-light);
      
      .time-row {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      
      input[type="time"] {
        flex: 1;
        background: var(--bg-secondary);
        border: 2px solid var(--border-light);
        border-radius: 10px;
        padding: 12px 16px;
        color: var(--text-primary);
        font-size: 1rem;
        transition: all 0.3s ease;
        
        &:focus {
          outline: none;
          border-color: var(--primary-blue);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          background: var(--bg-primary);
          color: var(--text-primary);
        }
      }
      
      .time-separator {
        color: var(--text-secondary);
        font-weight: 700;
        font-size: 1.4rem;
        background: var(--bg-secondary);
        border-radius: 50%;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--border-light);
      }
    }
  }

  .modal-footer {
    padding: 20px 24px;
    background: var(--bg-primary);
    border-radius: 0 0 24px 24px;
    display: flex;
    gap: 12px;
    border-top: 1px solid var(--border-light);
    
    @media (min-width: 768px) {
      border-radius: 0 0 20px 20px;
      padding: 24px;
    }
  }

  .modal-btn {
    flex: 1;
    padding: 18px 26px;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-size: 1.1rem;
    font-weight: 600;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    
    &.cancel {
      background: var(--bg-secondary);
      color: var(--text-secondary);
      border: 2px solid var(--border-light);
      
      &:hover {
        background: var(--border-light);
        color: var(--text-primary);
        transform: translateY(-1px);
      }
    }
    
    &.apply {
      background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-hover));
      color: white;
      border: 2px solid transparent;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
      }
      
      &:active {
        transform: translateY(0);
      }
    }
  }
  
  .reset-section {
    padding: 20px 24px;
    border-bottom: 1px solid var(--border-light);
    
    .reset-btn {
      width: 100%;
      background: var(--bg-primary);
      color: var(--primary-blue);
      border: 2px solid var(--primary-blue);
      border-radius: 10px;
      padding: 14px 18px;
      font-size: 1.1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      
      &:hover {
        background: var(--primary-blue);
        color: white;
        transform: translateY(-1px);
        box-shadow: 0 3px 12px rgba(59, 130, 246, 0.25);
      }
      
      &::before {
        content: '↺';
        font-size: 1.3rem;
      }
    }
  }
`;

const TrainerSearch = () => {
  const [trainers, setTrainers] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [filter, setFilter] = useState({ gender: null, time: null, startTime: '', endTime: '' });
  const [showModal, setShowModal] = useState(false);

  /** 로딩 */
  const fetchTrainers = useCallback(async () => {
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
      setTrainers([]);
    }
  }, [keyword, filter.gender, filter.time]);

  useEffect(() => {
    fetchTrainers();
  }, [fetchTrainers]);

  /** 필터 초기화 */
  const clearFilter = async () => {
    const resetFilter = { gender: null, time: null, startTime: '', endTime: '' };
    setFilter(resetFilter);
    
    // 즉시 API 호출
    try {
      const response = await axios.get('/member/trainers', {
        params: {
          keyword,
          gender: null,
          time: null,
        },
      });
      setTrainers(response.data || []);
    } catch (error) {
      console.error('트레이너 목록 조회 실패:', error);
      setTrainers([]);
    }
  };

  /** 빠른 필터 선택 */
  const handleQuickFilter = async (gender) => {
    const newFilter = { ...filter, gender };
    setFilter(newFilter);
    
    // 즉시 API 호출
    try {
      const response = await axios.get('/member/trainers', {
        params: {
          keyword,
          gender,
          time: newFilter.time,
        },
      });
      setTrainers(response.data || []);
    } catch (error) {
      setTrainers([]);
    }
  };

  /** 모달 내 성별 필터 선택 */
  const handleGenderChange = async (gender) => {
    const newFilter = { ...filter, gender };
    setFilter(newFilter);
    
    // 즉시 API 호출
    try {
      const response = await axios.get('/member/trainers', {
        params: {
          keyword,
          gender,
          time: newFilter.time,
        },
      });
      setTrainers(response.data || []);
    } catch (error) {
      setTrainers([]);
    }
  };

  /** 시간 필터 변경 */
  const handleTimeChange = (field, value) => {
    setFilter(prev => ({ ...prev, [field]: value }));
  };

  const handleTrainerSearchSubmit = (e) => {
    e.preventDefault();
    fetchTrainers();
  };

  const applyFilter = async () => {
    const { startTime, endTime } = filter;
    const timeFilter = startTime && endTime ? `${startTime}~${endTime}` : null;
    const newFilter = { ...filter, time: timeFilter };
    setFilter(newFilter);
    setShowModal(false);
    
    // 즉시 API 호출
    try {
      const response = await axios.get('/member/trainers', {
        params: {
          keyword,
          gender: newFilter.gender,
          time: timeFilter,
        },
      });
      setTrainers(response.data || []);
    } catch (error) {
      console.error('트레이너 목록 조회 실패:', error);
      setTrainers([]);
    }
  };

  const quickFilters = [
    { label: '전체', value: null },
    { label: '남성 트레이너', value: '남성' },
    { label: '여성 트레이너', value: '여성' },
  ];

  return (
    <Container>
      <Header>
        <h1>전문 트레이너 찾기</h1>
        <p>나에게 맞는 전문 트레이너를 찾아보세요</p>
      </Header>

      <SearchSection>
        <SearchBox>
          <form onSubmit={handleTrainerSearchSubmit} className="search-form">
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="트레이너 이름 또는 지역을 검색하세요"
              />
            </div>
            <button type="submit" className="search-btn">
              <FaSearch />
            </button>
          </form>
          
          <div className="filter-section">
            {quickFilters.map((filterItem) => (
              <button
                key={filterItem.label}
                type="button"
                onClick={() => handleQuickFilter(filterItem.value)}
                className={`filter-chip ${filter.gender === filterItem.value ? 'active' : ''}`}
              >
                {filterItem.label}
              </button>
            ))}
            <button 
              type="button" 
              onClick={() => setShowModal(true)} 
              className="filter-chip"
            >
              <FaFilter />
              상세 필터
            </button>
          </div>
        </SearchBox>
      </SearchSection>

      {showModal && (
        <ModalOverlay onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <FilterModal>
            <div className="modal-header">
              <div className="header-top">
                <h3>검색 필터</h3>
                <button onClick={() => setShowModal(false)} className="close-btn">
                  ×
                </button>
              </div>
              <p className="subtitle">원하는 조건을 선택해주세요</p>
            </div>

            <div className="reset-section">
              <button onClick={clearFilter} className="reset-btn">
                필터 초기화
              </button>
            </div>

            <div className="modal-content">
              <div className="filter-group">
                <span className="filter-label">성별</span>
                <div className="radio-group">
                  <label className={`radio-item ${filter.gender === '남성' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="gender"
                      value="남성"
                      checked={filter.gender === '남성'}
                      onChange={(e) => handleGenderChange(e.target.value)}
                    />
                    <span>남성 트레이너</span>
                  </label>
                  <label className={`radio-item ${filter.gender === '여성' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="gender"
                      value="여성"
                      checked={filter.gender === '여성'}
                      onChange={(e) => handleGenderChange(e.target.value)}
                    />
                    <span>여성 트레이너</span>
                  </label>
                </div>
              </div>

              <div className="filter-group">
                <span className="filter-label">운동 가능 시간</span>
                <div className="time-inputs">
                  <div className="time-row">
                    <input
                      type="time"
                      value={filter.startTime}
                      onChange={(e) => handleTimeChange('startTime', e.target.value)}
                    />
                    <div className="time-separator">~</div>
                    <input
                      type="time"
                      value={filter.endTime}
                      onChange={(e) => handleTimeChange('endTime', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="modal-btn cancel" onClick={() => setShowModal(false)}>
                취소
              </button>
              <button className="modal-btn apply" onClick={applyFilter}>
                적용하기
              </button>
            </div>
          </FilterModal>
        </ModalOverlay>
      )}

      <TrainerInfoList
        trainers={trainers}
        setTrainers={setTrainers}
        fetchTrainers={fetchTrainers}
      />
    </Container>
  );
};

export default TrainerSearch;
