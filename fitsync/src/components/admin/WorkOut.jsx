import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import Modal from './Modal';
import { blank_img } from '../../utils/common';

const WorkOutWrapper = styled.div`
  width: calc(100% - 40px);
  min-width: 1025px;
  height: calc(100vh - 120px);
  margin: 0 15px;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .table-container {
    margin-top: 20px;
    background: var(--bg-secondary);
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--border-light);
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  table {
    width: 100%;
    border-collapse: collapse;

    th, td {
      padding: 12px;
      text-align: center;
      font-size: 1.6rem;
      border-bottom: 1px solid var(--border-light);
    }

    td {
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-secondary);
      color: var(--text-primary);

      p {
        font-size: 1.6rem;
        color: var(--text-primary);
      }
    }

    th {
      background: var(--primary-blue);
      color: var(--text-primary);
      font-weight: 600;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    
    tr {
      display: flex;
      
      &:last-child td {
        border-bottom: none;
      }
    }
    
    th:nth-child(1), td:nth-child(1) { flex: 0.5; min-width: 75px; }
    th:nth-child(2), td:nth-child(2) { flex: 2; min-width: 200px; word-break: keep-all; }
    th:nth-child(3), td:nth-child(3) { flex: 1.5; min-width: 120px; }
    th:nth-child(4), td:nth-child(4) { flex: 1.5; min-width: 120px; }
    th:nth-child(5), td:nth-child(5) { flex: 1.5; min-width: 120px; }
    th:nth-child(6), td:nth-child(6) { flex: 5; }
    th:nth-child(7), td:nth-child(7) { flex: 4; min-width: 235px; }

    button {
      font-size: 1.4rem;
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
      color: var(--text-primary);
      
      &:hover {
        background: var(--primary-blue-hover);
      }
    }
  }
  
  .table-body {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
  }
`;

const ButtonBox = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  
  button {
    flex: 1;
    min-width: 100px;
    padding: 8px 12px;
    font-size: 1.3rem;
    font-weight: 600;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    text-align: center;
    transition: all 0.2s ease;
  }
  
  button.success {
    background: var(--check-green);
    color: var(--text-primary);
    
    &:hover {
      background: var(--success);
    }
  }
  
  button.warning {
    background: var(--warning);
    color: var(--text-primary);
    
    &:hover {
      background: var(--start-red);
    }
  }
  
  button.show {
    background: var(--primary-blue);
    color: var(--text-primary);
    
    &:hover {
      background: var(--primary-blue-hover);
    }
  }
  
  button:disabled {
    background: var(--border-light) !important;
    color: var(--text-secondary) !important;
    cursor: not-allowed !important;
  }
`;

const WrapperTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  .filter-section {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .search-section {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  button {
    margin-left: 10px;
    padding: 8px 16px;
    font-size: 1.6rem;
    background: var(--primary-blue);
    color: var(--text-primary);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    
    &:hover {
      background: var(--primary-blue-hover);
    }
  }
  
  input {
    background: var(--bg-tertiary);
    min-width: 250px;
    font-size: 1.4rem;
    padding: 10px;
    border: 1px solid var(--border-light);
    border-radius: 4px;
    color: var(--text-primary);
    
    &::placeholder {
      color: var(--text-tertiary);
    }
  }

  select {
    background: var(--bg-tertiary);
    font-size: 1.4rem;
    padding: 10px;
    border-radius: 4px;
    border: 1px solid var(--border-light);
    cursor: pointer;
    color: var(--text-primary);

    option {
      background: var(--bg-secondary);
      color: var(--text-primary);
      font-size: 1.4rem;
    }
  }
`;

const checkImage = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

