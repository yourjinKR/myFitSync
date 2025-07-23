import axios from 'axios';
import { set } from 'date-fns';
import React, { use, useEffect, useState } from 'react';
import styled from 'styled-components';

const ReportWrapper = styled.div`
  width: calc(100% - 40px);
  height: calc(100vh - 100px);
  margin: 0 auto;
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
        
        &:hover {
          background: var(--bg-tertiary);
        }
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
  height: calc(100% - 60px);
  
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
  transition: opacity 0.2s ease, visibility 0.2s ease; /* 위치 transition 제거 */
  pointer-events: none;

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
  
  &:hover ${UserInfo} {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }
  
  /* 호버 효과 */
  &:hover {
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
    gap: 10px;
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
  const [blockTarget, setBlockTarget] = useState(targetInfo);
  const [totalData, setTotalData] = useState(null);
  const [reportData, setReportData] = useState({
    member: null,
    message: null,
    review: null
  });
  // 탭 목록
  const tabs = [
    { id: 'member', label: '유저' },
    { id: 'message', label: '메시지' },
    { id: 'review', label: '리뷰' }
  ];
  const hoverRef = useState(null);

  // 리포트 데이터 가져오기
  const handleReport = async () => {
    try {
      const resp = await axios.get(`/admin/report`, { withCredentials: true });
      const data = resp.data;

      if (data.success) {
        setTotalData(data.vo);
        setReportData(prev => ({
          member: data.vo.filter((item) => item.report_category === 'member') || null,
          message: data.vo.filter((item) => item.report_category === 'message') || null,
          review: data.vo.filter((item) => item.report_category === 'review') || null
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
                              className='ta-c'
                              onMouseEnter={handleMouseEnter}
                            >
                              {user.reported?.member_name || 'N/A'}
                              <UserInfo data-tooltip>
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
                              className='ta-c'
                              onMouseEnter={handleMouseEnter}
                            >
                              {user.reporter?.member_name || 'N/A'}
                              <UserInfo data-tooltip>
                                <p>📧 {user.reporter?.member_email || 'N/A'}</p>
                                <dl>
                                  <dt>누적 차단 :&ensp;{getReportCount(user.reporter?.member_idx, 'block')}</dt>
                                  <dt>누적 신고 :&ensp;{getReportCount(user.reporter?.member_idx)}</dt>
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
                              className='ta-c'
                              onMouseEnter={handleMouseEnter}
                            >
                              {user.reported?.member_name || 'N/A'}
                              <UserInfo data-tooltip>
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
                              <button onClick={() => handleDetailModal(user.message.attach.cloudinary_url, "message", "img")}>
                                {user.message.message_content}
                              </button>
                            </td>
                            <td><p className='txt-ov'>{user.report_content}</p></td>
                            <UserInfoTrigger 
                              className='ta-c'
                              onMouseEnter={handleMouseEnter}
                            >
                              {user.reporter?.member_name || 'N/A'}
                              <UserInfo data-tooltip>
                                <p>📧 {user.reporter?.member_email || 'N/A'}</p>
                                <dl>
                                  <dt>누적 차단 :&ensp;{getReportCount(user.reporter?.member_idx, 'block')}</dt>
                                  <dt>누적 신고 :&ensp;{getReportCount(user.reporter?.member_idx)}</dt>
                                  <dd>유저 신고 :&ensp;<strong>{getReportCount(user.reporter?.member_idx, 'member')}</strong></dd>
                                  <dd>채팅 신고 :&ensp;<strong>{getReportCount(user.reporter?.member_idx, 'message')}</strong></dd>
                                  <dd>리뷰 신고 :&ensp;<strong>{getReportCount(user.reporter?.member_idx, 'review')}</strong></dd>
                                </dl>
                              </UserInfo>
                            </UserInfoTrigger>
                            <td className='ta-c'>
                              <ButtonBox>
                                <button disabled={user.report_hidden === 1} onClick={user.report_hidden === 0 ? () => handleUpdateReportChk(user.report_idx) : ''}>{user.report_hidden === 0 ? '처리전' : '처리완료'}</button>
                                {user.report_hidden === 0 ? <button onClick={() => handleReportCTA(user.report_idx, user.reporter?.member_idx, user.reported?.member_idx)}>제재</button> : <></>}
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
                              className='ta-c'
                              onMouseEnter={handleMouseEnter}
                            >
                              {user.reported?.member_name || 'N/A'}
                              <UserInfo data-tooltip>
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

                            </td>
                            <td><p className='txt-ov'>{user.report_content}</p></td>
                            <UserInfoTrigger 
                              className='ta-c'
                              onMouseEnter={handleMouseEnter}
                            >
                              {user.reporter?.member_name || 'N/A'}
                              <UserInfo data-tooltip>
                                <p>📧 {user.reporter?.member_email || 'N/A'}</p>
                                <dl>
                                  <dt>누적 차단 :&ensp;{getReportCount(user.reporter?.member_idx, 'block')}</dt>
                                  <dt>누적 신고 :&ensp;{getReportCount(user.reporter?.member_idx)}</dt>
                                  <dd>유저 신고 :&ensp;<strong>{getReportCount(user.reporter?.member_idx, 'member')}</strong></dd>
                                  <dd>채팅 신고 :&ensp;<strong>{getReportCount(user.reporter?.member_idx, 'message')}</strong></dd>
                                  <dd>리뷰 신고 :&ensp;<strong>{getReportCount(user.reporter?.member_idx, 'review')}</strong></dd>
                                </dl>
                              </UserInfo>
                            </UserInfoTrigger>
                            <td className='ta-c'>
                              <ButtonBox>
                                <button disabled={user.report_hidden === 1} onClick={user.report_hidden === 0 ? () => handleUpdateReportChk(user.report_idx) : ''}>{user.report_hidden === 0 ? '처리전' : '처리완료'}</button>
                                {user.report_hidden === 0 ? <button onClick={() => handleReportCTA(user.report_idx, user.reporter?.member_idx, user.reported?.member_idx)}>제재</button> : <></>}
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

  const handleDetailModal = (getUrl, getType, getContentType) => {
    setModalData({
      url: getUrl,
      type: getType,
      contentType: getContentType
    });
  };

  // 제재 컨트롤
  const handleReportCTA = (report_idx, reporter, reported) => {
    setBlockTarget({
      report_idx: report_idx,
      reporter: reporter,
      reported: reported
    });
    handleDetailModal('', "isBlocked", "")
  }
  const handleUpdateReport = async (target) => {
    try {
      const response = await axios.put(`/admin/report/${blockTarget.report_idx}/${target}`, {
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
      const response = await axios.put(`/admin/report/${target}`, {
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
      setBlockTarget(targetInfo);
    }
  }, [modalData]);

  useEffect(() => {
  }, [blockTarget]);

  // 툴팁 위치 계산 함수
  const handleMouseEnter = (e) => {
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
      
      // 즉시 위치 설정 (애니메이션 없이)
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
      tooltip.style.transform = 'translateX(-50%)';
    }
  };

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
          {
            modalData.type === 'isBlocked' ? (
              <ModalBox>
                <h3>제재 대상 선택</h3>
                <div>
                  <button onClick={() => handleUpdateReport(blockTarget.reported)}>피신고자</button>
                  <button onClick={() => handleUpdateReport(blockTarget.reporter)}>신고자</button>
                </div>
              </ModalBox>) : <>
              <div onClick={(e) => e.stopPropagation()}>
                {modalData.contentType === 'img' ? (
                  <img src={modalData.url} alt="Report Detail" />
                ) : (
                  <p>지원하지 않는 파일 형식입니다.</p>
                )}
              </div>
            </>
          }
        </DetailModal>
      )}
    </ReportWrapper>
  );
};

export default Report;