import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { MdEdit, MdCheck, MdReport } from 'react-icons/md';
import Switch from '@mui/material/Switch';
import SettingsIcon from '@mui/icons-material/Settings';
import axios from 'axios';
import ProfileImageEditor from '../ProfileImageEditable';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ScaleIcon from '@mui/icons-material/Scale';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import HealingIcon from '@mui/icons-material/Healing';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import GradientButton from '../ai/GradientButton';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../../hooks/useSubscription';

// --- 스타일: 카드 크기 확대, 인스타 느낌, 모든 기능 포함 ---
const InstaProfileHeader = styled.div`
  display: grid;
  grid-template-columns: 170px 1fr;
  grid-template-rows: auto 1fr;
  padding: 3.5rem 3rem 3rem 3rem;
  background: linear-gradient(120deg, var(--bg-secondary) 70%, var(--bg-primary) 100%);
  border-radius: 2.8rem;
  box-shadow: 0 0.5rem 2.2rem rgba(0,0,0,0.15);
  max-width: 950px;
  min-width: 0;
  position: relative;

  @media (max-width: 900px) {
    max-width: 99vw;
    gap: 1.2rem 1.8rem;
    padding: 2.2rem 1rem 2.2rem 1rem;
    border-radius: 1.8rem;
    grid-template-columns: 120px 1fr;
  }
  @media (max-width: 600px) {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.7rem 0.7rem 1.7rem 0.7rem;
    border-radius: 1.2rem;
    gap: 1.2rem;
  }
`;

// 오른쪽 상단 버튼 그룹
const TopRightGroup = styled.div`
  position: absolute;
  top: 18px;
  right: 18px;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  z-index: 2;
`;

const IconButton = styled.button`
  background: var(--bg-tertiary);
  border: none;
  border-radius: 50%;
  width: 2.6rem;
  height: 2.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.45rem;
  color: var(--primary-blue);
  cursor: pointer;
  box-shadow: 0 0.05rem 0.2rem rgba(74,144,226,0.10);
  transition: background 0.18s, color 0.18s;
  &:hover, &:focus {
    background: var(--primary-blue-light);
    color: #fff;
    outline: none;
  }
`;

const InstaProfileImgWrap = styled.div`
  grid-column: 1 / 2;
  grid-row: 1 / 2;
  position: relative;
  width: 150px;
  height: 150px;
  min-width: 150px;
  min-height: 150px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  @media (max-width: 900px) {
    width: 120px;
    height: 120px;
    min-width: 120px;
    min-height: 120px;
  }
  @media (max-width: 600px) {
    align-items: center;
    justify-content: center;
    width: 110px;
    height: 110px;
    min-width: 110px;
    min-height: 110px;
  }
`;

const InstaProfileInfo = styled.div`
  grid-column: 2 / 3;
  grid-row: 1 / 3;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;

  @media (max-width: 600px) {
    align-items: center;
    text-align: center;
  }
`;

const InstaNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  flex-wrap: wrap;
  min-height: 3.2rem;
  @media (max-width: 600px) {
    justify-content: center;
    width: 100%;
  }
`;

const InstaName = styled.h2`
  font-size: 2.8rem;
  font-weight: 900;
  color: var(--primary-blue);
  letter-spacing: -0.02em;
  margin-bottom: 0.2rem;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
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
  font-size: 1.45rem;
  color: var(--text-secondary);
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  @media (max-width: 600px) {
    width: 100%;
    text-align: center;
  }
`;

const InstaGymInfo = styled.div`
  font-size: 1.35rem;
  color: var(--primary-blue-light);
  margin-top: 0.2rem;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  @media (max-width: 600px) {
    width: 100%;
    text-align: center;
  }
`;

const InstaIntro = styled.div`
  font-size: 1.18rem;
  color: var(--text-primary);
  margin-top: 0.2rem;
  @media (max-width: 600px) {
    width: 100%;
    text-align: center;
  }
`;

const InstaIntroInput = styled.textarea`
  font-size: 1.18rem;
  color: var(--text-primary);
  margin-top: 0.2rem;
  background: var(--bg-secondary);
  border: 1.5px solid var(--border-light);
  border-radius: 0.8rem;
  padding: 0.8rem 1rem;
  resize: none;
  min-height: 60px;
  max-height: 60px;
  height: 60px;
  width: 100%;
  box-sizing: border-box;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
  
  &:focus {
    border-color: var(--primary-blue);
  }
  
  &::placeholder {
    color: var(--text-secondary);
  }
  
  @media (max-width: 600px) {
    text-align: center;
  }
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
const SwitchWrap = styled.div`
  display: flex;
  align-items: center;
  margin-left: 0.2rem;
  .MuiSwitch-root {
    margin-right: 0;
  }
`;

