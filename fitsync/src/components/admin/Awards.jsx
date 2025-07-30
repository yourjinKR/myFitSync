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
    }

    th {
      color: var(--text-white);
    }
    
    tr {
      display: flex;
    }
    th:nth-child(1), td:nth-child(1) { flex: 1; }
    th:nth-child(2), td:nth-child(2) { flex: 2; }
    th:nth-child(3), td:nth-child(3) { flex: 7; }
    th:nth-child(4), td:nth-child(4) { flex: 2; }
    th:nth-child(5), td:nth-child(5) { flex: 2; }
    th:nth-child(6), td:nth-child(6) { flex: 3; }

    button {
      font-size: 1.6rem;
    }
  }
`;

const ButtonBox = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
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

  select {
    background: var(--bg-tertiary);
    font-size: 1.4rem;
    padding: 10px;
    margin-left: 10px;
    border-radius: 4px;
    border: 1px solid var(--border-light);
    cursor: pointer;

    option {
      background: var(--bg-secondary);
      color: var(--text-secondary);
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
  if(e.target.id !== 'reason6'){
    e.target.closest("ul").nextSibling.style.display='none';
    return setPostData({...postData, awards_reason: e.target.closest("li").innerText});
  }else{
    e.target.closest("ul").nextSibling.style.display='block';
    return setPostData({...postData, awards_reason: ''});
  }
};

const ApprovalModal = ({ postData, setPostData, onApprove, onClose }) => (
  <div>
    <h3>반려 사유 입력</h3>
    <ul>
      <li><input type="radio" onChange={(e) => handleInputChange(e, postData, setPostData)} name="reason" id="reason1" /><label htmlFor="reason1">제출 서류 누락 또는 미비</label></li>
      <li><input type="radio" onChange={(e) => handleInputChange(e, postData, setPostData)} name="reason" id="reason2" /><label htmlFor="reason2">서류 정보와 신청 정보 불일치</label></li>
      <li><input type="radio" onChange={(e) => handleInputChange(e, postData, setPostData)} name="reason" id="reason3" /><label htmlFor="reason3">유효하지 않은 서류 제출</label></li>
      <li><input type="radio" onChange={(e) => handleInputChange(e, postData, setPostData)} name="reason" id="reason4" /><label htmlFor="reason4">자격 요건 미충족</label></li>
      <li><input type="radio" onChange={(e) => handleInputChange(e, postData, setPostData)} name="reason" id="reason5" /><label htmlFor="reason5">서류의 판독 불가 또는 해상도 저하</label></li>
      <li><input type="radio" onChange={(e) => handleInputChange(e, postData, setPostData)} name="reason" id="reason6" /><label htmlFor="reason6">내부 심사 기준 미충족</label></li>
    </ul>
    <textarea style={{display: 'none'}}
      value={postData.awards_reason}
      onChange={(e) => setPostData({ ...postData, awards_reason: e.target.value })}
      placeholder="반려 사유를 입력해주세요."
    ></textarea>
    <ButtonBox>
      <button className='warning' onClick={onApprove}>반려</button>
      <button className='default' onClick={onClose}>취소</button>
    </ButtonBox>
  </div>
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
        <div>
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
                  {/* 관리 버튼들 추가 */}
                  { item.awards_approval === 'N' ? (
                    <ButtonBox>
                      <button className='success' onClick={() => setPostData({...postData, awards_idx:item.awards_idx, awards_approval: 'Y'})}>승인</button>
                      <button className='warning' onClick={() => handleModalOpen("approval", item)}>반려</button>
                    </ButtonBox>
                  ) : null}
                </td>
              </tr>
            )) :
            <tr>
              <td colSpan="5">데이터가 없습니다.</td>
            </tr>
          }
        </tbody>
      </table>
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