import axios from "axios";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Modal from "./Modal";
import { ButtonSubmit } from "../../styles/FormStyles";
import MapTest, { MapContainer } from "../map/MapTest";
import { GymUtil } from "../../utils/GymUtils";

const GymWrapper = styled.div`
  width: calc(100% - 40px);
  min-width: 1025px;
  height: calc(100vh - 120px);
  margin: 0 15px;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

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
        background: var(--primary-blue);
        color: var(--text-white);

        &:hover {
          background: var(--primary-blue-hover);
        }
      }

      .delete {
        background: var(--warning);
        color: var(--text-white);

        &:hover {
          background: #d32f2f;
        }
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

const initLatLng = { lat: 37.5665, lng: 126.9780 };
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
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 체육관 목록 조회
  const fetchGyms = async () => {
    try {
      setIsLoading(true);
      const response = await GymUtil.getGyms();
      if (response.success && response.data) {
        setGyms(response.data);
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
  }, []);

  // 체육관 추가 모달 열기
  const handleAdd = () => {
    setModalMode('add');
    setNewGym(initGym);
    setError('');
    setModalOpen(true);
  };

  // 체육관 수정 모달 열기
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

  // 체육관 삭제
  const handleDelete = async (gymIdx) => {
    const confirmDelete = window.confirm('해당 체육관을 삭제하시겠습니까?');
    if (!confirmDelete) return;

    try {
      setIsLoading(true);
      const response = await GymUtil.deleteGym(gymIdx);
      if (response.success) {
        await fetchGyms(); // 목록 새로고침
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

  // 주소 검색
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

  // 체육관 저장 (추가/수정)
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
        await fetchGyms(); // 목록 새로고침
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

  // 모달 닫기
  const handleCloseModal = () => {
    setModalOpen(false);
    setNewGym(initGym);
    setError('');
  };

  // 모달 컨텐츠
  const renderModalContent = () => (
    <ModalContent>
      <ModalHeader>
        체육관 {modalMode === 'add' ? '추가' : '수정'}
      </ModalHeader>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {/* 위치 검색 폼 */}
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

      {/* 지도 */}
      <MapContainer style={{ marginBottom: "20px" }}>
        <MapTest 
          position={{
            lat: newGym.gym_latitude, 
            lng: newGym.gym_longitude
          }} 
        />
      </MapContainer>

      {/* 체육관 등록/수정 폼 */}
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
                    Edit
                  </button>
                  <button 
                    className="delete" 
                    onClick={() => handleDelete(gym.gym_idx)}
                    disabled={isLoading}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <Modal
        modalOpen={modalOpen}
        setModalOpen={handleCloseModal}
        modalData={renderModalContent()}
      />
    </GymWrapper>
  );
};

export default Gym;