// ChangeImg 컴포넌트 완성
const ChangeImg = ({ postData, setPostData, idx }) => {
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 파일 확장자 체크
      const ext = file.name.split('.').pop().toLowerCase();
      if (idx === 0 && ext !== 'gif') {
        alert('1번 이미지는 GIF 파일만 가능합니다.');
        return;
      }
      if (idx === 1 && ext !== 'png') {
        alert('2번 이미지는 PNG 파일만 가능합니다.');
        return;
      }
      const images = [...postData.pt_image];
      images[idx] = file; // 파일 객체로 저장
      setPostData({ ...postData, pt_image: images });
    }
  };

  const getImageSrc = () => {
    const imgItem = postData.pt_image[idx];
    if (imgItem && typeof imgItem !== "string") {
      return URL.createObjectURL(imgItem);
    }

    // pt_image 배열에서 string 타입만 대상으로 includes 체크
    if (idx === 0) {
      const found = postData.pt_image.find(
        (img) => typeof img === "string" && img.includes(".gif")
      );
      return found || blank_img;
    } else {
      const found = postData.pt_image.find(
        (img) => typeof img === "string" && img.includes(".png")
      );
      return found || blank_img;
    }
  };

  return (
    <div className="image-upload">
      <label htmlFor={`file_image_${idx}`}>
        <img 
          src={getImageSrc()} 
          alt={`운동 이미지${idx + 1}`}
          style={{ 
            width: '150px', 
            height: '150px', 
            objectFit: 'cover',
            border: '2px dashed var(--border-light)',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        />
      </label>
      <input
        type="file"
        id={`file_image_${idx}`}
        style={{ display: "none" }}
        accept={idx === 0 ? "image/gif" : "image/png"}
        onChange={handleImageChange}
      />
      <small style={{ color: 'white', fontSize: '1.2rem' }}>
        {idx === 0 ? 'GIF 파일만 가능' : 'PNG 파일만 가능'}
      </small>
    </div>
  );
};

const ModalContainer = styled.div`
  background: var(--bg-secondary);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.10);
  padding: 24px;
  min-width: 340px;
  border: 1px solid var(--border-light);
  position: relative;
  z-index: 10;

  .modal-header {
    text-align: center;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border-light);
    background: none;
    h3 {
      color: white;
      font-size: 1.8rem;
      font-weight: 600;
      margin: 0;
      letter-spacing: -0.01em;
    }
  }

  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin-bottom: 16px;
    background: none;
    th, td {
      padding: 10px 12px;
      vertical-align: middle;
      font-size: 1.4rem;
      border-bottom: 1px solid var(--border-light);
    }
    th {
      background: var(--bg-tertiary);
      color: white;
      font-weight: 600;
      text-align: center;
      width: 100px;
      min-width: 100px;
      font-size: 1.3rem;
      letter-spacing: 0;
    }
    td {
      background: var(--bg-secondary);
      input, select, textarea {
        width: 100%;
        padding: 8px 10px;
        border: 1px solid var(--border-light);
        border-radius: 4px;
        font-size: 1.3rem;
        color: white;
        background: var(--bg-tertiary);
        transition: border-color 0.2s ease;
        &:focus {
          outline: none;
          border-color: var(--primary-blue);
        }
        &::placeholder {
          color: var(--text-tertiary);
        }
      }
      textarea {
        min-height: 70px;
        resize: vertical;
        font-family: inherit;
        line-height: 1.4;
      }
      select {
        cursor: pointer;
        option {
          background: var(--bg-secondary);
          color: white;
        }
      }
    }
  }

  .image-upload {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    label {
      cursor: pointer;
      display: block;
      transition: opacity 0.2s ease;
      &:hover {
        opacity: 0.8;
      }
      img {
        border: 1px solid var(--border-light);
        border-radius: 4px;
        transition: border-color 0.2s ease;
        &:hover {
          border-color: var(--primary-blue);
        }
      }
    }
    small {
      color: white;
      font-size: 1.1rem;
      text-align: center;
      font-weight: 400;
    }
  }

  @media (max-width: 600px) {
    padding: 16px;
    min-width: 0;
    border-radius: 6px;
    .modal-header h3 {
      font-size: 1.6rem;
    }
    table th, table td {
      font-size: 1.2rem;
      padding: 8px 6px;
    }
    .image-upload label img {
      width: 100px;
      height: 100px;
    }
  }
`;

const ModalPostData = React.memo(({ postData, setPostData, onClose, onSubmit, modalType }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPostData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit();
  };

  return (
    <ModalContainer>
      <div className="modal-header">
        <h3>{modalType === "add" ? "운동 추가" : "운동 수정"}</h3>
      </div>
      
      <table>
        <tbody>
          <tr>
            <th><label htmlFor="pt_name" style={{color: 'white'}}>운동명</label></th>
            <td>
              <input
                type="text"
                name="pt_name"
                id="pt_name"
                value={postData.pt_name}
                onChange={handleChange}
                placeholder="운동명을 입력하세요"
              />
            </td>
          </tr>
          <tr>
            <th><label htmlFor="pt_category" style={{color: 'white'}}>카테고리</label></th>
            <td>
              <select
                name="pt_category"
                id="pt_category"
                value={postData.pt_category}
                onChange={handleChange}
              >
                <option value="가슴">가슴</option>
                <option value="등">등</option>
                <option value="복근">복근</option>
                <option value="어깨">어깨</option>
                <option value="유산소">유산소</option>
                <option value="팔">팔</option>
                <option value="하체">하체</option>
                <option value="기타">기타</option>
              </select>
            </td>
          </tr>
          <tr>
            <th><label htmlFor="pt_content" style={{color: 'white'}}>설명</label></th>
            <td>
              <textarea
                name="pt_content"
                id="pt_content"
                value={postData.pt_content || ''}
                onChange={handleChange}
                placeholder="운동 설명을 입력하세요"
              ></textarea>
            </td>
          </tr>
          <tr>
            <th style={{color: 'white', fontSize: '1.7rem', fontWeight: 700}}>
              <label htmlFor="file_image_0" style={{color: 'white', fontSize: '1.7rem', fontWeight: 700}}>이미지<br/>(gif)</label>
            </th>
            <td>
              <div className="image-upload">
                <ChangeImg postData={postData} setPostData={setPostData} idx={0} />
              </div>
            </td>
          </tr>
          <tr>
            <th style={{color: 'white', fontSize: '1.7rem', fontWeight: 700}}>
              <label htmlFor="file_image_1" style={{color: 'white', fontSize: '1.7rem', fontWeight: 700}}>이미지<br/>(png)</label>
            </th>
            <td>
              <div className="image-upload">
                <ChangeImg postData={postData} setPostData={setPostData} idx={1} />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      <ButtonBox>
        <button className='success' onClick={handleSubmit}>
          {modalType === "add" ? "추가" : "수정"}
        </button>
        <button className='warning' onClick={onClose}>취소</button>
      </ButtonBox>
    </ModalContainer>
  );
});

