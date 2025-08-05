import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { MdEdit, MdCheck, MdReport, MdVisibility, MdVisibilityOff, MdCameraAlt } from 'react-icons/md';
import Switch from '@mui/material/Switch';
import SettingsIcon from '@mui/icons-material/Settings';
import ProfileImageEditable from '../ProfileImageEditable';
import axios from 'axios';

// --- 스타일: 카드 크기 확대, 인스타 느낌, 모든 기능 포함 ---
const InstaProfileHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 2.2rem;
  padding: 2.5rem 2rem 2rem 2rem;
  background: linear-gradient(120deg, var(--bg-secondary) 70%, var(--bg-primary) 100%);
  border-radius: 2.2rem;
  box-shadow: 0 0.3rem 1.5rem rgba(0,0,0,0.13);
  max-width: 715px;
  min-width: 0;
  position: relative;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: center;
    padding: 1.5rem 0.7rem 1.5rem 0.7rem;
    border-radius: 1.2rem;
    max-width: 99vw;
    gap: 1.2rem;
  }
`;

const InstaProfileImgWrap = styled.div`
  position: relative;
  width: 110px;
  height: 110px;
  min-width: 110px;
  min-height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const InstaProfileImg = styled.img`
  width: 110px;
  height: 110px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--primary-blue);
  background: var(--bg-tertiary);
  box-shadow: 0 0.12rem 0.7rem rgba(74,144,226,0.13);
`;

const EditImgButton = styled.button`
  position: absolute;
  right: 0;
  bottom: 0;
  background: var(--primary-blue);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 2.6rem;
  height: 2.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  box-shadow: 0 0.05rem 0.2rem rgba(74,144,226,0.18);
  cursor: pointer;
  transition: background 0.18s;
  &:hover { background: var(--primary-blue-hover); }
`;

const InstaProfileInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
`;

const InstaNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
`;

const InstaName = styled.h2`
  font-size: 2.1rem;
  font-weight: 900;
  color: var(--primary-blue);
  letter-spacing: -0.02em;
  margin-bottom: 0.2rem;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const InstaButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const InstaButton = styled.button`
  padding: 0.5rem 1.3rem;
  border: none;
  border-radius: 1.4rem;
  background: ${({ $primary }) =>
    $primary
      ? 'linear-gradient(90deg, var(--primary-blue) 60%, var(--primary-blue-light) 100%)'
      : 'var(--bg-tertiary)'};
  color: ${({ $primary }) => ($primary ? 'var(--text-primary)' : 'var(--text-secondary)')};
  font-size: 1.13rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: ${({ $primary }) => $primary ? '0 0.05rem 0.2rem rgba(74,144,226,0.10)' : 'none'};
  transition: background 0.18s, color 0.18s;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  &:hover, &:focus {
    background: ${({ $primary }) =>
      $primary
        ? 'linear-gradient(90deg, var(--primary-blue-hover) 60%, var(--primary-blue) 100%)'
        : 'var(--border-medium)'};
    color: ${({ $primary }) => ($primary ? 'var(--bg-primary)' : 'var(--text-primary)')};
    outline: none;
  }
`;

const InstaEmail = styled.div`
  font-size: 1.13rem;
  color: var(--text-secondary);
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const InstaGymInfo = styled.div`
  font-size: 1.13rem;
  color: var(--primary-blue-light);
  margin-top: 0.2rem;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const InstaSwitchRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-top: 0.2rem;
`;

const InstaSwitchLabel = styled.span`
  font-size: 1.08rem;
  color: var(--text-tertiary);
`;

const ButtonEdit = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  svg{
    width: 2.4rem;
    height: 2.4rem;
    color: var(--text-secondary);
  }
