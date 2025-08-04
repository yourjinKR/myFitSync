import axios from 'axios';
import { set } from 'date-fns';
import React, { use, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import ReviewScore from '../review/ReviewScore';

const ReportWrapper = styled.div`
  width: calc(100% - 40px);
  min-width: 1025px;
  height: calc(100vh - 120px);
  margin: 0 15px;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  ul {
    display: flex;
    gap: 10px;
    
    li {
      button { 
        border: 1px solid var(--border-light);
        padding: 10px 25px;
        width: 100%;
        border-radius: 4px;
        font-size: 1.6rem;
        background: var(--bg-primary);
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.2s ease;
        
        &:hover {
          background: var(--bg-tertiary);
          border-color: var(--border-medium);
        }
      }
      
      button.active {
        background: var(--primary-blue);
        color: var(--text-primary);
        border-color: var(--primary-blue);
        
        &:hover {
          background: var(--primary-blue-hover);
        }
      }
    }
  }
`;

const TabContent = styled.div`
  margin-top: 20px;
  height: calc(100% - 70px);

  .empty {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.8rem;
    min-height: 200px;
    color: var(--text-secondary);
    border: 1px solid var(--border-light);
    border-radius: 4px;
    background: var(--bg-primary);
  }

  .report-table {
    width: 100%;
    border: 1px solid var(--border-light);
    border-radius: 8px;
    overflow: hidden;
    height: 100%;
    
    table {
      width: 100%;
      min-width: 750px;
      border-collapse: collapse;
      
      th, td {
        text-align: left;
        border-bottom: 1px solid var(--border-light);
        font-size: 1.6rem;
        padding: 12px 8px;
      }
      
      th {
        background: var(--primary-blue);
        color: var(--text-primary);
        text-align: center;
        position: sticky;
        top: 0;
        z-index: 10;
        font-weight: 600;
      }
      
      td {
        background: var(--bg-secondary);
        color: var(--text-primary);
        
        p {
          font-size: 1.4rem;
        }
        
        button {
          padding: 4px 8px;
          font-size: 1.4rem;
          color: var(--text-primary);
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          
          &:hover {
            background: var(--primary-blue-hover);
          }
        }
      }
    }
  }
  
  .tbody-scroll {
    overflow-y: auto;
    overflow-x: hidden;
    height: 100%;
    max-height: calc(100% - 50px);
    position: relative;
    
    table {
      width: 100%;
      min-width: 750px;
      position: relative;
      
      &.member-table {
        td:nth-child(1) { width: 75px; min-width: 75px; max-width: 75px; }
        td:nth-child(2) { width: 100px; min-width: 100px; max-width: 100px; }
        td:nth-child(3) { width: 100px; min-width: 100px; max-width: 100px; }
        td:nth-child(4) { width: calc(100% - 575px); min-width: 200px; }
        td:nth-child(5) { width: 100px; min-width: 100px; max-width: 100px; }
        td:nth-child(6) { width: 200px; min-width: 200px; max-width: 200px; }
      }
      
      &.message-table, &.review-table {
        td:nth-child(1) { width: 75px; min-width: 75px; max-width: 75px; }
        td:nth-child(2) { width: 100px; min-width: 100px; max-width: 100px; }
        td:nth-child(3) { width: 100px; min-width: 100px; max-width: 100px; }
        td:nth-child(4) { width: 200px; min-width: 200px; max-width: 200px; }
        td:nth-child(5) { width: calc(100% - 775px); min-width: 200px; }
        td:nth-child(6) { width: 100px; min-width: 100px; max-width: 100px; }
        td:nth-child(7) { width: 200px; min-width: 200px; max-width: 200px; }
      }
    }
    
    thead {
      th:nth-child(1) { width: 75px; min-width: 75px; max-width: 75px; }
      th:nth-child(2) { width: 100px; min-width: 100px; max-width: 100px; }
      th:nth-child(3) { width: 100px; min-width: 100px; max-width: 100px; }
    }
    
    table.member-table ~ thead {
      th:nth-child(4) { width: calc(100% - 575px); min-width: 200px; }
      th:nth-child(5) { width: 100px; min-width: 100px; max-width: 100px; }
      th:nth-child(6) { width: 200px; min-width: 200px; max-width: 200px; }
    }
    
    table.message-table ~ thead, table.review-table ~ thead {
      th:nth-child(4) { width: 200px; min-width: 200px; max-width: 200px; }
      th:nth-child(5) { width: calc(100% - 775px); min-width: 200px; }
      th:nth-child(6) { width: 100px; min-width: 100px; max-width: 100px; }
      th:nth-child(7) { width: 200px; min-width: 200px; max-width: 200px; }
    }
  }
`;

const DetailModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const UserInfo = styled.div`
  position: fixed;
  z-index: 1001;
  min-width: 250px;
  padding: 16px;
  background: var(--bg-white);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--border-light);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease;
  pointer-events: none;
  
  &.show {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }

  &::before {
    content: '';
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid var(--bg-white);
  }

  &::after {
    content: '';
    position: absolute;
    top: -9px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 9px solid transparent;
    border-right: 9px solid transparent;
    border-bottom: 9px solid var(--border-light);
    z-index: -1;
  }

  p {
    color: var(--text-black) !important;
    font-size: 1.4rem !important;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border-light);
    font-weight: 600;
  }

  dl {
    margin: 0;
    
    dt {
      color: var(--primary-blue) !important;
      font-size: 1.4rem !important;
      font-weight: 600;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      
      &::before {
        content: '📊';
        margin-right: 6px;
        font-size: 1.4rem;
      }
      
      &:first-child::before {
        content: '⛔';
      }
    }
    
    dd {
      color: var(--text-black) !important;
      font-size: 1.4rem !important;
      margin-left: 0;
      margin-bottom: 8px;
      padding: 6px 8px;
      background: #f8f9fa;
      border-radius: 4px;
      border-left: 3px solid var(--primary-blue);
      display: flex;
      align-items: center;

      strong {
        color: var(--primary-blue);
        font-weight: 600;
        font-size: 1.4rem !important;
      }
      
      &:last-child {
        margin-bottom: 0;
      }
      
      /* 각 항목별 이모지 추가 */
      &:nth-child(3)::before {
        content: '👤';
        margin-right: 6px;
        font-size: 1.2rem;
      }
      
      &:nth-child(4)::before {
        content: '💬';
        margin-right: 6px;
        font-size: 1.2rem;
      }
      
      &:nth-child(5)::before {
        content: '⭐';
        margin-right: 6px;
        font-size: 1.2rem;
      }
    }
  }
`;

const UserInfoTrigger = styled.td`
  position: relative;
  cursor: pointer;
  padding: 12px 8px;
  font-size: 1.6rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-light);
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--bg-tertiary) !important;
    color: var(--text-primary) !important;
    border-color: var(--border-medium);
  }
  
  &.clicked {
    background: var(--primary-blue) !important;
    color: var(--text-primary) !important;
    border-color: var(--primary-blue);
    box-shadow: inset 0 0 0 1px var(--primary-blue);
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  /* 텍스트가 잘 보이도록 강제 스타일 */
  * {
    color: inherit !important;
  }
  
  /* 텍스트 선택 방지 */
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
`;

const ButtonBox = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  
  button {
    flex: 1;
    max-width: 120px;
    padding: 8px 16px;
    font-size: 1.4rem;
    background: var(--bg-primary);
    color: var(--text-secondary);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    text-align: center;
    transition: all 0.2s ease;
    
    &:hover {
      background: var(--bg-tertiary);
    }
    
    &:disabled {
      background: var(--border-light) !important;
      color: var(--text-secondary) !important;
      cursor: not-allowed;
    }
  }
  
  button:first-child {
    background: var(--check-green) !important;
    color: white !important;
    
    &:hover {
      background: var(--success) !important;
    }
    
    &:disabled {
      background: var(--border-light) !important;
      color: var(--text-secondary) !important;
    }
  }
  
  button:last-child {
    background: #ff6b35 !important;
    color: white !important;
    
    &:hover {
      background: var(--start-red) !important;
    }
  }
`;

const ModalBox = styled.div`
  background: var(--bg-white);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  ${props => props.$width ? `width: ${props.$width}px;` : 'width: auto;'}

  h3 {
    color: var(--text-black);
    text-align: center;
    font-size: 2.4rem;
    font-weight: 600;
    margin-bottom: 20px;
  }
  
  & > div {
    display: flex;
    justify-content: center;
    gap: 10px;
    
    button {
      border-radius: 4px;
      border: 1px solid var(--border-light);
      padding: 8px 20px;
      font-size: 1.6rem;
      width: 120px;
      background: var(--bg-primary);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:hover {
        border-color: var(--warning);
        background: var(--warning);
        color: var(--text-primary);
      }
    }
  }
  
  p {
    color: var(--text-black);
    font-size: 1.6rem;
    font-weight: 600;
    margin: 10px 0;
  }

  label {
    font-size: 1.6rem;
    color: var(--text-black);
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
    
    p {
      margin: 0;
      font-weight: 600;
      white-space: nowrap;
    }
    
    input {
      padding: 8px 12px;
      font-size: 1.4rem;
      border: 1px solid var(--border-light);
      border-radius: 4px;
      color: var(--text-black);
      background: var(--bg-white);
      width: 100%;
      
      &::placeholder {
        color: var(--text-tertiary);
      }
      
      &:focus {
        outline: none;
        border-color: var(--primary-blue);
      }
    }
  }
`;

const ChatHistory = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px;
  padding: 30px;
  color: var(--text-black) !important;
  min-width: 600px;
  max-width: 700px;
  max-height: 80vh;
  overflow-y: auto;
  display: flex !important;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 1001;
  border: 1px solid rgba(59, 130, 246, 0.2);

  img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 15px 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  h3 {
    text-align: center;
    font-size: 2.4rem;
    font-weight: 700;
    color: var(--primary-blue) !important;
    margin-bottom: 25px;
    padding-bottom: 20px;
    border-bottom: 2px solid var(--primary-blue);
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--primary-blue), transparent);
    }
  }

  .chat-message {
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
    opacity: 1;
    transform: translateY(0);
    animation: slideIn 0.3s ease-out;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* 발신자 정보 */
  .sender-info {
    font-size: 1.4rem;
    font-weight: 600;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-black) !important;
    
    &::before {
      content: '👤';
      font-size: 1.2rem;
    }
  }

  /* 메시지 버블 */
  .message-bubble {
    position: relative;
    padding: 15px 20px;
    border-radius: 18px;
    font-size: 1.6rem;
    line-height: 1.5;
    word-wrap: break-word;
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 5px 16px rgba(0, 0, 0, 0.15);
    }

    span {
      font-size: 1.6rem;
      line-height: 1.5;
      color: inherit;
      display: block;
    }
    
    &.highlight {
      border: 2px solid #ffd700;
      background: linear-gradient(135deg, #fff9c4, #ffeaa7) !important;
      
      span {
        background: none;
        color: #b8860b !important;
        font-weight: 700;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }
    }
  }

  /* 피신고자 메시지 (왼쪽 정렬) */
  .reported-message {
    align-items: flex-start;

    .sender-info {
      color: #dc3545 !important;
      
      &::before {
        content: '🚨';
      }
    }

    .message-bubble {
      background: linear-gradient(135deg, #fff5f5, #fee2e2);
      color: #374151 !important;
      max-width: 75%;
      border-left: 4px solid #dc3545;
      border-top-left-radius: 6px;
      
      &::before {
        content: '';
        position: absolute;
        left: -8px;
        top: 15px;
        width: 0;
        height: 0;
        border-top: 8px solid transparent;
        border-right: 8px solid #fff5f5;
        border-bottom: 8px solid transparent;
      }
    }
  }

  /* 신고자 메시지 (오른쪽 정렬) */
  .reporter-message {
    align-items: flex-end;

    .sender-info {
      justify-content: flex-end;
      color: var(--primary-blue) !important;
      
      &::before {
        content: '📢';
      }
    }

    .message-bubble {
      background: linear-gradient(135deg, var(--primary-blue), #1e40af);
      color: white !important;
      max-width: 75%;
      border-top-right-radius: 6px;
      
      &::before {
        content: '';
        position: absolute;
        right: -8px;
        top: 15px;
        width: 0;
        height: 0;
        border-top: 8px solid transparent;
        border-left: 8px solid var(--primary-blue);
        border-bottom: 8px solid transparent;
      }
    }
  }

  /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, var(--primary-blue), #1e40af);
    border-radius: 4px;
    
    &:hover {
      background: linear-gradient(135deg, #1e40af, var(--primary-blue));
    }
  }

  /* 채팅 영역 구분선 */
  .chat-divider {
    display: flex;
    align-items: center;
    margin: 25px 0;
    position: relative;
    
    &::before,
    &::after {
      content: '';
      flex: 1;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--primary-blue), transparent);
    }
    
    span {
      padding: 0 20px;
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--primary-blue) !important;
      background: white;
      border-radius: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      position: relative;
      
      &::before {
        content: '💬';
        margin-right: 8px;
      }
    }
  }

  /* 빈 상태 메시지 스타일링 */
  & > div[style*="textAlign"] {
    background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
    border-radius: 12px;
    padding: 30px;
    text-align: center;
    color: #6b7280 !important;
    font-size: 1.6rem !important;
    font-weight: 500;
    border: 2px dashed #d1d5db;
    
    &::before {
      content: '📭';
      display: block;
      font-size: 3rem;
      margin-bottom: 10px;
    }
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

const Report = () => {
  const init = {
    url: '',
    type: '',
    contentType: ''
  };
  const targetInfo = {
    report_idx: '',
    reporter: '',
    reported: ''
  }

  const [activeTab, setActiveTab] = useState('member');
  const [empty, setEmpty] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(init);
  const [userTarget, setUserTarget] = useState(targetInfo);
  const [totalData, setTotalData] = useState(null);
  const searchRef = useRef(null);
  const [reportData, setReportData] = useState({
    member: null,
    message: null,
    review: null
  });
  const [activeTooltip, setActiveTooltip] = useState(null); // 활성화된 툴팁 상태
  // 탭 목록
  const tabs = [
    { id: 'member', label: '유저' },
    { id: 'message', label: '메시지' },
    { id: 'review', label: '리뷰' }
  ];

  // 리포트 데이터 가져오기
  const handleReport = async () => {
    try {
      const resp = await axios.get(`/admin/report`, { withCredentials: true });
      const data = resp.data;

      if (data.success) {
        setTotalData(data.vo);
        setReportData(prev => ({
          member: data.vo.filter((item) => item.report_category.toLowerCase() === 'member') || null,
          message: data.vo.filter((item) => item.report_category.toLowerCase() === 'message') || null,
          review: data.vo.filter((item) => item.report_category.toLowerCase() === 'review') || null
        }));
        setEmpty("");
      } else {
        setEmpty(data.msg);
      }
    } catch (error) {
      console.error('리포트 데이터 가져오기 실패:', error);
      setEmpty("데이터를 불러오는데 실패했습니다.");
    }
  };

  // 탭 변경 핸들러
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setEmpty("");
  };

  // 현재 탭의 데이터 렌더링
  const renderTabContent = () => {
    const currentData = reportData[activeTab];

    if (currentData === null) {
      return <div className='empty'>로딩 중...</div>;
    }

    if (empty) {
      return <div className='empty'>{empty}</div>;
    }

    if (!currentData || currentData.length === 0) {
      return <div className='empty'>데이터가 없습니다.</div>;
    }

    // 누적 신고 수 계산 함수를 밖으로 빼기
    const getReportCount = (targetMemberIdx, type) => {
      if (type === 'total') {
        return totalData.filter(item => item.reported?.member_idx === targetMemberIdx).length;
      } else if (type === 'message') {
        return reportData.message.filter(report => report.reported?.member_idx === targetMemberIdx).length;
      } else if (type === 'review') {
        return reportData.review.filter(report => report.reported?.member_idx === targetMemberIdx).length;
      } else if (type === 'member') {
        return reportData.member.filter(report => report.reported?.member_idx === targetMemberIdx).length;
      } else {
        return totalData.filter(item => item.report_sanction === targetMemberIdx).length;
      }
    };

    switch (activeTab) {
      case 'member':
        return (
          <>
            {
              reportData.member.length > 0 ? (
                <div className='report-table'>
                  <table>
                    <colgroup>
                      <col width="75px" />
                      <col width="100px" />
                      <col width="100px" />
                      <col width="calc(100% - 575px)" />
                      <col width="100px" />
                      <col width="200px" />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>번호</th>
                        <th>피신고자</th>
                        <th>타입</th>
                        <th className='ta-l'>내용</th>
                        <th>신고자</th>
                        <th></th>
                      </tr>
                    </thead>
                  </table>
                  <div className="tbody-scroll">
                    <table className="member-table">
                      <tbody>
                        {reportData.member.map((user, index) => (
                          <tr key={user.report_idx || index}>
                            <td className='ta-c'>{index + 1}</td>
                            <UserInfoTrigger
                              className={`ta-c ${activeTooltip === `member-reported-${index}` ? 'clicked' : ''}`}
                              onClick={(e) => handleTooltipClick(e, `member-reported-${index}`)}
                            >
                              {user.reported?.member_name || '(알수없음)'}
                              <UserInfo
                                data-tooltip
                                className={activeTooltip === `member-reported-${index}` ? 'show' : ''}
                              >
                                <p>📧 {user.reported?.member_email || '(알수없음)'}</p>
                                <dl>
                                  <dt>누적 차단 :&ensp;{getReportCount(user.reported?.member_idx, 'block')}</dt>
                                  <dt>누적 신고 :&ensp;{totalData.filter(item => item.reported?.member_idx === user.reported?.member_idx).length}</dt>
                                  <dd>유저 신고 :&ensp;<strong>{getReportCount(user.reported?.member_idx, 'member')}</strong></dd>
                                  <dd>채팅 신고 :&ensp;<strong>{getReportCount(user.reported?.member_idx, 'message')}</strong></dd>
                                  <dd>리뷰 신고 :&ensp;<strong>{getReportCount(user.reported?.member_idx, 'review')}</strong></dd>
                                </dl>
                              </UserInfo>
                            </UserInfoTrigger>
                            <td className='ta-c'>
                              {user.reported?.member_type === 'trainer' ? '트레이너' : '회원'}
                            </td>
                            <td><p className='txt-ov'>{user.report_content}</p></td>
                            <UserInfoTrigger
                              className={`ta-c ${activeTooltip === `member-reporter-${index}` ? 'clicked' : ''}`}
                              onClick={(e) => handleTooltipClick(e, `member-reporter-${index}`)}
                            >
                              {user.reporter?.member_name || '(알수없음)'}
                              <UserInfo
                                data-tooltip
                                className={activeTooltip === `member-reporter-${index}` ? 'show' : ''}
                              >
                                <p>📧 {user.reporter?.member_email || '(알수없음)'}</p>
                                <dl>
                                  <dt>누적 차단 :&ensp;{getReportCount(user.reporter?.member_idx, 'block')}</dt>
                                  <dt>누적 신고 :&ensp;{getReportCount(user.reporter?.member_idx, 'total')}</dt>
                                  <dd>유저 신고 :&ensp;<strong>{getReportCount(user.reporter?.member_idx, 'member')}</strong></dd>
                                  <dd>채팅 신고 :&ensp;<strong>{getReportCount(user.reporter?.member_idx, 'message')}</strong></dd>
                                  <dd>리뷰 신고 :&ensp;<strong>{getReportCount(user.reporter?.member_idx, 'review')}</strong></dd>
                                </dl>
                              </UserInfo>
                            </UserInfoTrigger>
                            <td className='ta-c'>
                              <ButtonBox>
                                {user.report_hidden === 0 ?
                                  <>
                                    <button onClick={() => handleUpdateReportChk(user.report_idx)}>읽음</button>
                                    <button onClick={
                                      () => handleReportCTA(
                                        user.report_idx, 
                                        user.reporter?.member_idx, 
                                        user.reported?.member_idx
                                      )}
                                    >제재</button>
                                  </> :
                                  <>
                                    <button disabled={true}>처리완료</button>
                                  </>
                                }
                              </ButtonBox>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className='empty'>데이터가 없습니다.</div>
              )
            }
          </>
        );
      case 'message':
        return (
          <>
            {
              reportData.message.length > 0 ? (
                <div className='report-table'>
                  <table>
                    <colgroup>
                      <col width="75px" />
                      <col width="100px" />
                      <col width="100px" />
                      <col width="200px" />
                      <col width="calc(100% - 775px)" />
                      <col width="100px" />
                      <col width="200px" />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>번호</th>
                        <th>피신고자</th>
                        <th>타입</th>
                        <th>채팅</th>
                        <th className='ta-l'>신고사유</th>
                        <th>신고자</th>
                        <th></th>
                      </tr>
                    </thead>
                  </table>
                  <div className="tbody-scroll">
                    <table className="message-table">
                      <tbody>
                        {reportData.message.map((user, index) => (
                          <tr key={user.report_idx || index}>
                            <td className='ta-c'>{index + 1}</td>
                            <UserInfoTrigger
                              className={`ta-c ${activeTooltip === `message-reported-${index}` ? 'clicked' : ''}`}
                              onClick={(e) => handleTooltipClick(e, `message-reported-${index}`)}
                            >
                              {user.reported?.member_name || '(알수없음)'}
                              <UserInfo
                                data-tooltip
                                className={activeTooltip === `message-reported-${index}` ? 'show' : ''}
                              >
                                <p>📧 {user.reported?.member_email || '(알수없음)'}</p>
                                <dl>
                                  <dt>누적 차단 :&ensp;{getReportCount(user.reported?.member_idx, 'block')}</dt>
                                  <dt>누적 신고 :&ensp;{totalData.filter(item => item.reported?.member_idx === user.reported?.member_idx).length}</dt>
                                  <dd>유저 신고 :&ensp;<strong>{getReportCount(user.reported?.member_idx, 'member')}</strong></dd>
                                  <dd>채팅 신고 :&ensp;<strong>{getReportCount(user.reported?.member_idx, 'message')}</strong></dd>
                                  <dd>리뷰 신고 :&ensp;<strong>{getReportCount(user.reported?.member_idx, 'review')}</strong></dd>
                                </dl>
                              </UserInfo>
                            </UserInfoTrigger>
                            <td className='ta-c'>
                              {user.reported?.member_type === 'trainer' ? '트레이너' : '회원'}
                            </td>
                            <td className='ta-c'>
                              {
                                user.message?.attach ? (
                                  <button onClick={() => handleDetailModal(user.message.attach.cloudinary_url, "message", "img")}>
                                    {user.message?.message_content}
                                  </button>
                                ) :
                                  <button onClick={() => handleDetailModal(user, "message", "chat")}>
                                    {user.message?.message_content}
                                  </button>
                              }
                            </td>
                            <td><p className='txt-ov'>{user.report_content}</p></td>
                            <UserInfoTrigger
                              className={`ta-c ${activeTooltip === `message-reporter-${index}` ? 'clicked' : ''}`}
                              onClick={(e) => handleTooltipClick(e, `message-reporter-${index}`)}
                            >
                              {user.reporter?.member_name || '(알수없음)'}
                              <UserInfo
                                data-tooltip
                                className={activeTooltip === `message-reporter-${index}` ? 'show' : ''}
                              >
                                <p>📧 {user.reporter?.member_email || '(알수없음)'}</p>
                                <dl>
                                  <dt>누적 차단 :&ensp;{getReportCount(user.reporter?.member_idx, 'block')}</dt>
                                  <dt>누적 신고 :&ensp;{getReportCount(user.reporter?.member_idx, 'total')}</dt>
                                  <dd>유저 신고 :&ensp;<strong>{getReportCount(user.reporter?.member_idx, 'member')}</strong></dd>
                                  <dd>채팅 신고 :&ensp;<strong>{getReportCount(user.reporter?.member_idx, 'message')}</strong></dd>
                                  <dd>리뷰 신고 :&ensp;<strong>{getReportCount(user.reporter?.member_idx, 'review')}</strong></dd>
                                </dl>
                              </UserInfo>
                            </UserInfoTrigger>
                            <td className='ta-c'>
                              <ButtonBox>
                                <button
                                  disabled={user.report_hidden === 1}
                                  onClick={user.report_hidden === 0 ? () => handleUpdateReportChk(user.report_idx) : undefined}
                                >
                                  {user.report_hidden === 0 ? '읽음' : '처리완료'}
                                </button>
                                {user.report_hidden === 0 ? (
                                  <button onClick={() => handleReportCTA(user.report_idx, user.reporter?.member_idx, user.reported?.member_idx)}>
                                    제재
                                  </button>
                                ) : null}
                              </ButtonBox>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className='empty'>데이터가 없습니다.</div>
              )
            }
          </>
        );
      case 'review':
        return (
          <>
            {
              reportData.review.length > 0 ? (
                <div className='report-table'>
                  <table>
                    <colgroup>
                      <col width="75px" />
                      <col width="100px" />
                      <col width="100px" />
                      <col width="200px" />
                      <col width="calc(100% - 775px)" />
                      <col width="100px" />
                      <col width="200px" />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>번호</th>
                        <th>피신고자</th>
                        <th>타입</th>
                        <th>리뷰</th>
                        <th className='ta-l'>신고사유</th>
                        <th>신고자</th>
                        <th></th>
                      </tr>
                    </thead>
                  </table>
                  <div className="tbody-scroll">
                    <table className="review-table">
                      <tbody>
                        {reportData.review.map((user, index) => (
                          <tr key={user.report_idx || index}>
                            <td className='ta-c'>{index + 1}</td>
                            <UserInfoTrigger
                              className={`ta-c ${activeTooltip === `review-reported-${index}` ? 'clicked' : ''}`}
                              onClick={(e) => handleTooltipClick(e, `review-reported-${index}`)}
                            >
                              {user.reported?.member_name || '(알수없음)'}
                              <UserInfo
                                data-tooltip
                                className={activeTooltip === `review-reported-${index}` ? 'show' : ''}
                              >
                                <p>📧 {user.reported?.member_email || '(알수없음)'}</p>
                                <dl>
                                  <dt>누적 차단 :&ensp;{getReportCount(user.reported?.member_idx, 'block')}</dt>
                                  <dt>누적 신고 :&ensp;{totalData.filter(item => item.reported?.member_idx === user.reported?.member_idx).length}</dt>
                                  <dd>유저 신고 :&ensp;<strong>{getReportCount(user.reported?.member_idx, 'member')}</strong></dd>
                                  <dd>채팅 신고 :&ensp;<strong>{getReportCount(user.reported?.member_idx, 'message')}</strong></dd>
                                  <dd>리뷰 신고 :&ensp;<strong>{getReportCount(user.reported?.member_idx, 'review')}</strong></dd>
                                </dl>
                              </UserInfo>
                            </UserInfoTrigger>
                            <td className='ta-c'>
                              {user.reported?.member_type === 'trainer' ? '트레이너' : '회원'}
                            </td>
                            <td className='ta-c'>
                              <button onClick={() => handleDetailModal(user, "isReview", "")}>
                                {user.review?.review_title}
                              </button>
                            </td>
                            <td><p className='txt-ov'>{user.report_content}</p></td>
                            <UserInfoTrigger
                              className={`ta-c ${activeTooltip === `review-reporter-${index}` ? 'clicked' : ''}`}
                              onClick={(e) => handleTooltipClick(e, `review-reporter-${index}`)}
                            >
                              {user.reporter?.member_name || '(알수없음)'}
                              <UserInfo
                                data-tooltip
                                className={activeTooltip === `review-reporter-${index}` ? 'show' : ''}
                              >
                                <p>📧 {user.reporter?.member_email || '(알수없음)'}</p>
                                <dl>
                                  <dt>누적 차단 :&ensp;{getReportCount(user.reporter?.member_idx, 'block')}</dt>
                                  <dt>누적 신고 :&ensp;{getReportCount(user.reporter?.member_idx, 'total')}</dt>
                                  <dd>유저 신고 :&ensp;<strong>{getReportCount(user.reporter?.member_idx, 'member')}</strong></dd>
                                  <dd>채팅 신고 :&ensp;<strong>{getReportCount(user.reporter?.member_idx, 'message')}</strong></dd>
                                  <dd>리뷰 신고 :&ensp;<strong>{getReportCount(user.reporter?.member_idx, 'review')}</strong></dd>
                                </dl>
                              </UserInfo>
                            </UserInfoTrigger>
                            <td className='ta-c'>
                              <ButtonBox>
                                <button
                                  disabled={user.report_hidden === 1}
                                  onClick={user.report_hidden === 0 ? () => handleUpdateReportChk(user.report_idx) : undefined}
                                >
                                  {user.report_hidden === 0 ? '읽음' : '처리완료'}
                                </button>
                                {user.report_hidden === 0 ? (
                                  <button onClick={
                                    () => handleReportCTA(
                                      user.report_idx, 
                                      user.reporter?.member_idx, 
                                      user.reported?.member_idx,
                                      user.review?.matching_idx
                                  )}>
                                    제재
                                  </button>
                                ) : null}
                              </ButtonBox>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className='empty'>데이터가 없습니다.</div>
              )
            }
          </>
        );
      default:
        return <div className='empty'>알 수 없는 탭입니다.</div>;
    }
  };

  const handleDetailModal = (getContent, getType, getContentType) => {
    console.log('handleDetailModal called with:', { getContent, getType, getContentType });
    setModalData({
      content: getContent,
      type: getType,
      contentType: getContentType
    });
    if (getType === 'message' && getContentType === 'chat') {
      setUserTarget({
        report_idx: getContent.report_idx,
        reporter: getContent.reporter || '',
        reported: getContent.reported || ''
      });
    }
    setModalOpen(true);
  };

  // 제재 컨트롤
  const handleReportCTA = (report_idx, reporter, reported, report_data_idx) => {
    setUserTarget({
      report_idx: report_idx,
      reporter: reporter,
      reported: reported,
      report_data_idx: report_data_idx || ''
    });
    handleDetailModal('', "isBlocked", "")
  }
  const handleUpdateReport = async (target, type) => {
    try {

      const response = await axios.put(`/admin/report/${userTarget.report_idx}/${target}`, 
        { 
          report_data_idx: type === 'reported' ? userTarget.report_data_idx : -1,
          block_set : modalData.block_set || 0,
      }, { withCredentials: true });
      if (response.data.success) {
        setModalOpen(false);
        handleReport(activeTab); // 리포트 데이터 새로고침
      } else {
        alert("제재 처리에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error('제재 처리 실패:', error);
    }
  };

  const handleUpdateReportChk = async (target) => {
    try {
      const response = await axios.put(`/admin/report/hidden/${target}`, {
      }, { withCredentials: true });
      if (response.data.success) {
        handleReport(activeTab); // 리포트 데이터 새로고침
      } else {
        alert("제재 처리에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error('제재 처리 실패:', error);
    }
  }

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    handleReport(activeTab);
    setModalData(init);
    setModalOpen(false);
  }, []); // 의존성 배열을 빈 배열로 변경

  useEffect(() => {
    if (modalData.type === '') return;

    if (modalData?.type) {
      setModalOpen(true);
    } else {
      setModalOpen(false);
      setModalData(init);
      setUserTarget(targetInfo);
    }
  }, [modalData]);

  useEffect(() => {
  }, [userTarget]);

  // 툴팁 클릭 핸들러
  const handleTooltipClick = (e, tooltipId) => {
    e.stopPropagation(); // 이벤트 버블링 방지

    const tooltip = e.currentTarget.querySelector('[data-tooltip]');
    if (tooltip) {
      const rect = e.currentTarget.getBoundingClientRect();

      let left = rect.left + rect.width / 2;
      let top = rect.bottom + 10;

      // 화면 오른쪽 경계 체크
      if (left + 125 > window.innerWidth) {
        left = window.innerWidth - 125 - 10;
      }

      // 화면 왼쪽 경계 체크
      if (left - 125 < 0) {
        left = 125 + 10;
      }

      // 화면 아래쪽 경계 체크
      if (top + 200 > window.innerHeight) {
        top = rect.top - 200 - 10;
      }

      // 위치 설정
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
      tooltip.style.transform = 'translateX(-50%)';

      // 툴팁 표시/숨김 토글
      if (activeTooltip === tooltipId) {
        setActiveTooltip(null);
      } else {
        setActiveTooltip(tooltipId);
      }
    }
  };

  const handleSearch = () => {
    const searchTerm = searchRef.current.value;
    reportData[activeTab] = reportData[activeTab].filter(item => {
      if (activeTab === 'member') {
        return item.reported?.member_name.includes(searchTerm) || item.reporter?.member_name.includes(searchTerm);
      } else if (activeTab === 'message') {
        return item.reported?.member_name.includes(searchTerm) || item.reporter?.member_name.includes(searchTerm) || item.message?.message_content.includes(searchTerm);
      } else if (activeTab === 'review') {
        return item.reported?.member_name.includes(searchTerm) || item.reporter?.member_name.includes(searchTerm) || item.review?.review_title.includes(searchTerm);
      }
      return false; // 기본적으로 검색어가 없으면 빈 배열 반환
    });
    setReportData(prev => ({
      ...prev,
      [activeTab]: reportData[activeTab]
    }));
    setEmpty(reportData[activeTab].length === 0 ? "검색 결과가 없습니다." : "");
  };


  // 문서 클릭시 툴팁 닫기
  useEffect(() => {
    const handleDocumentClick = () => {
      setActiveTooltip(null);
    };

    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  return (
    <ReportWrapper>
      
       <WrapperTop> 
        <ul>
          {tabs.map(tab => (
            <li key={tab.id}>
              <button
                className={activeTab === tab.id ? 'active' : ''}
                onClick={() => handleTabChange(tab.id)}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
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
      <TabContent>
        {renderTabContent()}
      </TabContent>
      {modalOpen && (
        <DetailModal onClick={() => setModalOpen(false)}>
          {console.log('Modal rendering with modalData:', modalData)}
          {console.log('Modal open state:', modalOpen)}
          {modalData.type === 'isBlocked' ? (
            <ModalBox onClick={(e) => e.stopPropagation()}>
              <h3>제재 대상 선택</h3>
              <label htmlFor="block-set">
                <p>제재 일 수 : </p>
                <input 
                  type="number" 
                  name="block-set" 
                  id="block-set"
                  min={0}
                  onChange={(e) => setModalData({ ...modalData, block_set: e.target.value })}

                />
              </label>
              <div>
                <button onClick={() => handleUpdateReport(userTarget.reported, "reported")}>피신고자</button>
                <button onClick={() => handleUpdateReport(userTarget.reporter)}>신고자</button>
              </div>
            </ModalBox>) :
            modalData.type === 'isReview' ? (
              <ModalBox $width={450} onClick={(e) => e.stopPropagation()}>
                <h3>리뷰 상세</h3>
                <div style={{ display: 'flex', marginBottom: '10px', justifyContent: 'space-between', alignItems: 'center' }}>
                  <ReviewScore score={modalData.content.review.review_star} />
                  <p>{modalData.content.reported.member_name}</p>
                </div>
                <p style={{ fontSize: '1.8rem', marginBottom: '10px' }}>{modalData.content.review.review_title}</p>
                <p style={{ fontSize: '1.4rem', fontWeight: 'normal' }}>{modalData.content.review.review_content}</p>
              </ModalBox>
            ) : modalData.contentType === 'img' ? (
              <ModalBox onClick={(e) => e.stopPropagation()}>
                <h3>신고된 이미지</h3>
                <img src={modalData.content} alt="Report Detail" style={{ maxWidth: '100%', height: 'auto' }} />
              </ModalBox>
            ) : (
              <ChatHistory onClick={(e) => e.stopPropagation()}>
                {console.log('ChatHistory rendering with contentType:', modalData.contentType)}
                {console.log('ChatHistory content:', modalData.content)}
                <div className="chat-divider">
                  <span>대화 내용</span>
                </div>
                {modalData.content?.history_message && modalData.content.history_message.length > 0 ? (
                  modalData.content.history_message.map((item, index) => (
                    <div 
                      key={item.message_idx || index} 
                      className={`chat-message ${
                        item.sender_idx === userTarget.reported?.member_idx 
                          ? 'reported-message' 
                          : 'reporter-message'
                      }`}
                    >
                      <div className="sender-info">
                        {item.sender_idx === userTarget.reported?.member_idx 
                          ? userTarget.reported?.member_name 
                          : userTarget.reporter?.member_name}
                      </div>
                      <div className={`message-bubble` + (item.message_idx === modalData.content.idx_num ? ' highlight' : '')}>
                        <span>{item.message_content}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', fontSize: '1.6rem' }}>
                    채팅 기록이 없습니다.
                  </div>
                )}
              </ChatHistory>
            )}
        </DetailModal>
      )}
    </ReportWrapper>
  );
};

export default Report;