const WorkOut = () => {
  const init = {
    pt_idx: '',
    pt_name: '',
    pt_category: '가슴',
    pt_content: '',
    pt_image: [blank_img, blank_img],
  }
  
  const [workoutData, setWorkoutData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [postData, setPostData] = useState(init);
  const [modalType, setModalType] = useState("");
  const [shouldOpenModal, setShouldOpenModal] = useState(false);
  const searchRef = useRef(null);
  
  // 필터 상태 추가
  const [filters, setFilters] = useState({
    category: "",
    status: "",
    search: ""
  });

  // useEffect 추가 - 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    getWorkOutData();
  }, []);

  // shouldOpenModal 상태가 변경될 때 모달 열기
  useEffect(() => {
    if (shouldOpenModal) {
      setModalOpen(true);
      setShouldOpenModal(false);
    }
  }, [shouldOpenModal]);

  // 필터가 변경될 때마다 데이터 필터링
  useEffect(() => {
    if (!originalData) return;
    
    let filteredData = [...originalData];

    // 카테고리 필터
    if (filters.category !== "") {
      filteredData = filteredData.filter(item => item.pt_category === filters.category);
    }

    // 상태 필터
    if (filters.status !== "") {
      filteredData = filteredData.filter(item => 
        item.pt_hidden === (filters.status === "활성화" ? 1 : 0)
      );
    }

    // 검색 필터
    if (filters.search !== "") {
      filteredData = filteredData.filter(item => {
        return (item.pt_name && item.pt_name.includes(filters.search)) ||
          (item.pt_category && item.pt_category.includes(filters.search)) ||
          (item.pt_content && item.pt_content.includes(filters.search));
      });
    }

    setWorkoutData(filteredData);
  }, [filters, originalData]);

  const getWorkOutData = async () => {
    try {
      const response = await axios.get('/admin/workout', { withCredentials: true });
      const data = response.data;
      if (data.success) {
        setWorkoutData(data.list);
        setOriginalData(data.list);
      } else {
        console.error('데이터 로드 실패:', data.msg);
        setWorkoutData([]);
        setOriginalData([]);
      }
    } catch (error) {
      console.error('API 호출 오류:', error);
      setWorkoutData([]);
      setOriginalData([]);
    }
  }

  // 필터링 함수들 수정
  const handleCategoryFilter = (value) => {
    setFilters(prev => ({
      ...prev,
      category: value
    }));
  };

  const handleStatusFilter = (value) => {
    setFilters(prev => ({
      ...prev,
      status: value
    }));
  };

  const handleSearch = () => {
    const searchTerm = searchRef.current.value;
    setFilters(prev => ({
      ...prev,
      search: searchTerm
    }));
    searchRef.current.blur();
  };

  // 필터 초기화 함수 추가
  const resetFilters = () => {
    setFilters({
      category: "",
      status: "",
      search: ""
    });
    searchRef.current.value = "";
  };

  // 업데이트 및 추가 함수 수정
  const updateWorkOutData = async () => {
    const formData = new FormData();
    formData.append('pt_idx', postData.pt_idx);
    formData.append('pt_name', postData.pt_name);
    formData.append('pt_category', postData.pt_category);
    formData.append('pt_content', postData.pt_content);

    postData.pt_image.forEach(item => {
      if (item instanceof File) {
        formData.append('pt_image', item);
      } else if (typeof item === 'string') {
        formData.append('pt_image_description', item);
      }
    });

    const response = await axios.put('/admin/workout', formData, {
      withCredentials: true,
    });
    const result = response.data;
    if (result.success) {
      setPostData(init);
      setModalData(null);
      setModalOpen(false);
      getWorkOutData(); // 데이터 새로고침
    } else {
      alert(result.msg || '수정에 실패했습니다.');
    }
  }

  const handleWorkOutAdd = async () => {
    const formData = new FormData();
    formData.append('pt_name', postData.pt_name);
    formData.append('pt_category', postData.pt_category);
    formData.append('pt_content', postData.pt_content);

    postData.pt_image.forEach(item => {
      if (item instanceof File) {
        formData.append('pt_image', item);
      } else if (typeof item === 'string') {
        formData.append('pt_image_description', item);
      }
    });

    const response = await axios.post('/admin/workout', formData, {
      withCredentials: true,
    });
    const result = response.data;
    if (result.success) {
      setPostData(init);
      setModalOpen(false);
      getWorkOutData(); // 데이터 새로고침
    } else {
      alert(result.msg || '추가에 실패했습니다.');
    }
  }

  const handleModalOpen = (type, content) => {
    setModalType(type);
    if (type === "modify") {
      setPostData({
        pt_idx: content.pt_idx,
        pt_name: content.pt_name,
        pt_category: content.pt_category,
        pt_content: content.pt_content,
        pt_image: (content.pt_image ? content.pt_image.split(',') : [blank_img, blank_img]),
      });
      setShouldOpenModal(true);
    } else if (type === "add") {
      setPostData(init);
      setShouldOpenModal(true);
    } else if (type === "img") {
      checkImage(content).then((exists) => {
        setModalData(
          exists
            ? <img src={content} alt="Award" />
            : <img src="https://res.cloudinary.com/dhupmoprk/image/upload/v1753341186/NoImage_d18r8v.jpg" alt="no-image" />
        );
        setModalOpen(true);
      });
    } 
  };
  
  const hideWorkOutData = async (pt_idx) => {
    const response = await axios.put(`/admin/workout/${pt_idx}`, {
      withCredentials: true,
    });
    const result = response.data;
    if (result.success) {
      getWorkOutData(); // 데이터 새로고침
    } else {
      alert(result.msg || '수정에 실패했습니다.');
    }
  }

  return (
    <WorkOutWrapper>
      <WrapperTop> 
        <div className="filter-section">
          <select 
            name="category" 
            id="category"
            value={filters.category}
            onChange={e => handleCategoryFilter(e.target.value)}
          >
            <option value="">전체</option>
            <option value="가슴">가슴</option>
            <option value="등">등</option>
            <option value="복근">복근</option>
            <option value="어깨">어깨</option>
            <option value="유산소">유산소</option>
            <option value="팔">팔</option>
            <option value="하체">하체</option>
            <option value="기타">기타</option>
          </select>
          <select 
            name="status" 
            id="status"
            value={filters.status}
            onChange={e => handleStatusFilter(e.target.value)}
          >
            <option value="">전체</option>
            <option value="활성화">활성화</option>
            <option value="비활성화">비활성화</option>
          </select>
          <button onClick={() => handleModalOpen("add")}>운동 추가</button>
        </div>
        <div className="search-section">
          <input
            ref={searchRef}
            onKeyUp={e => {
              if (e.key === 'Enter') handleSearch();
            }}
            type="text"
            name="search"
            placeholder="운동명, 카테고리, 설명으로 검색"
          />
          <button onClick={handleSearch}>검색</button>
          <button onClick={resetFilters} style={{ background: 'var(--warning)' }}>
            초기화
          </button>
        </div>
      </WrapperTop>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>번호</th>
              <th>운동명</th>
              <th>카테고리</th>
              <th>이미지1</th>
              <th>이미지2</th>
              <th>설명</th>
              <th>관리</th>
            </tr>
          </thead>
        </table>
        <div className="table-body">
          <table>
            <tbody>
              {
                workoutData && workoutData.length > 0 ? workoutData.map((item, idx) => (
                  <tr key={item.pt_idx}>
                    <td>{idx + 1}</td>
                    <td>{item.pt_name}</td>
                    <td>{item.pt_category}</td>
                    <td>
                      <button onClick={() => handleModalOpen("img", item.pt_image?.split(",")[0])}>[이미지1]</button>
                    </td>
                    <td>
                      <button onClick={() => handleModalOpen("img", item.pt_image?.split(",")[1])}>[이미지2]</button>
                    </td>
                    <td><p className='txt-ov'>{item.pt_content}</p></td>
                    <td>
                      <ButtonBox>
                        <button className="success" onClick={() => handleModalOpen("modify", item)}>수정</button>
                        <button className={item.pt_hidden === 1 ? "show" : "warning"} onClick={() => hideWorkOutData(item.pt_idx)}>{item.pt_hidden === 1 ? "활성화" : "비활성화"}</button>
                      </ButtonBox>
                    </td>
                  </tr>
                )) :
                  <tr>
                    <td colSpan="7" style={{justifyContent: 'center'}}>데이터가 없습니다.</td>
                  </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
      
      <Modal
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        modalData={
            modalType === "modify" || modalType === "add"? (
              <ModalPostData
                postData={postData}
                setPostData={setPostData}
                onClose={() => setModalOpen(false)}
                onSubmit={modalType === "modify" ? updateWorkOutData : handleWorkOutAdd}
                modalType={modalType}
              />
            ) : modalData
          }
        setModalData={setModalData}
        setPostData={setPostData}
      />
    </WorkOutWrapper>
  );
};

export default WorkOut;