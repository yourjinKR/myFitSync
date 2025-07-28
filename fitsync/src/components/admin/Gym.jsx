import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Modal from "./Modal";
import { ButtonSubmit } from "../../styles/FormStyles";
import MapTest, { MapContainer } from "../map/MapTest";
import { GymUtil } from "../../utils/GymUtils";
import { FaAlignLeft, FaAngleDoubleLeft, FaAngleDoubleRight, FaAngleLeft, FaAngleRight, FaHandPointLeft } from "react-icons/fa";

const GymWrapper = styled.div`
  width: calc(100% - 40px);
  min-width: 1025px;
  height: calc(100vh - 120px);
  margin: 0 15px;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 8px;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      font-size: 2.4rem;
      color: var(--text-primary);
    }

    button {
      padding: 10px 20px;
      font-size: 1.6rem;
      background: var(--primary-blue);
      color: var(--text-white);
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: var(--primary-blue-hover);
      }
    }
  }

  .gym-table {
    width: 100%;
    border-collapse: collapse;
    background: var(--bg-primary);
    border-radius: 8px;
    overflow: hidden;

    th,
    td {
      padding: 12px;
      text-align: center;
      font-size: 1.6rem;
      border-bottom: 1px solid var(--border-light);
    }

    th {
      background: var(--bg-secondary);
      color: var(--text-primary);
    }

    td {
      color: var(--text-secondary);
    }

    .actions {
      display: flex;
      justify-content: center;
      gap: 10px;

      button {
        padding: 6px 12px;
        font-size: 1.4rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.2s;
      }

      .edit {
        background: var(--success);
        color: var(--text-primary);
      }

      .delete {
        background: var(--warning);
        color: var(--text-primary);
      }
    }
  }
`;

const ModalContent = styled.div`
  padding: 20px;
  border-radius: 8px;
  color: var(--text-primary);
`;

const ModalHeader = styled.h3`
  text-align: center;
  font-size: 2.4rem;
  margin-bottom: 20px;
  color: var(--text-primary);
`;

const Form = styled.form`
  display: flex;
  flex-direction: ${(props) => (props.column ? "column" : "row")};
  gap: 10px;
  margin-bottom: ${(props) => (props.marginBottom ? "20px" : "0")};
`;

const Input = styled.input`
  flex: ${(props) => (props.flex ? 1 : "initial")};
  padding: 10px;
  border-radius: 4px;
  border: 1px solid var(--border-light);
  background: var(--bg-secondary);
  color: var(--text-primary);
`;

const SubmitButton = styled(ButtonSubmit)`
  padding: 10px 20px;
  background: ${(props) =>
    props.green ? "var(--check-green)" : "var(--primary-blue)"};
  color: var(--text-white);
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const ErrorMessage = styled.div`
  color: var(--warning);
  font-size: 1.4rem;
  margin-top: 10px;
  text-align: center;
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;

  select {
    padding: 10px;
    border-radius: 4px;
    border: 1px solid var(--border-light);
    background: var(--bg-secondary);
    color: var(--text-primary);
    font-size: 1.4rem;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-light);
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  .pagination-button {
    min-width: 40px;
    height: 40px;
    padding: 0 12px;
    font-size: 1.4rem;
    font-weight: 600;
    border: 2px solid var(--border-light);
    background: var(--bg-primary);
    color: var(--text-primary);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover:not(:disabled) {
      background: var(--primary-blue);
      color: var(--text-white);
      border-color: var(--primary-blue);
      transform: translateY(-2px);
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      background: var(--bg-tertiary);
      color: var(--text-tertiary);
    }

    &.active {
      background: var(--primary-blue);
      color: var(--text-white);
      border-color: var(--primary-blue);
    }

    &.nav-button {
      background: var(--bg-secondary);
      border-color: var(--border-medium);
      
      &:hover:not(:disabled) {
        background: var(--primary-blue-light);
      }
    }
  }

  .page-ellipsis {
    padding: 0 8px;
    color: var(--text-tertiary);
    font-size: 1.6rem;
    font-weight: bold;
  }
`;

const PaginationInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;

  .page-info {
    font-size: 1.5rem;
    color: var(--text-primary);
    font-weight: 600;
    
    .highlight {
      font-size: 1.5rem;
      color: var(--primary-blue);
      font-weight: 700;
    }
  }

  .total-info {
    font-size: 1.3rem;
    color: var(--text-secondary);
    
    .total-count {
      color: var(--primary-blue);
      font-weight: 600;
    }
  }
`;

const PageSizeSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  
  label {
    font-size: 1.4rem;
    color: var(--text-primary);
  }
  
  select {
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid var(--border-light);
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 1.4rem;
    cursor: pointer;
    
    &:focus {
      outline: none;
      border-color: var(--primary-blue);
    }
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
        <SubmitButton onClick={handleSearch} disabled={isLoading}>
          검색
        </SubmitButton>
        <button onClick={handleResetSearch} disabled={isLoading}>
          초기화
        </button>
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
              <td colSpan="4">로딩중...</td>
            </tr>
          ) : gyms.length === 0 ? (
            <tr>
              <td colSpan="4">등록된 체육관이 없습니다.</td>
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