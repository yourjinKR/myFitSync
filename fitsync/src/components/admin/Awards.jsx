import axios from 'axios';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

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

    th {
      color: var(--text-white);
      }
    td {
    }
    tr {
      display: flex;
    }
    th:nth-child(1), td:nth-child(1) { flex: 1; }
    th:nth-child(2), td:nth-child(2) { flex: 2; }
    th:nth-child(3), td:nth-child(3) { flex: 7; }
    th:nth-child(4), td:nth-child(4) { flex: 2; }
    th:nth-child(5), td:nth-child(5) { flex: 3; }
  }
`;

const Awards = () => {
  const [awardData, setAwardData] = useState([]);

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

  useEffect(() => {
    getAwards();
  }, []);

  useEffect(() => {
    console.log("🚀  :  Awards  :  awardData:", awardData)
  }, [awardData]);

  return (
    <AwardsWrapper>
      <table>
        <thead>
          <tr>
            <th>번호</th>
            <th>이름</th>
            <th>자격증</th>
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
                <td>{item.awards_name}</td>
                <td>{item.awards_approval === 'Y' ? '승인완료' : '승인전'}</td>
                <td>
                  {/* 관리 버튼들 추가 */}
                  <button>승인</button>
                </td>
              </tr>
            )) :
            <tr>
              <td colSpan="5">데이터가 없습니다.</td>
            </tr>
          }
        </tbody>
      </table>
    </AwardsWrapper>
  );
};

export default Awards;