import axios from 'axios';
import React, { use, useEffect, useState } from 'react';
import styled from 'styled-components';

const ReportWrapper = styled.div`
  width: calc(100% - 40px);
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
    height: calc(100vh - 220px);
    overflow-x: auto;
    table {
      width: 100%;
      min-width: 750px;
      border-collapse: collapse;
      th, td, button {
        text-align: left;
        border-bottom: 1px solid var(--border-light);
        font-size: 1.6rem;
      }
      th {
        padding: 12px 0;
        background: var(--bg-secondary);
        color: var(--text-primary);
        text-align:center;
      }
      td {
        padding: 12px 0;
        p {
          font-size: 1.4rem;
        }
      }
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
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  min-width: 250px;
  padding: 16px;
  background: var(--bg-white);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-medium);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  pointer-events: none;

  /* 화살표 */
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

  /* 호버 시 표시 */
  ${props => props.theme && `
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  `}

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
      &:nth-child(2)::before {
        content: '👤';
        margin-right: 6px;
      }
      
      &:nth-child(3)::before {
        content: '💬';
        margin-right: 6px;
      }
      
      &:nth-child(4)::before {
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

const Report = () => {
  const init = {
    url: '',
    type: '',
    contentType: ''
  }
  const [activeTab, setActiveTab] = useState('member');
  const [empty, setEmpty] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(init);

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

  // 리포트 데이터 가져오기
  const handleReport = async (type = 'member') => {
    try {
      const resp = await axios.get(`/admin/report?type=${type}`, { withCredentials: true });
      const data = resp.data;

      if (data.success) {
        setReportData(prev => ({
          ...prev,
          [type]: data.vo
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

    if (!reportData[tabId]) {
      handleReport(tabId);
    }
  };

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    handleReport(activeTab);
    setModalData({
      url: '',
      type: '',
      contentType: ''
    });
    setModalOpen(false);
  }, []); // 의존성 배열을 빈 배열로 변경

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
      return currentData.filter(report => {
        if (type === 'member') {
          return report.reported.member_idx === targetMemberIdx && report.report_category === 'member';
        } else if (type === 'message') {
          return report.reported.member_idx === targetMemberIdx && report.report_category === 'message';
        } else if (type === 'review') {
          return report.reported.member_idx === targetMemberIdx && report.report_category === 'review';
        } else{
          return report.reported.member_idx === targetMemberIdx;
        }
      }
        
      ).length;
    };

    switch (activeTab) {
      case 'member':
        return (
          <div>
            <h3>유저 리포트</h3>
            <div className='report-table'>
              <table>
                <colgroup>
                  <col width="75px" />
                  <col width="100px" />
                  <col width="100px" />
                  <col width="calc(100% - 450px)" />
                  <col width="100px" />
                  <col width="75px" />
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
                <tbody>
                  {currentData
                    .filter((user) => user.report_category === 'member')
                    .map((user, index) => (
                      <tr key={user.report_idx || index}>
                        <td className='ta-c'>{index + 1}</td>
                        <UserInfoTrigger className='ta-c'>
                          {user.reported?.member_name || 'N/A'}
                          <UserInfo>
                            <p>📧 {user.reported?.member_email || 'N/A'}</p>
                            <dl>
                              <dt>누적 신고 :&ensp;{getReportCount(user.reported?.member_idx)}</dt>
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
                        <td className='ta-c'>{user.reporter?.member_name || 'N/A'}</td>
                        <td className='ta-c'><button>삭제</button></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'message':
        return (
          <div>
            <h3>메시지 리포트</h3>
            {currentData.length > 0 ? (
              <div className='report-table'>
                <table>
                  <colgroup>
                    <col width="75px" />
                    <col width="100px" />
                    <col width="100px" />
                    <col width="200px" />
                    <col width="calc(100% - 650px)" />
                    <col width="100px" />
                    <col width="75px" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>번호</th>
                      <th>피신고자</th>
                      <th>타입</th>
                      <th>채팅</th>
                      <th className='ta-l'>내용</th>
                      <th>신고자</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.filter((user) => (user.report_category === 'message' || user.report_type === 'all')).map((user, index) => (
                      <tr key={index}>
                        <td className='ta-c'>{index + 1}</td>
                        <td className='ta-c pos-r'>
                          {user.reported.member_name}
                          <UserInfo>
                            <p>📧 {user.reported?.member_email || 'N/A'}</p>
                            <dl>
                              <dt>누적 신고 :&ensp;{getReportCount(user.reported?.member_idx)}</dt>
                              <dd>유저 신고 :&ensp;<strong>{getReportCount(user.reported?.member_idx, 'member')}</strong></dd>
                              <dd>채팅 신고 :&ensp;<strong>{getReportCount(user.reported?.member_idx, 'message')}</strong></dd>
                              <dd>리뷰 신고 :&ensp;<strong>{getReportCount(user.reported?.member_idx, 'review')}</strong></dd>
                            </dl>
                          </UserInfo>
                        </td>
                        <td className='ta-c'>{user.member_type === 'trainer' ? '트레이너' : '회원'}</td>
                        <td className='ta-c'>
                          <button onClick={() => handleDetailModal(user.message.attach.cloudinary_url, "message", "img")}>
                         
                            {user.message.message_content}
                          </button>
                        </td>
                        <td><p className='txt-ov'>{user.report_content}</p></td>
                        <td className='ta-c'>{user.reporter.member_name}</td>
                        <td className='ta-c'><button>삭제</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className='empty'>메시지 데이터가 없습니다.</div>
            )}
          </div>
        );
      case 'review':
        return (
          <div>
            <h3>리뷰 리포트</h3>
            {currentData.length > 0 ? (
              <ul>
                {currentData.map((review, index) => (
                  <li key={index}>{review.title} - 평점: {review.rating}</li>
                ))}
              </ul>
            ) : (
              <div className='empty'>리뷰 데이터가 없습니다.</div>
            )}
          </div>
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

  useEffect(() => {
    if (modalData?.url) {
      setModalOpen(true);
    } else {
      setModalOpen(false);
    }
  }, [modalData]);


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
          <div onClick={(e) => e.stopPropagation()}>
            {modalData.contentType === 'img' ? (
              <img src={modalData.url} alt="Report Detail" />
            ) : (
              <p>지원하지 않는 파일 형식입니다.</p>
            )}
          </div>
        </DetailModal>
      )}
    </ReportWrapper>
  );
};

export default Report;