const purposeList = [
  { key: '체중관리', color: '#4A90E2' },
  { key: '근육증가', color: '#4A90E2' },
  { key: '체형교정', color: '#4A90E2' },
  { key: '체력증진', color: '#4A90E2' },
  { key: '재활', color: '#4A90E2' },
  { key: '바디프로필', color: '#4A90E2' }
];

// 목적별 아이콘 매핑
const purposeIcons = {
  '체중관리': <ScaleIcon style={{ fontSize: '1.2em', marginRight: '0.4em' }} />,
  '근육증가': <FitnessCenterIcon style={{ fontSize: '1.2em', marginRight: '0.4em' }} />,
  '체형교정': <AccessibilityNewIcon style={{ fontSize: '1.2em', marginRight: '0.4em' }} />,
  '체력증진': <DirectionsRunIcon style={{ fontSize: '1.2em', marginRight: '0.4em' }} />,
  '재활': <HealingIcon style={{ fontSize: '1.2em', marginRight: '0.4em' }} />,
  '바디프로필': <PhotoCameraIcon style={{ fontSize: '1.2em', marginRight: '0.4em' }} />,
};

const PurposeTag = styled.button`
  display: inline-flex;
  align-items: center;
  margin-left: 0;
  margin-bottom: 0;
  padding: 0.28rem 0.9rem;
  border-radius: 1.1rem;
  font-size: 1.15rem;
  font-weight: 700;
  color: #fff;
  background: ${({ color }) => color};
  border: none;
  cursor: ${({ $edit }) => ($edit ? 'pointer' : 'default')};
  opacity: ${({ $selected }) => ($selected ? 1 : 0.45)};
  box-shadow: ${({ $selected }) => ($selected ? '0 0.05rem 0.2rem rgba(0,0,0,0.10)' : 'none')};
  transition: none;
  text-shadow:
    -1px -1px 0 #222,
     1px -1px 0 #222,
    -1px  1px 0 #222,
     1px  1px 0 #222;
`;

const PurposeRow = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 0.5rem;
  margin-top: 0.7rem;
  margin-left: -0.5rem;
  min-height: 2.2rem;
  width: 100%;
  white-space: nowrap;
  overflow-x: visible; // 스크롤 제거
