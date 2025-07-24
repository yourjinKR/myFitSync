import axios from 'axios';
import { set } from 'date-fns';
import React, { use, useEffect, useState } from 'react';
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
        border: 1px solid var(--border-medium);
        padding: 10px 25px;
        width: 100%;
        border-radius: 5px;
        font-size: 1.6rem;
        background: var(--bg-primary);
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.2s;
    
      }
      button.active {
        background: var(--primary-blue);
        color: var(--text-white);
        border-color: var(--primary-blue);
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
    font-size: 2.6rem;
    min-height: 200px;
    color: var(--text-secondary);
    border: 2px solid var(--border-medium);
    border-radius: 5px;
  }

  .report-table {
    width: 100%;
    border: 1px solid var(--border-light);
    border-radius: 8px;
    overflow: hidden;
    height:100%;
    
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
        background: var(--bg-secondary);
        color: var(--text-primary);
        text-align: center;
        position: sticky;
        top: 0;
        z-index: 10;
      }
      
      td {
        p {
          font-size: 1.4rem;
        }
      }
    }
  }
  
  /* tbody 스크롤 wrapper */
  .tbody-scroll {
    overflow-y: auto;
    overflow-x: hidden;
    height:100%;
    max-height : calc(100% - 50px); /* 헤더 높이 제외 */
    position: relative; /* 추가 */
    
    table {
      width: 100%;
      min-width: 750px;
      position: relative; /* 추가 */
      td > button {
        font-size: 1.6rem;
      }
      /* colgroup 너비를 CSS로 직접 지정 */
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
    
    /* 헤더도 동일한 너비 적용 */
    thead {
      th:nth-child(1) { width: 75px; min-width: 75px; max-width: 75px; }
      th:nth-child(2) { width: 100px; min-width: 100px; max-width: 100px; }
      th:nth-child(3) { width: 100px; min-width: 100px; max-width: 100px; }
    }
    
    /* member 테이블 헤더 */
    table.member-table ~ thead {
      th:nth-child(4) { width: calc(100% - 575px); min-width: 200px; }
      th:nth-child(5) { width: 100px; min-width: 100px; max-width: 100px; }
      th:nth-child(6) { width: 200px; min-width: 200px; max-width: 200px; }
    }
    
    /* message/review 테이블 헤더 */
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
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-medium);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease;
  pointer-events: none;
  
  &.show {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }

  /* 화살표 추가 */
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

  /* 화살표 테두리 */
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
    border-bottom: 9px solid var(--border-medium);
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
      font-size: 1.5rem !important;
      font-weight: 700;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      
      &::before {
        content: '📊';
        margin-right: 6px;
        font-size: 1.4rem;
      }
   
    }
    dt:first-child::before {
      content: '⛔';
    }
   
    
    dd {
      color: var(--text-black) !important;
      font-size: 1.5rem !important;
      margin-left: 0;
      margin-bottom: 6px;
      padding: 4px 8px;
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      border-radius: 6px;
      border-left: 3px solid var(--primary-blue);
      display: flex;
      justify-content: flex-start;
      align-items: center;

      strong {
        color: var(--primary-blue);
        font-weight: 700;
        font-size: 1.4rem;
      }
      
      &:last-child {
        margin-bottom: 0;
      }
      
      /* 아이콘 추가 */
      &:nth-child(3)::before {
        content: '👤';
        margin-right: 6px;
      }
      
      &:nth-child(4)::before {
        content: '💬';
        margin-right: 6px;
      }
      
      &:nth-child(5)::before {
        content: '⭐';
        margin-right: 6px;
      }
    }
  }
