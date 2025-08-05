import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Modal from "./Modal";
import { ButtonSubmit } from "../../styles/FormStyles";
import MapTest, { MapContainer } from "../map/MapTest";
import { GymUtil } from "../../utils/GymUtils";
import { FaAlignLeft, FaAngleDoubleLeft, FaAngleDoubleRight, FaAngleLeft, FaAngleRight, FaHandPointLeft } from "react-icons/fa";

const GymWrapper = styled.div`
  width: 100%;
  margin: 0 auto;
  padding: 2.4rem;
  background: var(--bg-primary);
  min-height: calc(100vh - 120px);

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 3.2rem;
    padding: 2.4rem;
    background: var(--bg-secondary);
    border-radius: 1.2rem;
    border: 1px solid var(--border-light);

    h2 {
      font-size: 2.8rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
      display: flex;
      align-items: center;
      gap: 1.2rem;
      
      &::before {
        font-size: 3.2rem;
      }
    }

    button {
      padding: 1.2rem 2.4rem;
      font-size: 1.6rem;
      font-weight: 600;
      background: var(--primary-blue);
      color: white;
      border: none;
      border-radius: 0.8rem;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover:not(:disabled) {
        background: var(--primary-blue-hover);
        transform: translateY(-2px);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }
    }
  }

  .gym-table {
    width: 100%;
    border-collapse: collapse;
    background: var(--bg-secondary);
    border-radius: 1.2rem;
    overflow: hidden;
    border: 1px solid var(--border-light);

    th,
    td {
      padding: 1.6rem 2rem;
      text-align: center;
      font-size: 1.6rem;
      border-bottom: 1px solid var(--border-light);
    }

    th {
      background: var(--bg-tertiary);
      color: var(--text-primary);
      font-weight: 700;
      font-size: 1.8rem;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    td {
      color: var(--text-secondary);
      transition: all 0.2s ease;
    }

    tbody tr {
      transition: all 0.2s ease;
      
      &:hover {
        background: var(--bg-tertiary);
        
        td {
          color: var(--text-primary);
        }
      }
    }

    tbody tr:last-child td {
      border-bottom: none;
    }

    .actions {
      display: flex;
      justify-content: center;
      gap: 1.2rem;

      button {
        padding: 0.8rem 1.6rem;
        font-size: 1.4rem;
        font-weight: 500;
        border: none;
        border-radius: 0.6rem;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 6.4rem;
      }

      .edit {
        background: var(--success);
        color: white;

        &:hover:not(:disabled) {
          background: #1f6b43;
          transform: translateY(-2px);
        }
      }

      .delete {
        background: var(--warning);
        color: white;

        &:hover:not(:disabled) {
          background: #d32f2f;
          transform: translateY(-2px);
        }
      }

      button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }
    }
  }

  @media (max-width: 768px) {
    padding: 1.6rem;
    
    .header {
      flex-direction: column;
      gap: 1.6rem;
      text-align: center;
      
      h2 {
        font-size: 2.4rem;
      }
    }
    
    .gym-table {
      font-size: 1.4rem;
      
      th, td {
        padding: 1.2rem 0.8rem;
      }
      
      .actions {
        flex-direction: column;
        gap: 0.8rem;
      }
    }
  }
`;

const ModalContent = styled.div`
  padding: 3.2rem;
  border-radius: 1.2rem;
  color: var(--text-primary);
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
`;

const ModalHeader = styled.h3`
  text-align: center;
  font-size: 2.8rem;
  font-weight: 700;
  margin-bottom: 3.2rem;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: ${(props) => (props.column ? "column" : "row")};
  gap: 1.6rem;
  margin-bottom: ${(props) => (props.marginBottom ? "2.4rem" : "0")};
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.2rem;
  }
`;

const Input = styled.input`
  flex: ${(props) => (props.flex ? 1 : "initial")};
  padding: 1.4rem 1.6rem;
  border-radius: 0.8rem;
  border: 2px solid var(--border-light);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1.6rem;
  font-weight: 500;
  transition: all 0.3s ease;
  height: 5.2rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-blue);
    background: var(--bg-secondary);
  }
  
  &:hover {
    border-color: var(--border-medium);
    background: var(--bg-tertiary);
  }
  
  &::placeholder {
    color: var(--text-tertiary);
    font-weight: 400;
  }
  
  @media (max-width: 768px) {
    height: 4.8rem;
  }
`;

