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

      p {font-size: 1.6rem}
    }

    th {
      color: var(--text-white);
    }
    
    tr {
      display: flex;
    }
    th:nth-child(1), td:nth-child(1) { flex: 1; }
    th:nth-child(2), td:nth-child(2) { flex: 5; }
    th:nth-child(3), td:nth-child(3) { flex: 1.5; }
    th:nth-child(4), td:nth-child(4) { flex: 1.5; }
    th:nth-child(5), td:nth-child(5) { flex: 1.5; }
    th:nth-child(6), td:nth-child(6) { flex: 5; }
    th:nth-child(7), td:nth-child(7) { flex: 4; }

    button {
      font-size: 1.4rem;
    }
  }
  & .table-body {
    height: calc(100% - 105px);
    overflow-y: auto;
  }
`;

const ButtonBox = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  width: 100%;
  button {
    flex: 1;
    max-width: 120px;
    padding: 6px 12px;
    font-size: 1.4rem;
    background: var(--bg-primary);
    color: var(--text-secondary);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    text-align: center;
    transition: background 0.2s;
  }
  button.success {
    background: var(--check-green);
    color: var(--text-white);
  }
  button.warning {
    background: var(--warning);
    color: var(--text-white);
  }
  button.show {
    background: var(--primary-blue);
    color: var(--text-white);
  }
  button:disabled {
    background: var(--border-light);
    color: var(--text-secondary);
    cursor: not-allowed;
  }
`;

const WrapperTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  button {
    margin-left: 10px;
    padding: 8px 16px;
    font-size: 1.6rem;
    background: var(--primary-blue);
    color: var(--text-white);
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  input {
    background: var(--bg-tertiary);
    min-width: 250px;
    font-size: 1.4rem;
    padding: 10px;
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

  return (
    <>
      <label htmlFor={`file_image_${idx}`}>
        
        {postData.pt_image[idx] && typeof postData.pt_image[idx] !== "string" ? (
          <img src={URL.createObjectURL(postData.pt_image[idx])} alt={`운동 이미지${idx + 1}`} />
        ) : (
          <img src={idx === 0 ? postData.pt_image.find((img) => img.includes(".gif")) : postData.pt_image.find((img) => img.includes(".png"))} alt={`운동 이미지${idx + 1}`} />
        )}
      </label>
      <input
        type="file"
        id={`file_image_${idx}`}
        style={{ display: "none" }}
        accept={idx === 0 ? "image/gif" : "image/png"}
        onChange={handleImageChange}
      />
    </>
  );
};

const ModalPostData = React.memo(({ postData, setPostData, onClose, onSubmit, modalType }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPostData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit();
  };

  return (
    <>
      <h3>운동 수정</h3>
      <table>
        <tbody>
          <tr>
            <th><label htmlFor="pt_name">운동명</label></th>
            <td>
              <input
                type="text"
                name="pt_name"
                id="pt_name"
                value={postData.pt_name}
                onChange={handleChange}
              />
            </td>
          </tr>
          <tr>
            <th><label htmlFor="pt_category" className='ta-c'>카테고리</label></th>
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
            <th><label htmlFor="pt_content" className='ta-c'>설명</label></th>
            <td>
              <textarea
                name="pt_content"
                id="pt_content"
                value={postData.pt_content || ''}
                onChange={handleChange}
              ></textarea>
            </td>
          </tr>
          <tr>
            <th className='ta-c'>이미지<br/>(gif)</th>
            <td>
              <ChangeImg postData={postData} setPostData={setPostData} idx={0} />
            </td>
          </tr>
          <tr>
            <th className='ta-c'>이미지<br/>(png)</th>
            <td>
              <ChangeImg postData={postData} setPostData={setPostData} idx={1} />
            </td>
          </tr>
        </tbody>
      </table>
      <ButtonBox>
        {modalType === "add" ? (
          <button className='success' onClick={handleSubmit}>추가</button>
        ) : (
          <button className='success' onClick={handleSubmit}>수정</button>
        )}
        <button onClick={onClose}>취소</button>
      </ButtonBox>
    </>
  );
});