`;

// 사용자 모드일 때 버튼 컨테이너
const UserButtonContainer = styled.div`
  margin-top: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  
  button {
    font-size: 1.2rem;
    padding: 0.4rem 1rem;
    min-height: auto;
    height: 3.4rem;
    
    /* 비구독자일 때 일반 블루 색상 적용 */
    ${props => !props.$isSubscriber && `
      background: var(--primary-blue) !important;
      border: 2px solid var(--primary-blue) !important;
      
      &:active {
        background: var(--primary-blue-dark) !important;
        border-color: var(--primary-blue-dark) !important;
      }
      
      &::before, &::after {
        display: none !important;
      }
    `}
    
    @media (max-width: 900px) {
      font-size: 1rem;
      padding: 0.35rem 0.8rem;
      height: 2.2rem;
    }
    
    @media (max-width: 600px) {
      font-size: 0.95rem;
      padding: 0.3rem 0.7rem;
      height: 2rem;
    }
  }
  
  @media (max-width: 600px) {
    justify-content: center;
    margin-top: 1rem;
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

  const nav = useNavigate();

  const { 
    isSubscriber, 
    totalCost, 
    lastPaymentDate, 
    loading, 
    error, 
    reload 
  } = useSubscription();

  // 핸들러
  const subScriptionPagehandler = () => {
    console.log(isSubscriber);
    
    if (isSubscriber) {
      nav('/ai/userLog');
    } else {
      nav('/subscription');
    }
  }
  
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

  // 프로필 이미지 변경 시 성공 콜백
  const handleImageChangeSuccess = (updatedImageData) => {
    // 서버에서 받은 새 이미지 URL을 localTrainer 상태에 반영
    setLocalTrainer(prev => ({
      ...prev,
      profile_image: updatedImageData.image || updatedImageData.imageUrl || profileImage,
    }));
  };
  
  // member_purpose 처리
  const memberPurpose =
    Array.isArray(trainer.member_purpose)
      ? trainer.member_purpose
      : typeof trainer.member_purpose === 'string'
        ? trainer.member_purpose.split(',').map(p => p.trim()).filter(Boolean)
        : [];

  const [selectedPurpose, setSelectedPurpose] = useState(memberPurpose);
  const [introValue, setIntroValue] = useState('');

  useEffect(() => {
    setSelectedPurpose(
      Array.isArray(trainer.member_purpose)
        ? trainer.member_purpose
        : typeof trainer.member_purpose === 'string'
          ? trainer.member_purpose.split(',').map(p => p.trim()).filter(Boolean)
          : []
    );
  }, [trainer.member_purpose]);

  // TrainerDetailView 패턴에 맞춘 intro 관리
  useEffect(() => {
    if (isEdit) {
      // 수정 모드: trainer.intro 값 사용 (editedTrainer의 intro)
      setIntroValue(trainer?.intro || '');
    } else {
      // 일반 모드: trainer.member_intro 값 사용 (저장된 최신 값)
      setIntroValue(trainer?.member_intro || '');
    }
  }, [isEdit, trainer?.intro, trainer?.member_intro]);

  const handlePurposeClick = (purpose) => {
    if (!isEdit) return;
    let newPurpose;
    if (selectedPurpose.includes(purpose)) {
      newPurpose = selectedPurpose.filter(p => p !== purpose);
    } else {
      newPurpose = [...selectedPurpose, purpose];
    }
    setSelectedPurpose(newPurpose);
    // TrainerDetailView에서 onChange로 업데이트
    if (typeof onChange === 'function') {
      onChange('member_purpose', newPurpose.join(','));
    }
  };

  const handleIntroChange = (e) => {
    const newIntro = e.target.value;
    setIntroValue(newIntro);
    if (typeof onChange === 'function') {
      onChange('intro', newIntro); // TrainerDetailView에서 intro 필드 사용
    }
  };

   return (
    <InstaProfileHeader>
      {/* 오른쪽 상단 버튼 그룹 */}
      <TopRightGroup>
        {isTrainer && isMine && (
          <IconButton onClick={onEditToggle} title={isEdit ? '저장' : '수정'}>
            {isEdit ? <MdCheck /> : <MdEdit />}
          </IconButton>
        )}
        {!isMine && (
          <IconButton onClick={() => setShowReportModal(true)} title="신고">
            <MdReport />
          </IconButton>
        )}
        {isTrainer && isMine && (
          <SwitchWrap>
            <Switch
              checked={!isHidden}
              onChange={handleToggleVisibility}
              color="primary"
              size="small"
              inputProps={{ 'aria-label': '공개/비공개 전환' }}
              disabled={updating}
            />
          </SwitchWrap>
        )}
      </TopRightGroup>

      <InstaProfileImgWrap>
        <ProfileImageEditor
          memberIdx={localTrainer?.member_idx}
          profileImage={localTrainer?.member_image}
          isEditable={isMine}
          onSuccess={handleImageChangeSuccess}
        />
      </InstaProfileImgWrap>

      <InstaProfileInfo>
        <InstaNameRow>
          <InstaName>
            {name}
            {isTrainer ? ' 선생님' : ''}
          </InstaName>
        </InstaNameRow>
        <InstaEmail>{localTrainer?.member_email}</InstaEmail>
        {localTrainer?.gymInfo?.gym_name && (
          <InstaGymInfo>{localTrainer.gymInfo.gym_name}</InstaGymInfo>
        )}
        {mode === 'trainer' && (
          <>
            {isEdit ? (
              <InstaIntroInput
                value={introValue}
                onChange={handleIntroChange}
                placeholder="자기소개를 입력해주세요..."
                maxLength={500}
              />
            ) : (
              <InstaIntro>{trainer?.member_intro || '소개글을 작성해주세요'}</InstaIntro>
            )}
          </>
        )}
        {mode === 'trainer' && (
          <>
            <PurposeRow>
              {purposeList.map(({ key, color }) => (
                (isEdit || selectedPurpose.includes(key)) && (
                  <PurposeTag
                    key={key}
                    color={color}
                    $edit={isEdit}
                    $selected={selectedPurpose.includes(key)}
                    type={isEdit ? 'button' : 'span'}
                    onClick={() => handlePurposeClick(key)}
                    tabIndex={isEdit ? 0 : -1}
                    aria-pressed={selectedPurpose.includes(key)}
                  >
                    {purposeIcons[key]}
                    {key}
                  </PurposeTag>
                )
              ))}
            </PurposeRow>          
          </>
        )}
        {mode === 'user' && (
          <UserButtonContainer $isSubscriber={isSubscriber}>
            <GradientButton 
              size='small' 
              animate={isSubscriber} 
              onClick={() => subScriptionPagehandler()}>
              {isSubscriber ? ('FitSync Premium') : ('구독 및 결제')}
            </GradientButton>
          </UserButtonContainer>
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
          onClick={() => setShowReportModal(false)}
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