const SubmitButton = styled(ButtonSubmit)`
  padding: 1.4rem 2.4rem;
  background: ${(props) =>
    props.green ? "var(--success)" : "var(--primary-blue)"};
  color: white;
  border: none;
  border-radius: 0.8rem;
  cursor: pointer;
  font-size: 1.6rem;
  font-weight: 600;
  transition: all 0.3s ease;
  min-width: 12rem;

  &:hover:not(:disabled) {
    background: ${(props) =>
      props.green ? "#1f6b43" : "var(--primary-blue-hover)"};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  color: var(--warning);
  font-size: 1.6rem;
  font-weight: 500;
  margin: 1.6rem 0;
  text-align: center;
  padding: 1.2rem;
  background: rgba(244, 67, 54, 0.1);
  border-radius: 0.8rem;
  border: 1px solid rgba(244, 67, 54, 0.2);
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 1.6rem;
  margin-bottom: 3.2rem;
  align-items: stretch;
  padding: 2.4rem;
  background: var(--bg-secondary);
  border-radius: 1.2rem;
  border: 1px solid var(--border-light);
  position: relative;
  
  &::before {
    position: absolute;
    top: -1.2rem;
    left: 2.4rem;
    background: var(--bg-secondary);
    padding: 0 0.8rem;
    font-size: 2rem;
    color: var(--primary-blue);
  }

  .search-group {
    display: flex;
    gap: 1.2rem;
    flex: 1;
    align-items: stretch;
  }

  .button-group {
    display: flex;
    gap: 1.2rem;
    align-items: stretch;
  }

  select {
    padding: 1.4rem 1.6rem;
    border-radius: 0.8rem;
    border: 2px solid var(--border-light);
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 1.6rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 14rem;
    height: 5.2rem;
    
    &:focus {
      outline: none;
      border-color: var(--primary-blue);
    }
    
    &:hover {
      border-color: var(--border-medium);
      background: var(--bg-tertiary);
    }
    
    option {
      background: var(--bg-primary);
      color: var(--text-primary);
      padding: 1rem;
    }
  }
  
  .search-button {
    padding: 1.4rem 2.4rem;
    border-radius: 0.8rem;
    border: 2px solid var(--primary-blue);
    background: var(--primary-blue);
    color: white;
    cursor: pointer;
    font-size: 1.6rem;
    font-weight: 600;
    transition: all 0.3s ease;
    min-width: 10rem;
    height: 5.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;

    &:hover:not(:disabled) {
      background: var(--primary-blue-hover);
      border-color: var(--primary-blue-hover);
      transform: translateY(-2px);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
      background: var(--bg-tertiary);
      border-color: var(--border-light);
      color: var(--text-tertiary);
    }
  }
  
  .reset-button {
    padding: 1.4rem 2rem;
    border-radius: 0.8rem;
    border: 2px solid var(--border-medium);
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 1.6rem;
    font-weight: 500;
    transition: all 0.3s ease;
    min-width: 9rem;
    height: 5.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;

    &:hover:not(:disabled) {
      background: var(--warning);
      border-color: var(--warning);
      color: white;
      transform: translateY(-2px);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.6rem;
    padding: 2rem;
    
    &::before {
      top: -1rem;
      left: 2rem;
    }
    
    .search-group {
      flex-direction: column;
      gap: 1.2rem;
    }
    
    .button-group {
      gap: 1.2rem;
    }
    
    select, .search-button, .reset-button {
      height: 4.8rem;
      min-width: auto;
    }
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.4rem;
  margin-top: 3.2rem;
  padding: 3.2rem;
  background: var(--bg-secondary);
  border-radius: 1.2rem;
  border: 1px solid var(--border-light);
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
  justify-content: center;

  .pagination-button {
    min-width: 4.8rem;
    height: 4.8rem;
    padding: 0 1.2rem;
    font-size: 1.6rem;
    font-weight: 600;
    border: 2px solid var(--border-light);
    background: var(--bg-primary);
    color: var(--text-primary);
    border-radius: 0.8rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover:not(:disabled) {
      background: var(--primary-blue);
      color: white;
      border-color: var(--primary-blue);
      transform: translateY(-2px);
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      background: var(--bg-tertiary);
      color: var(--text-tertiary);
      transform: none;
    }

    &.active {
      background: var(--primary-blue);
      color: white;
      border-color: var(--primary-blue);
    }

    &.nav-button {
      background: var(--bg-secondary);
      border-color: var(--border-medium);
      
      &:hover:not(:disabled) {
        background: var(--primary-blue-light);
        border-color: var(--primary-blue-light);
      }
    }
  }

  .page-ellipsis {
    padding: 0 1.2rem;
    color: var(--text-tertiary);
    font-size: 1.8rem;
    font-weight: bold;
  }

  @media (max-width: 768px) {
    gap: 0.4rem;
    
    .pagination-button {
      min-width: 4rem;
      height: 4rem;
      font-size: 1.4rem;
    }
  }
`;

const PaginationInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;

  .page-info {
    font-size: 1.8rem;
    color: var(--text-primary);
    font-weight: 600;
    text-align: center;
    
    .highlight {
      font-size: 2rem;
      color: var(--primary-blue);
      font-weight: 700;
    }
  }

  .total-info {
    font-size: 1.6rem;
    color: var(--text-secondary);
    text-align: center;
    
    .total-count {
      color: var(--primary-blue);
      font-weight: 600;
    }
  }

  @media (max-width: 768px) {
    .page-info {
      font-size: 1.6rem;
      
      .highlight {
        font-size: 1.8rem;
      }
    }
    
    .total-info {
      font-size: 1.4rem;
    }
  }
`;

const PageSizeSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 1.6rem 2.4rem;
  background: var(--bg-tertiary);
  border-radius: 0.8rem;
  border: 1px solid var(--border-light);
  
  label {
    font-size: 1.6rem;
    font-weight: 500;
    color: var(--text-primary);
  }
  
  select {
    padding: 1rem 1.6rem;
    border-radius: 0.6rem;
    border: 2px solid var(--border-light);
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 1.6rem;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: var(--primary-blue);
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.8rem;
    text-align: center;
  }
`;

const initGym = {
  gym_name: "", 
  gym_latitude: 37.5665, 
  gym_longitude: 126.9780, 
  gym_address: ""
};