const WorkOut = () => {
  const init = {
    pt_idx: '',
    pt_name: '',
    pt_category: '가슴',
    pt_content: '',
    pt_image: [blank_img, blank_img], // 배열로!
  }
  const [workoutData, setWorkoutData] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [postData, setPostData] = useState(init);
  const [modalType, setModalType] = useState(""); // 추가
  const [shouldOpenModal, setShouldOpenModal] = useState(false);
  const searchRef = useRef(null);

  const getWorkOutData = async () => {
    const response = await axios.get('/admin/workout', { withCredentials: true });
    const data = response.data;
    if (data.success) {
      setWorkoutData(data.list);
    }
  }

  const updateWorkOutData = async () => {
    const formData = new FormData();
    formData.append('pt_idx', postData.pt_idx);
    formData.append('pt_name', postData.pt_name);
    formData.append('pt_category', postData.pt_category);
    formData.append('pt_content', postData.pt_content);

    postData.pt_image.forEach(item => {
      if (item instanceof File) {  // 파일 객체인 경우
        formData.append('pt_image', item);
      } else if (typeof item === 'string') {  // 문자열인 경우
        formData.append('pt_image_description', item);  // 텍스트는 다른 이름으로 추가
      }
    });

    // 서버에 PUT 요청
    const response = await axios.put('/admin/workout', formData, {
      withCredentials: true,
    });
    const result = response.data;
    if (result.success) {
      setWorkoutData(result.list);
      setPostData(init);
      setModalData(null);
      setModalOpen(false);
      getWorkOutData();
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
      if (item instanceof File) {  // 파일 객체인 경우
        formData.append('pt_image', item);
      } else if (typeof item === 'string') {  // 문자열인 경우
        formData.append('pt_image_description', item);  // 텍스트는 다른 이름으로 추가
      }
    });

    // 서버에 POST 요청
    const response = await axios.post('/admin/workout', formData, {
      withCredentials: true,
    });
    const result = response.data;
    if (result.success) {
      setWorkoutData(result.list);
      setPostData(init);
      setModalOpen(false);
      getWorkOutData();
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
    // 서버에 PUT 요청
    const response = await axios.put(`/admin/workout/${pt_idx}`, {
      withCredentials: true,
    });
    const result = response.data;
    if (result.success) {
      getWorkOutData();
    } else {
      alert(result.msg || '수정에 실패했습니다.');
    }
  }

  const handleSearch = () => {
    const searchTerm = searchRef.current.value;
    const filteredData = workoutData.filter(item => {
      return (item.pt_name && item.pt_name.includes(searchTerm)) ||
        (item.pt_category && item.pt_category.includes(searchTerm)) ||
        (item.pt_content && item.pt_content.includes(searchTerm));
    });
    setWorkoutData(filteredData);
    searchRef.current.blur(); // 검색 후 입력창 포커스 해제
  };
  

  useEffect(() => {
    getWorkOutData();
  }, []);

  useEffect(() => {
  }, [workoutData]);

  useEffect(() => {
    if (!modalOpen) {
      setModalData(null);
      setPostData(init);
    }
  }, [modalOpen]);

  useEffect(() => {
    if (shouldOpenModal) {
      setModalOpen(true);
      setShouldOpenModal(false);
    }
  }, [shouldOpenModal]);

  return (
    <WorkOutWrapper>
      <WrapperTop> 
        <button onClick={() => handleModalOpen("add")}>운동 추가</button>
        <div>
          <input
            ref={searchRef}
            onKeyUp={e => {
              if (e.key === 'Enter') handleSearch();
            }}
            type="text"
            name="search"
          />
          <button onClick={handleSearch}>검색</button>
        </div>
      </WrapperTop>
      <>
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
                workoutData ? workoutData.map((item, idx) => (
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
                    <td colSpan="6">데이터가 없습니다.</td>
                  </tr>
              }
            </tbody>
          </table>
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
                modalType={modalType} // 여기서 함수 전달!
              />
            ) : modalData
          }
          setModalData={setModalData}
          setPostData={setPostData}
        />
      </>
    </WorkOutWrapper>
  );
};

export default WorkOut;