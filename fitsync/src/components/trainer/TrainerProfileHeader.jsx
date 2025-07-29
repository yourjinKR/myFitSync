import React, { useState } from 'react';
import styled from 'styled-components';
import { MdEdit, MdCheck } from 'react-icons/md';
import Switch from '@mui/material/Switch';
import ProfileImageEditable from '../ProfileImageEditable';
import axios from 'axios';

const ProfileHeader = styled.div`
  text-align: center;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-secondary);
`;

const NameWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const Name = styled.h2`
  font-size: 1.7rem;
  font-weight: bold;
  margin-bottom: 8px;
  color: var(--text-primary);
`;

const EditButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.6rem;
  color: var(--primary-blue);
  padding: 0;
  margin-bottom: 8px;

  &:hover {
    opacity: 0.8;
    color: var(--primary-blue-hover);
  }
`;

const ReviewCount = styled.p`
  color: var(--text-secondary);
  font-size: 1.05rem;
  margin-top: 4px;
`;

const Quote = styled.p`
  font-style: italic;
  font-size: 1.15rem;
  color: var(--text-secondary);
  margin-top: 10px;
  padding: 0 10px;
`;

const QuoteInput = styled.input`
  margin-top: 10px;
  padding: 8px 10px;
  width: 80%;
  font-size: 1.1rem;
  font-style: italic;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  text-align: center;
  background: var(--bg-tertiary);
  color: var(--text-primary);
`;

const SummaryBox = styled.div`
  margin-top: 14px;
  padding: 16px;
  background-color: var(--bg-tertiary);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 1.15rem;
  color: var(--text-primary);
`;

const SummaryItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const VisibilityToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 10px;
`;

/**
 * @param {object} props
 * @param {object} props.trainer - 트레이너 객체 (또는 null)
 * @param {object} props.user - 유저 객체 (또는 null)
 * @param {boolean} props.isEdit - 수정 모드 여부 (트레이너만)
 * @param {function} props.onChange - 필드 변경 핸들러 (트레이너만)
 * @param {function} props.onEditToggle - 수정/저장 버튼 핸들러 (트레이너만)
 * @param {string} props.loginUserId - 로그인 유저 이메일
 * @param {'trainer' | 'user'} props.mode - 모드 구분
 * @param {function} props.onImageChange - 프로필 이미지 변경 콜백
 * @param {function} props.onVisibilityToggle - 공개/비공개 토글 콜백
 */

const TrainerProfileHeader = ({
  trainer,
  user,
  isEdit,
  onChange,
  onEditToggle,
  loginUserId,
  mode = 'trainer',
  onImageChange,
  onVisibilityToggle, // 이건 외부 콜백이 있다면 그대로 두되 내부 요청도 병행
}) => {
  const isTrainer = mode === 'trainer';
  const [localTrainer, setLocalTrainer] = useState(trainer); // 내부에서 상태 관리
  const [updating, setUpdating] = useState(false); // 중복 요청 방지

  const profileImage = localTrainer?.profile_image || localTrainer?.member_image;
  const name = localTrainer?.name || localTrainer?.member_name || '이름 없음';
  const isMine = loginUserId && (localTrainer?.member_email === loginUserId || user?.member_email === loginUserId);
  const isHidden = localTrainer?.member_hidden === 1;

  const handleToggleVisibility = async () => {
    if (updating || !localTrainer?.member_idx) return;
    
    try {
      setUpdating(true);
      const updatedHidden = isHidden ? 0 : 1;
      const res = await axios.put(`/trainer/${localTrainer.member_idx}/visibility`, {
        member_hidden: updatedHidden === 1
      });

      if (res.status === 200) {
        // 상태 동기화
        const updatedTrainer = { ...localTrainer, member_hidden: updatedHidden };
        setLocalTrainer(updatedTrainer);
        if (onVisibilityToggle) onVisibilityToggle(updatedHidden); // 외부 콜백도 호출
      }
    } catch (err) {
      console.error('공개/비공개 전환 실패:', err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <ProfileHeader>
      <ProfileImageEditable imageUrl={profileImage} onSuccess={onImageChange} />

      <NameWrapper>
        <Name>
          {name}
          {isTrainer ? ' 선생님' : ''}
        </Name>

        {isTrainer && isMine && (
          <>
            <EditButton onClick={onEditToggle} title={isEdit ? '저장하기' : '수정하기'}>
              {isEdit ? <MdCheck /> : <MdEdit />}
            </EditButton>

            <VisibilityToggle>
              <span>{isHidden ? '비공개' : '공개'}</span>
              <Switch
                checked={!isHidden}
                onChange={handleToggleVisibility}
                color="primary"
                disabled={updating}
              />
            </VisibilityToggle>
          </>
        )}
      </NameWrapper>

      {isTrainer && <ReviewCount>⭐ 후기 {localTrainer?.reviews || 0}개</ReviewCount>}

      {isTrainer &&
        (isEdit ? (
          <QuoteInput
            type="text"
            value={localTrainer?.intro ?? ''}
            onChange={(e) => onChange('intro', e.target.value)}
            placeholder="한줄소개를 입력하세요"
          />
        ) : (
          <Quote>
            {localTrainer?.intro?.trim()
              ? `"${localTrainer.intro}"`
              : '"한줄소개가 아직 등록되지 않았습니다."'}
          </Quote>
        ))}

      {isTrainer && (
        <SummaryBox>
          <SummaryItem>📜 자격증 {localTrainer?.certifications?.length || 0}개</SummaryItem>
          <SummaryItem>🏋️‍♂️ 전문: {(localTrainer?.specialties || []).join(', ')}</SummaryItem>
          <SummaryItem>💰 1회 {localTrainer?.priceBase?.toLocaleString() || 0}원</SummaryItem>
        </SummaryBox>
      )}
    </ProfileHeader>
  );
};

export default TrainerProfileHeader;

