import axios from "axios";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Modal from "./Modal";
import { set } from "date-fns";
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

const initLatLng = { lat: 37.5665, lng: 126.9780 };
const initGym = {gym_name: "", gym_latitude: 37.5665, gym_longitude: 126.9780, gym_address: "",};

const Gym = () => {
  const [gyms, setGyms] = useState([initGym]);
  const [newGym, setNewGym] = useState(initGym);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const response = await GymUtil.getGyms();
      setGyms(response.data);
    } catch (error) {
      console.error("Failed to fetch gyms:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    console.log(newGym);
  },[newGym]);

  const [mapPos, setMapPos] = useState(initLatLng); // 지도에 표시할 위치

  const handleAdd = () => {
    setModalMode(ADD);
    setNewGym(initGym);
    setModalOpen(true);
  }

  const handleEdit = async (id) => {
    console.log(`Edit gym with id: ${id}`);
    const {data, success} = await GymUtil.getGym(id);
    if(success) {
      setNewGym(data);
    }

    setModalMode(EDIT);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm('해당 체육관을 삭제하시겠습니까?');

    if (!confirm) return;

    console.log(`Delete gym with id: ${id}`);
    const {data, success} = await GymUtil.deleteGym(id);
    if(success) {
      fetchData();
    }
  };

  /** 체육관 추가 액션 함수 */
  const handleAddGym = async () => {
    const response = await GymUtil.addGym(newGym);
    if (response.success) {
      fetchData();
    }

    setModalOpen(false);
    setNewGym({gym_name: "", gym_latitude: null, gym_longitude: null, gym_address: "",});
  };

  /** 체육관 수정 액션 함수 */
  const handleEditGym = async () => {
    console.log('지금부터 수정할게요 뀨', newGym);
    const gym = newGym;
    
    const response = await GymUtil.updateGym(gym);
    if (response.success) {
      fetchData();
    }

    setModalOpen(false);
  };

  const handleSearchLocation = () => {
    if (!newGym.gym_address || !window.kakao?.maps) return;

    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.addressSearch(newGym.gym_address, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        console.log(result[0]);
        
        const { y, x, address_name } = result[0];
        const gym_latitude = parseFloat(y);
        const gym_longitude = parseFloat(x);
        const gym_address = address_name;
        setNewGym((prev) => ({ ...prev, gym_latitude, gym_longitude, gym_address }));
      } else {
        alert("주소를 찾을 수 없습니다.");
      }
    });
  };
  
  // 모드 분기
  const ADD = {title : '추가', action : handleAddGym}
  const EDIT = {title : '수정', action : handleEditGym}
  const [modalMode, setModalMode] = useState(ADD);

  /** 체육관 모달 */ 
  const setGymModalData = () => {
    return (
      <ModalContent>
        <ModalHeader>체육관 {modalMode.title}</ModalHeader>

        {/* 위치 검색 폼 */}
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearchLocation();
          }}
          marginBottom
        >
          <Input
            type="text"
            placeholder="위치 주소 입력 (예: 서울시 강남구...)"
            value={newGym.gym_address}
            onChange={(e) =>
              setNewGym({ ...newGym, gym_address: e.target.value })
            }
            flex
          />
          <SubmitButton type="submit">찾기</SubmitButton>
        </Form>

        <MapContainer style={{ marginBottom: "20px" }}>
          {newGym && <MapTest position={{lat : newGym.gym_latitude, lng : newGym.gym_longitude}} />}
        </MapContainer>

        {/* 체육관 등록 폼 */}
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            modalMode.action();
          }}
          column
        >
          <Input
            type="text"
            placeholder="체육관명"
            value={newGym.gym_name}
            onChange={(e) => setNewGym({ ...newGym, gym_name: e.target.value })}
          />
          <SubmitButton type="submit" green>
            {modalMode.title}
          </SubmitButton>
        </Form>
      </ModalContent>
    );
  }

  /** 체육관 수정 모달 */


  return (
    <GymWrapper>
      <div className="header">
        <h2>체육관 관리</h2>
        <button onClick={() => handleAdd()}>체육관 추가</button>
      </div>

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
          {gyms.map((gym) => (
            <tr key={gym.gym_idx}>
              <td>{gym.gym_idx}</td>
              <td>{gym.gym_name}</td>
              <td>{gym.gym_address}</td>
              <td className="actions">
                <button className="edit" onClick={() => handleEdit(gym.gym_idx)}>
                  Edit
                </button>
                <button className="delete" onClick={() => handleDelete(gym.gym_idx)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        modalData={setGymModalData()}
      />
    </GymWrapper>
  );
};

export default Gym;
