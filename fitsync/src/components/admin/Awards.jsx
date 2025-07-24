import axios from 'axios';
import React, { useEffect, useState } from 'react';
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

const checkImage = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

const ApprovalModal = ({ postData, setPostData, onApprove, onClose }) => (
  <div>
    <h3>반려 사유 입력</h3>
    <textarea
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
    awards_idx: '',
    awards_approval: '',
    awards_reason: ''
  }
  const [awardData, setAwardData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState("");
  const [postData, setPostData] = useState(init);
  const [modalType, setModalType] = useState(""); // 추가


  const getAwards = async () => {
    try {
      const response = await axios.get('/admin/awards');
      const data = response.data;
      if(data.success) {
        setAwardData(data.vo);
      }else{

      }
    } catch (error) {
      console.error('Error fetching awards:', error);
    }
  }

  const updateAward = async (post) => {
    try {
      const response = await axios.put('/admin/awards/update', post
        ,{withCredentials: true}
      );
      const data = response.data;
      if(data.success) {
        alert(data.msg);
        setPostData(init);
        setModalOpen(false);
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
    setModalOpen(true);
    setModalType(type);
    if(type === "approval") {
      setPostData({
        awards_idx: content.awards_idx,
        awards_approval: 'N',
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
    }
  }


  useEffect(() => {
    getAwards();
  }, []);

  useEffect(() => {
    console.log("🚀  :  Awards  :  awardData:", awardData)
  }, [awardData]);
  useEffect(() => {
    console.log("🚀  :  postData:", postData)
  }, [postData]);

  return (
    <AwardsWrapper>
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
            awardData ? awardData.map((item) => (
              <tr key={item.awards_idx}>
                <td>{item.awards_idx}</td>
                <td>{item.member.member_name}</td>
                <td>
                  <button onClick={() => handleModalOpen("img", item.awards_certificate)}>
                    {item.awards_name}
                  </button>
                </td>
                <td>{item.awards_category}</td>
                <td>{item.awards_approval === 'Y' ? '승인완료' : item.awards_approval === 'N' ? '승인전' : '반려'}</td>
                <td>
                  {/* 관리 버튼들 추가 */}
                  <ButtonBox>
                    <button className='success'>승인</button>
                    <button className='warning' onClick={() => handleModalOpen("approval", item)}>반려</button>
                  </ButtonBox>
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