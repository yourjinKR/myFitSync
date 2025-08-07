import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import Modal from './Modal';
import { set } from 'date-fns';

const AwardsWrapper = styled.div`
  width: calc(100% - 40px);
  min-width: 1025px;
  height: calc(100vh - 120px);
  margin: 0 15px;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  .table-container {
    margin-top: 20px;
    background: var(--bg-secondary);
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--border-light);
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
    
    th:nth-child(1), td:nth-child(1) { flex: 0.8; }
    th:nth-child(2), td:nth-child(2) { flex: 1.5; }
    th:nth-child(3), td:nth-child(3) { flex: 3; }
    th:nth-child(4), td:nth-child(4) { flex: 1.2; }
    th:nth-child(5), td:nth-child(5) { flex: 1.5; }
    th:nth-child(6), td:nth-child(6) { flex: 2; min-width: 216px; }

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
    height: calc(100% - 105px);
    overflow-y: auto;
  }
`;

const ButtonBox = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  
  button {
    flex: 1;
    max-width: 120px;
    min-width: 90px;
    padding: 12px 20px;
    font-size: 1.4rem;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    text-align: center;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s;
    }
    
    &:hover::before {
      left: 100%;
    }
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }
    
    &:active {
      transform: translateY(-1px);
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
    }
  }
  
  button.success {
    background: linear-gradient(135deg, var(--check-green), #27ae60);
    color: var(--text-primary);
    
    &:hover {
      background: linear-gradient(135deg, #27ae60, #2ecc71);
      box-shadow: 0 6px 20px rgba(46, 204, 113, 0.3);
    }
  }
  
  button.warning {
    background: linear-gradient(135deg, var(--warning), #e74c3c);
    color: var(--text-primary);
    
    &:hover {
      background: linear-gradient(135deg, #e74c3c, #c0392b);
      box-shadow: 0 6px 20px rgba(231, 76, 60, 0.3);
    }
  }
  
  button.default {
    background: linear-gradient(135deg, #95a5a6, #7f8c8d);
    color: var(--text-primary);
    
    &:hover {
      background: linear-gradient(135deg, #7f8c8d, #95a5a6);
      box-shadow: 0 6px 20px rgba(149, 165, 166, 0.3);
    }
  }
  
  button:disabled {
    background: var(--border-light) !important;
    color: var(--text-secondary) !important;
    cursor: not-allowed !important;
    transform: none !important;
    box-shadow: none !important;
    
    &::before {
      display: none;
    }
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

const handleInputChange = (e, postData, setPostData) => {
  const selectedReason = e.target.closest("li").querySelector('label').textContent;
  const textareaElement = e.target.closest("ul").nextSibling;
  
  if (e.target.id !== 'reason6') {
    textareaElement.style.display = 'none';
    setPostData({ ...postData, awards_reason: selectedReason });
  } else {
    textareaElement.style.display = 'block';
    setPostData({ ...postData, awards_reason: '' });
  }
};

const ApprovalModalContainer = styled.div`
  .modal-header {
    text-align: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid var(--border-light);
    
    h3 {
      color: var(--text-black);
      font-size: 2.4rem;
      font-weight: 700;
      margin: 0;
      position: relative;
      
      &::before {
        content: '⚠️';
        margin-right: 8px;
        font-size: 2rem;
      }
    }
    
    p {
      color: var(--text-secondary);
      font-size: 1.4rem;
      margin: 8px 0 0 0;
    }
  }

  .reason-list {
    margin-bottom: 20px;
    
    li {
     
      
      input[type="radio"] {
        accent-color: var(--primary-blue);
        cursor: pointer;
        width: 18px;
        height: 18px;
      }
      
      label {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        border-radius: 8px;
        border: 2px solid transparent;
        transition: all 0.3s ease;
        cursor: pointer;

        color: var(--text-black);
        font-size: 2rem;
        cursor: pointer;
        line-height: 1.5;
        flex: 1;
        font-weight: 500;
        
        &:hover {
          color: var(--primary-blue);
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          border-color: var(--primary-blue);
          transform: translateX(4px);
        } 
      }
    }
  }

  .custom-reason {
    width: 100%;
    min-height: 100px;
    padding: 16px;
    font-size: 1.4rem;
    border: 2px solid var(--border-light);
    border-radius: 8px;
    background: var(--bg-white);
    color: var(--text-black);
    resize: vertical;
    margin-bottom: 24px;
    font-family: inherit;
    line-height: 1.5;
    transition: all 0.3s ease;
    
    &::placeholder {
      color: var(--text-tertiary);
    }
    
    &:focus {
      outline: none;
      border-color: var(--primary-blue);
      box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
      transform: translateY(-1px);
    }
  }
`;

const ApprovalModal = ({ postData, setPostData, onApprove, onClose }) => (
  <ApprovalModalContainer>
    <div className="modal-header">
      <h3>반려 사유 선택</h3>
    </div>
    
    <ul className="reason-list">
      <li>
        <label htmlFor="reason1">
          <input 
            type="radio" 
            onChange={(e) => handleInputChange(e, postData, setPostData)} 
            name="reason" 
            id="reason1" 
          />
        제출 서류 누락 또는 미비</label>
      </li>
      <li>
        <label htmlFor="reason2">
          <input 
            type="radio" 
            onChange={(e) => handleInputChange(e, postData, setPostData)} 
            name="reason" 
            id="reason2" 
          />
        서류 정보와 신청 정보 불일치</label>
      </li>
      <li>
        <label htmlFor="reason3">
          <input 
            type="radio" 
            onChange={(e) => handleInputChange(e, postData, setPostData)} 
            name="reason" 
            id="reason3" 
          />
        유효하지 않은 서류 제출</label>
      </li>
      <li>
        <label htmlFor="reason4">
          <input 
            type="radio" 
            onChange={(e) => handleInputChange(e, postData, setPostData)} 
            name="reason" 
            id="reason4" 
          />
        자격 요건 미충족</label>
      </li>
      <li>
        <label htmlFor="reason5">
          <input 
            type="radio" 
            onChange={(e) => handleInputChange(e, postData, setPostData)} 
            name="reason" 
            id="reason5" 
          />
        서류의 판독 불가 또는 해상도 저하</label>
      </li>
      <li>
        <label htmlFor="reason6">
          <input 
            type="radio" 
            onChange={(e) => handleInputChange(e, postData, setPostData)} 
            name="reason" 
            id="reason6" 
          />
        기타 (직접 입력)</label>
      </li>
    </ul>
    
    <textarea 
      className="custom-reason"
      style={{display: 'none'}}
      value={postData.awards_reason}
      onChange={(e) => setPostData({ ...postData, awards_reason: e.target.value })}
      placeholder="반려 사유를 상세히 입력해주세요."
    />
    
    <ButtonBox>
      <button className='warning' onClick={onApprove}>반려</button>
      <button className='default' onClick={onClose}>취소</button>
    </ButtonBox>
  </ApprovalModalContainer>
);



const Awards = () => {
  const init = {
    trainer_idx: '',
    awards_idx: '',
    awards_approval: '',
    awards_reason: ''
  }
  const [awardData, setAwardData] = useState([]);        // 화면에 보여줄 데이터
  const [awardDataOrigin, setAwardDataOrigin] = useState([]); // 전체 원본 데이터
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [postData, setPostData] = useState(init);
  const [modalType, setModalType] = useState(""); // 추가
  const searchRef = useRef(null);


  const getAwards = async () => {
    try {
      const response = await axios.get('/admin/awards', {withCredentials: true});
      const data = response.data;
      if(data.success) {
        setAwardData(data.vo);
        setAwardDataOrigin(data.vo); // 원본도 저장
      }
    } catch (error) {
      console.error('Error fetching awards:', error);
    }
  }

  const updateAward = async (post) => {
    try {
      const response = await axios.put('/admin/awards', post
        ,{withCredentials: true}
      );
      const data = response.data;
      if(data.success) {
        setPostData(init);
        setModalOpen(false);
        getAwards();
      }else{
        alert(data.msg);
      }
    } catch (error) {
      console.error('Error updating award:', error);
    }
  }

  const handleApproval = (item, approval) => {
    if(approval === 'N' && (!postData.awards_reason || postData.awards_reason.trim() === '')) {
      alert('반려 사유를 입력해주세요.');
      return;
    }
    updateAward(postData);
  }

  const handleModalOpen = (type, content) => {
    setModalType(type);
    if(type === "approval") {
      setPostData({
        trainer_idx: content.trainer_idx,
        awards_idx: content.awards_idx,
        awards_name: content.awards_name,
        awards_approval: 'F',
        awards_reason: ''
      });
    } else if(type === "img") {
      checkImage(content).then((exists) => {
        setModalData(
          exists
            ? <img src={content} alt="Award" />
            : <img src="https://res.cloudinary.com/dhupmoprk/image/upload/v1753341186/NoImage_d18r8v.jpg" alt="no-image" />
        );
      });
    } else if(type === "reasaon") {
       setModalData(
          <>
            <h3>반려 사유</h3>
            <p>{content}</p>
          </>
        );
    }
  }

  // 검색 기능
  const handleSearch = () => {
    const searchTerm = searchRef.current.value;
    const filteredData = awardDataOrigin.filter(item => {
      return (item.member.member_name && item.member.member_name.includes(searchTerm)) ||
        (item.awards_name && item.awards_name.includes(searchTerm))
    });
    setAwardData(filteredData);
    searchRef.current.blur(); // 검색 후 입력창 포커스 해제
  };


  useEffect(() => {
    getAwards();
  }, []);

  useEffect(() => {
  }, [awardData]);

  useEffect(() => {
    if( postData.awards_approval === 'Y' && modalData === null) {
      updateAward(postData);
      return;
    }
    
    if (postData.awards_idx === '' && modalData === null) {
      setModalOpen(false);
    }else{
      setModalOpen(true);
    }
  }, [modalData, postData]);

   useEffect(() => {
    if (!modalOpen) {
      if(modalData !== null) {
        setModalData(null);
        setPostData(init);
      }
    }
  }, [modalOpen]);

  return (
    <AwardsWrapper>
      <WrapperTop> 
        <div className="filter-section">
          <select name="" id=""
            onChange={(e) => {
              const value = e.target.value;
              if (value === "") {
                setAwardData(awardDataOrigin); // 전체
              } else {
                const filteredData = awardDataOrigin.filter(item => String(item.awards_approval) === String(value));
                setAwardData(filteredData);
              }
            }}
          >
            <option value="">전체</option>
            <option value="Y">승인완료</option>
            <option value="N">승인전</option>
            <option value="F">반려</option>
          </select>
          <select name="" id=""
            onChange={(e) => {
              const value = e.target.value;
              if (value === "") {
                getAwards(); // 전체 선택 시 모든 데이터를 다시 불러옴
              } else {
                const filteredData = awardData.filter(item => item.awards_category === value);
                setAwardData(filteredData);
              }
            }}
          >
            <option value="">카테고리</option>
            <option value="자격증">자격증</option>
            <option value="수상">수상</option>
            <option value="학위">학위</option>
          </select>
        </div>
        <div className="search-section">
          <input
            ref={searchRef}
            onKeyUp={e => {
              if (e.key === 'Enter') handleSearch();
            }}
            type="text"
            name="search"
            placeholder="검색어를 입력하세요"
          />
          <button onClick={handleSearch}>검색</button>
        </div>
      </WrapperTop>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>번호</th>
              <th>이름</th>
              <th>자격증</th>
              <th>카테고리</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
        </table>
        <div className="table-body">
          <table>
            <tbody>
              {
                awardData.length > 0 ? awardData.map((item) => (
                  <tr key={item.awards_idx}>
                    <td>{item.awards_idx}</td>
                    <td>{item.member.member_name}</td>
                    <td>
                      <button onClick={() => handleModalOpen("img", item.awards_certificate)}>
                        {item.awards_name}
                      </button>
                    </td>
                    <td>{item.awards_category}</td>
                    <td>
                      {item.awards_approval === 'Y' ? 
                        '승인완료' : 
                        item.awards_approval === 'N' ? 
                        '승인전' : 
                        <button onClick={() => handleModalOpen('reasaon', item.awards_reason)}>반려</button>}
                    </td>
                    <td>
                      { item.awards_approval === 'N' ? (
                        <ButtonBox>
                          <button 
                            className='success' 
                            onClick={() => setPostData({
                              ...postData, 
                              awards_idx: item.awards_idx, 
                              awards_approval: 'Y'
                            })}
                          >
                            승인
                          </button>
                          <button 
                            className='warning' 
                            onClick={() => handleModalOpen("approval", item)}
                          >
                            반려
                          </button>
                        </ButtonBox>
                      ) : null}
                    </td>
                  </tr>
                )) :
                <tr>
                  <td colSpan="6" style={{justifyContent: 'center'}}>
                    데이터가 없습니다.
                  </td>
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
          modalType === "approval" ? (
            <ApprovalModal
              postData={postData}
              setPostData={setPostData}
              onApprove={() => handleApproval(postData, 'N')}
              onClose={() => setModalOpen(false)}
            />
          ) : modalData
        }
        setModalData={setModalData}
      />
    </AwardsWrapper>
  );
};

export default Awards;