`;

const UserInfoTrigger = styled.td`
  position: relative;
  cursor: pointer;
  
  /* hover 스타일 제거하고 클릭 스타일만 유지 */
  &:hover {
    background: var(--bg-tertiary);
  }
  
  &.clicked {
    background: var(--bg-tertiary);
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
  button:first-child {
    background: var(--check-green);
    color: var(--text-white);
  }
  button:last-child {
    background: var(--warning);
    color: var(--text-white);
  }
  button:disabled {
    background: var(--border-light);
    color: var(--text-secondary);
    cursor: not-allowed;
  }
`;

const ModalBox = styled.div`
  background: var(--bg-white);
  padding: 20px;
  border-radius: 8px;
  ${props => props.$width ? `width: ${props.$width}px;` : 'width: auto;'}
  

  h3, button {
    color : var(--text-black);
    text-align:center;
  }
  h3{
    font-size: 2.4rem;
    font-weight: bold;
    margin-bottom: 15px;
  }
  & > div {
    display: flex;
    justify-content: space-between;
    gap: 5px;
    button {
      border-radius: 5px;
      border: 1px solid var(--border-medium);
      padding: 5px 20px;
      font-size: 1.8rem;
      width: 120px;
    }
    button:hover
    {
      border-color: var(--warning);
      background: var(--warning);
      color: var(--text-white);
    }
  }
  p {
    color: var(--text-black);
    font-size: 1.6rem;
    font-weight: bold;
  }

`;

const ChatHistory = styled.div`
  background: var(--bg-white);
  border-radius: 12px;
  padding: 20px;
  color: var(--text-black);
  min-width: 500px;
  max-width: 600px;
  max-height: 70vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

  h3 {
    text-align: center;
    font-size: 2rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 2px solid var(--border-light);
  }

  /* 채팅 메시지 컨테이너 */
  .chat-message {
    display: flex;
    flex-direction: column;
    animation: fadeInUp 0.3s ease-out;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* 발신자 정보 */
  .sender-info {
    font-size: 1.6rem;
    font-weight: 600;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* 메시지 버블 */
  .message-bubble {
    position: relative;
    padding: 5px 10px;
    border-radius: 5px;
    font-size: 1.6rem;
    line-height: 1.4;
    word-wrap: break-word;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    span {
      font-size: 1.6rem;
      line-height: 1.4;
      padding: 0 10px;
    }
    
    /* 말풍선 꼬리 */
    &::before {
      content: '';
      position: absolute;
      width: 0;
      height: 0;
      border-style: solid;
    }
    
    &.highlight span {
      background: gold;
      color: var(--text-black);
      font-weight: bold;
    }
  }

  /* 피신고자 메시지 (왼쪽 정렬) */
  .reported-message {
    align-items: flex-start;

    .sender-info {
      color: var(--primary-blue);
    }

    .message-bubble {
      background: var(--bg-tertiary);
      color: var(--text-white);
      
      &::before {
        border-width: 0 12px 12px 0;
        border-color: var(--border-light) var(--border-light) #f8f9fa var(--border-light);
        left: -11px;
        bottom: 8px;
      }
      
      &::after {
        content: '';
        position: absolute;
        border-width: 0 13px 13px 0;
        border-color: transparent var(--border-light) transparent transparent;
        border-style: solid;
        left: -12px;
        bottom: 7px;
        z-index: -1;
      }
    }
  }

  /* 신고자 메시지 (오른쪽 정렬) */
  .reporter-message {
    align-items: flex-end;

    .sender-info {
      justify-content: flex-end;
      color: var(--primary-blue);
    }

    .message-bubble {
      background: linear-gradient(135deg, var(--primary-blue), #1e88e5);
      color: var(--text-white);
      
      &::before {
        border-width: 12px 12px 0 0;
        border-color: var(--primary-blue) transparent transparent transparent;
        right: -11px;
        bottom: 8px;
      }
    }
  }

  /* 타임스탬프 스타일 */
  .timestamp {
    font-size: 1.1rem;
    color: var(--text-secondary);
    margin-top: 4px;
    opacity: 0.7;
  }

  /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-medium);
    border-radius: 3px;
    
    &:hover {
      background: var(--text-secondary);
    }
  }

  /* 채팅 영역 구분선 */
  .chat-divider {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    
    &::before,
    &::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--border-light);
    }
    
    span {
      padding: 0 15px;
      font-size: 2.2rem;
      font-weight: bold;
      color: var(--text-black);
      background: var(--bg-white);
    }
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
        return reportData.message.filter(report => report.reported.member_idx === targetMemberIdx).length;
      } else if (type === 'review') {
        return reportData.review.filter(report => report.reported.member_idx === targetMemberIdx).length;
      } else if (type === 'member') {
        return reportData.member.filter(report => report.reported.member_idx === targetMemberIdx).length;
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
                              {user.reported?.member_name || 'N/A'}
                              <UserInfo
                                data-tooltip
                                className={activeTooltip === `member-reported-${index}` ? 'show' : ''}
                              >
                                <p>📧 {user.reported?.member_email || 'N/A'}</p>
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
                              {user.reporter?.member_name || 'N/A'}
                              <UserInfo
                                data-tooltip
                                className={activeTooltip === `member-reporter-${index}` ? 'show' : ''}
                              >
                                <p>📧 {user.reporter?.member_email || 'N/A'}</p>
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
                                    <button onClick={() => handleUpdateReportChk(user.report_idx)}>처리전</button>
                                    <button onClick={() => handleReportCTA(user.report_idx, user.reporter?.member_idx, user.reported?.member_idx)}>제재</button>
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
                              {user.reported?.member_name || 'N/A'}
                              <UserInfo
                                data-tooltip
                                className={activeTooltip === `message-reported-${index}` ? 'show' : ''}
                              >
                                <p>📧 {user.reported?.member_email || 'N/A'}</p>
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
                                    {user.message.message_content}
                                  </button>
                                ) :
                                  <button onClick={() => handleDetailModal(user, "message", "chat")}>
                                    {user.message.message_content}
                                  </button>
                              }
                            </td>
                            <td><p className='txt-ov'>{user.report_content}</p></td>
                            <UserInfoTrigger
                              className={`ta-c ${activeTooltip === `message-reporter-${index}` ? 'clicked' : ''}`}
                              onClick={(e) => handleTooltipClick(e, `message-reporter-${index}`)}
                            >
                              {user.reporter?.member_name || 'N/A'}
                              <UserInfo
                                data-tooltip
                                className={activeTooltip === `message-reporter-${index}` ? 'show' : ''}
                              >
                                <p>📧 {user.reporter?.member_email || 'N/A'}</p>
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
                                  {user.report_hidden === 0 ? '처리전' : '처리완료'}
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
                              {user.reported?.member_name || 'N/A'}
                              <UserInfo
                                data-tooltip
                                className={activeTooltip === `review-reported-${index}` ? 'show' : ''}
                              >
                                <p>📧 {user.reported?.member_email || 'N/A'}</p>
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
                                {user.review.review_title}
                              </button>
                            </td>
                            <td><p className='txt-ov'>{user.report_content}</p></td>
                            <UserInfoTrigger
                              className={`ta-c ${activeTooltip === `review-reporter-${index}` ? 'clicked' : ''}`}
                              onClick={(e) => handleTooltipClick(e, `review-reporter-${index}`)}
                            >
                              {user.reporter?.member_name || 'N/A'}
                              <UserInfo
                                data-tooltip
                                className={activeTooltip === `review-reporter-${index}` ? 'show' : ''}
                              >
                                <p>📧 {user.reporter?.member_email || 'N/A'}</p>
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
                                  {user.report_hidden === 0 ? '처리전' : '처리완료'}
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
      default:
        return <div className='empty'>알 수 없는 탭입니다.</div>;
    }
  };

  const handleDetailModal = (getContent, getType, getContentType) => {
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
  };

  // 제재 컨트롤
  const handleReportCTA = (report_idx, reporter, reported) => {
    setUserTarget({
      report_idx: report_idx,
      reporter: reporter,
      reported: reported
    });
    handleDetailModal('', "isBlocked", "")
  }
  const handleUpdateReport = async (target) => {
    try {
      const response = await axios.put(`/admin/report/${userTarget.report_idx}/${target}`, {
      }, { withCredentials: true });
      if (response.data.success) {
        alert("제재가 완료되었습니다.");
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
      <TabContent>
        {renderTabContent()}
      </TabContent>
      {modalOpen && (
        <DetailModal onClick={() => setModalOpen(false)}>
          {modalData.type === 'isBlocked' ? (
            <ModalBox>
              <h3>제재 대상 선택</h3>
              <div>
                <button onClick={() => handleUpdateReport(userTarget.reported)}>피신고자</button>
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
            ) : (
              <ChatHistory onClick={(e) => e.stopPropagation()}>
                {modalData.contentType === 'img' ? (
                  <img src={modalData.content} alt="Report Detail" />
                ) : (
                  <>
                    <div className="chat-divider">
                      <span>대화 내용</span>
                    </div>
                    {modalData.content.history_message.map((item, index) => (
                      <div 
                        key={item.message_idx || index} 
                        className={`chat-message ${
                          item.sender_idx === userTarget.reported.member_idx 
                            ? 'reported-message' 
                            : 'reporter-message'
                        }`}
                      >
                        <div className="sender-info">
                          {item.sender_idx === userTarget.reported.member_idx 
                            ? userTarget.reported.member_name 
                            : userTarget.reporter.member_name}
                        </div>
                        <div className={`message-bubble` + (item.message_idx === modalData.content.idx_num ? ' highlight' : '')}>
                          <span>{item.message_content}</span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </ChatHistory>
            )}
        </DetailModal>
      )}
    </ReportWrapper>
  );
};

export default Report;