const Gym = () => {
  const [gyms, setGyms] = useState([]);
  const [newGym, setNewGym] = useState(initGym);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 검색 및 페이징 관련 상태
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchType, setSearchType] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // 체육관 목록 조회
  const fetchGyms = async (page = currentPage, keyword = searchKeyword, keywordType = searchType, size = pageSize) => {
    try {
      setIsLoading(true);
      const response = await GymUtil.getGyms({
        keyword,
        keywordType,
        page,
        pageSize: size
      });
      
      if (response.success && response.data) {
        setGyms(response.data);
        setTotalCount(response.totalCount || 0);
        setTotalPages(Math.ceil((response.totalCount || 0) / size));
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Failed to fetch gyms:", error);
      setError("체육관 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGyms();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 검색 실행
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchGyms(1, searchKeyword, searchType, pageSize);
  };

  // 페이지 변경
  const handlePageChange = (page) => {
    fetchGyms(page, searchKeyword, searchType, pageSize);
  };

  // 페이지 크기 변경 핸들러
  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setCurrentPage(1);
    fetchGyms(1, searchKeyword, searchType, newSize);
  };

  // 검색 초기화
  const handleResetSearch = () => {
    setSearchKeyword('');
    setSearchType('name');
    setCurrentPage(1);
    fetchGyms(1, '', 'name', pageSize);
  };

  const handleAdd = () => {
    setModalMode('add');
    setNewGym(initGym);
    setError('');
    setModalOpen(true);
  };

  const handleEdit = async (gymIdx) => {
    try {
      setIsLoading(true);
      const response = await GymUtil.getGym(gymIdx);
      if (response.success && response.data) {
        setNewGym(response.data);
        setModalMode('edit');
        setError('');
        setModalOpen(true);
      } else {
        setError("체육관 정보를 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("Failed to fetch gym:", error);
      setError("체육관 정보를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (gymIdx) => {
    const confirmDelete = window.confirm('해당 체육관을 삭제하시겠습니까?');
    if (!confirmDelete) return;

    try {
      setIsLoading(true);
      const response = await GymUtil.deleteGym(gymIdx);
      if (response.success) {
        await fetchGyms(currentPage, searchKeyword, searchType);
      } else {
        setError("체육관 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Failed to delete gym:", error);
      setError("체육관 삭제에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchLocation = async (e) => {
    e.preventDefault();
    
    if (!newGym.gym_address.trim()) {
      setError("주소를 입력해주세요.");
      return;
    }

    if (!window.kakao?.maps) {
      setError("카카오 지도 서비스를 불러올 수 없습니다.");
      return;
    }

    try {
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(newGym.gym_address, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
          const { y, x, address_name } = result[0];
          setNewGym(prev => ({
            ...prev,
            gym_latitude: parseFloat(y),
            gym_longitude: parseFloat(x),
            gym_address: address_name
          }));
          setError('');
        } else {
          setError("주소를 찾을 수 없습니다. 다시 시도해주세요.");
        }
      });
    } catch (error) {
      console.error("Address search error:", error);
      setError("주소 검색 중 오류가 발생했습니다.");
    }
  };

  const handleSaveGym = async (e) => {
    e.preventDefault();
    
    if (!newGym.gym_name.trim()) {
      setError("체육관명을 입력해주세요.");
      return;
    }

    if (!newGym.gym_address.trim()) {
      setError("주소를 검색해주세요.");
      return;
    }

    try {
      setIsLoading(true);
      let response;
      
      if (modalMode === 'add') {
        response = await GymUtil.addGym(newGym);
      } else {
        response = await GymUtil.updateGym(newGym);
      }

      if (response.success) {
        await fetchGyms(currentPage, searchKeyword, searchType);
        setModalOpen(false);
        setNewGym(initGym);
        setError('');
      } else {
        setError(response.message || "저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("Save gym error:", error);
      setError("저장 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setNewGym(initGym);
    setError('');
  };

  // 페이지네이션 렌더링
  const renderPagination = () => {
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalCount);
    
    // 페이지 그룹 계산 (10개씩)
    const pagesPerGroup = 10;
    const currentGroup = Math.ceil(currentPage / pagesPerGroup);
    const startPage = (currentGroup - 1) * pagesPerGroup + 1;
    const endPage = Math.min(currentGroup * pagesPerGroup, totalPages);
    
    return (
      <PaginationContainer>
        <PaginationInfo>
          {totalCount > 0 
            ? `총 ${totalCount}개 중 ${startItem}-${endItem}개 표시`
            : '검색 결과가 없습니다'
          }
        </PaginationInfo>
        
        <PaginationControls>
          {/* 맨 처음으로 */}
          <button 
            className="pagination-button nav-button"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            <FaAngleDoubleLeft/>
          </button>
          
          {/* 이전 그룹 */}
          <button 
            className="pagination-button nav-button"
            onClick={() => handlePageChange(startPage - 1)}
            disabled={startPage === 1}
          >
            <FaAngleLeft/>
          </button>
          
          {/* 페이지 번호들 (현재 그룹의 10개만) */}
          {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(page => (
            <button
              key={page}
              className={`pagination-button ${page === currentPage ? 'active' : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
          
          {/* 다음 그룹 */}
          <button 
            className="pagination-button nav-button"
            onClick={() => handlePageChange(endPage + 1)}
            disabled={endPage === totalPages}
          >
            <FaAngleRight/>
          </button>
          
          {/* 맨 마지막으로 */}
          <button 
            className="pagination-button nav-button"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <FaAngleDoubleRight/>
          </button>
        </PaginationControls>

        <PaginationInfo>
          <div className="page-info">
            <span className="highlight">{currentPage}</span> / {totalPages}
            {totalPages > pagesPerGroup && (
              <span> (그룹 {currentGroup} / {Math.ceil(totalPages / pagesPerGroup)})</span>
            )}
          </div>
        </PaginationInfo>

        <PageSizeSelector>
          <label>페이지 크기:</label>
          <select value={pageSize} onChange={handlePageSizeChange}>
            <option value={5}>5개씩</option>
            <option value={10}>10개씩</option>
            <option value={20}>20개씩</option>
            <option value={50}>50개씩</option>
          </select>
        </PageSizeSelector>
      </PaginationContainer>
    );
  };

  const renderModalContent = () => (
    <ModalContent>
      <ModalHeader>
        체육관 {modalMode === 'add' ? '추가' : '수정'}
      </ModalHeader>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Form onSubmit={handleSearchLocation} marginBottom>
        <Input
          type="text"
          placeholder="위치 주소 입력 (예: 서울시 강남구...)"
          value={newGym.gym_address}
          onChange={(e) =>
            setNewGym(prev => ({ ...prev, gym_address: e.target.value }))
          }
          flex
        />
        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? "검색중..." : "찾기"}
        </SubmitButton>
      </Form>

      <MapContainer style={{ marginBottom: "20px" }}>
        <MapTest 
          position={{
            lat: newGym.gym_latitude, 
            lng: newGym.gym_longitude
          }} 
        />
      </MapContainer>

      <Form onSubmit={handleSaveGym} column>
        <Input
          type="text"
          placeholder="체육관명"
          value={newGym.gym_name}
          onChange={(e) => 
            setNewGym(prev => ({ ...prev, gym_name: e.target.value }))
          }
        />
        <SubmitButton type="submit" green disabled={isLoading}>
          {isLoading 
            ? "저장중..." 
            : modalMode === 'add' ? '추가' : '수정'
          }
        </SubmitButton>
      </Form>
    </ModalContent>
  );

  return (
    <GymWrapper>
      <div className="header">
        <h2>체육관 관리</h2>
        <button onClick={handleAdd} disabled={isLoading}>
          체육관 추가
        </button>
      </div>

      {/* 검색 영역 */}
      <SearchContainer>
        <div className="search-group">
          <select 
            value={searchType} 
            onChange={(e) => setSearchType(e.target.value)}
          >
            <option value="name">체육관명</option>
            <option value="address">주소</option>
            <option value="idx">번호</option>
          </select>
          <Input
            type="text"
            placeholder="검색어를 입력하세요"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            flex
          />
        </div>
        <div className="button-group">
          <button 
            className="search-button"
            onClick={handleSearch} 
            disabled={isLoading}
          >
            검색
          </button>
          <button 
            className="reset-button"
            onClick={handleResetSearch} 
            disabled={isLoading}
          >
            초기화
          </button>
        </div>
      </SearchContainer>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <table className="gym-table">
        <thead>
          <tr>
            <th>번호</th>
            <th>체육관명</th>
            <th>위치</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan="4" style={{ 
                padding: '4rem', 
                fontSize: '1.8rem',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '1.2rem'
                }}>
                  <div style={{
                    width: '2.4rem',
                    height: '2.4rem',
                    border: '3px solid var(--border-light)',
                    borderTop: '3px solid var(--primary-blue)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  로딩중...
                </div>
              </td>
            </tr>
          ) : gyms.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ 
                padding: '4rem', 
                fontSize: '1.8rem',
                color: 'var(--text-tertiary)'
              }}>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  gap: '1.6rem'
                }}>
                  <div style={{ fontSize: '4rem' }}>🏢</div>
                  등록된 체육관이 없습니다.
                </div>
              </td>
            </tr>
          ) : (
            gyms.map((gym) => (
              <tr key={gym.gym_idx}>
                <td>{gym.gym_idx}</td>
                <td>{gym.gym_name}</td>
                <td>{gym.gym_address}</td>
                <td className="actions">
                  <button 
                    className="edit" 
                    onClick={() => handleEdit(gym.gym_idx)}
                    disabled={isLoading}
                  >
                    수정
                  </button>
                  <button 
                    className="delete" 
                    onClick={() => handleDelete(gym.gym_idx)}
                    disabled={isLoading}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* 페이지네이션 */}
      {totalPages > 1 && renderPagination()}

      <Modal
        modalOpen={modalOpen}
        setModalOpen={handleCloseModal}
        modalData={renderModalContent()}
      />
    </GymWrapper>
  );
};

export default Gym;