`;

// --- 컴포넌트 ---
const TrainerProfileHeader = ({
  trainer,
  user,
  isEdit,
  onChange,
  onEditToggle,
  loginUserId,
  mode = 'trainer',
  onImageChange,
  onVisibilityToggle,
  setIsInfoEdit
}) => {
  const isTrainer = mode === 'trainer';
  const [localTrainer, setLocalTrainer] = useState(trainer);
  useEffect(() => {
    setLocalTrainer(trainer);
  }, [trainer]);
  const [updating, setUpdating] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const profileImage = localTrainer?.profile_image || localTrainer?.member_image;
  const name = localTrainer?.name || localTrainer?.member_name || '이름 없음';
  const isMine = loginUserId && (localTrainer?.member_email === loginUserId || user?.member_email === loginUserId);
  const isHidden = localTrainer?.member_hidden === 1;
  const targetMember = localTrainer || user;

  // 공개/비공개 토글
  const handleToggleVisibility = async () => {
    if (updating || !localTrainer?.member_idx) return;
    try {
      setUpdating(true);
      const updatedHidden = isHidden ? 0 : 1;
      const res = await axios.put(`/trainer/${localTrainer.member_idx}/visibility`, {
        member_hidden: updatedHidden,
      });
      if (res.status === 200) {
        const updatedTrainer = { ...localTrainer, member_hidden: updatedHidden };
        setLocalTrainer(updatedTrainer);
        if (onVisibilityToggle) onVisibilityToggle(updatedHidden);
      }
    } catch (err) {
      alert('공개/비공개 전환 실패');
    } finally {
      setUpdating(false);
    }
  };

  // 신고 제출
  const handleReportSubmit = async () => {
    try {
      await axios.post('/member/report/profile', {
        report_category: 'member',
        report_content: reportReason,
        report_sanction: targetMember?.member_idx,
        report_hidden: 0
      });
      alert('신고가 접수되었습니다.');
      setShowReportModal(false);
      setReportReason('');
    } catch (err) {
      alert('신고 처리 중 문제가 발생했습니다.');
    }
  };

  // 프로필 이미지 변경
  const handleImageChange = (file) => {
    if (onImageChange) onImageChange(file);
  };

  return (
    <InstaProfileHeader>
      <InstaProfileImgWrap>
        <InstaProfileImg src={profileImage || '/default-profile.png'} alt="프로필" />
        {isMine && (
          <EditImgButton onClick={() => document.getElementById('profile-img-input').click()} title="프로필 이미지 변경">
            <MdCameraAlt size={20} />
            <input
              id="profile-img-input"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={e => e.target.files && handleImageChange(e.target.files[0])}
            />
          </EditImgButton>
        )}
      </InstaProfileImgWrap>
      <InstaProfileInfo>
        <InstaNameRow>
          <InstaName>
            {name}
            {isTrainer ? ' 선생님' : ''}
          </InstaName>
          <InstaButtonGroup>
            {isTrainer && isMine && (
              <InstaButton $primary onClick={onEditToggle}>
                {isEdit ? <MdCheck /> : <MdEdit />}
                {isEdit ? '저장' : '수정'}
              </InstaButton>
            )}
            {!isMine && (
              <InstaButton onClick={() => setShowReportModal(true)}>
                <MdReport />
                신고
              </InstaButton>
            )}
          </InstaButtonGroup>
        </InstaNameRow>
        <InstaEmail>{localTrainer?.member_email}</InstaEmail>
        {localTrainer?.gymInfo?.gym_name && (
          <InstaGymInfo>{localTrainer.gymInfo.gym_name}</InstaGymInfo>
        )}
        {isTrainer && isMine && (
          <InstaSwitchRow>
            <Switch
              checked={!isHidden}
              onChange={handleToggleVisibility}
              color="primary"
              size="small"
              inputProps={{ 'aria-label': '공개/비공개 전환' }}
              disabled={updating}
            />
            <InstaSwitchLabel>
              {isHidden ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
              {isHidden ? '비공개' : '공개'}
            </InstaSwitchLabel>
          </InstaSwitchRow>
        )}

      </InstaProfileInfo>

      {/* 신고 모달 */}
      {showReportModal && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.55)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <div
            style={{
              background: 'var(--bg-secondary)',
              borderRadius: '1.2rem',
              padding: '2.2rem 1.5rem 1.5rem 1.5rem',
              width: '95vw',
              maxWidth: 400,
              boxSizing: 'border-box',
              boxShadow: '0 0.2rem 1.2rem rgba(0,0,0,0.18)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{
              margin: 0, marginBottom: '1.2rem',
              color: 'var(--primary-blue)',
              fontSize: '1.4rem',
              fontWeight: 700,
              textAlign: 'center'
            }}>프로필 신고하기</h2>
            <div style={{
              color: 'var(--text-secondary)',
              fontSize: '1.08rem',
              textAlign: 'center',
              marginBottom: '1.2rem'
            }}>신고 사유를 입력해주세요</div>
            <textarea
              placeholder="신고 사유를 자세히 작성해 주세요."
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
              style={{
                width: '100%',
                minHeight: 90,
                resize: 'none',
                marginBottom: '1.2rem',
                padding: '1rem',
                fontSize: '1.08rem',
                borderRadius: '0.7rem',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: '1.5px solid var(--border-light)',
                outline: 'none'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.7rem' }}>
              <InstaButton onClick={() => setShowReportModal(false)}>취소</InstaButton>
              <InstaButton $primary onClick={handleReportSubmit}>신고</InstaButton>
            </div>
          </div>
        </div>
      )}
      {!isTrainer && (
        <ButtonEdit onClick={() => setIsInfoEdit(true)} title="프로필 설정">
          <SettingsIcon />
        </ButtonEdit>
      )}
    </InstaProfileHeader>
  );
};

export default TrainerProfileHeader;
