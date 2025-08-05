import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { PrimaryButton, SecondaryButton, ButtonGroup } from '../../styles/commonStyle';

const Row = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 12px;
`;

const Label = styled.label`
  width: 100px;
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 1.4rem;
`;

const Value = styled.div`
  flex: 1;
  color: var(--text-primary);
  font-size: 1.4rem;
  font-weight: 500;
  background: var(--bg-tertiary);
  border-radius: 6px;
  padding: 8px 12px;
  border: 1px solid var(--border-light);
`;

const Input = styled.input`
  flex: 1;
  padding: 8px 12px;
  font-size: 1.4rem;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-weight: 500;
  transition: border 0.2s;
  outline: none;

  &:focus {
    border-color: var(--primary-blue);
  }
`;

const LatestBodyInfo = ({ onUpdate }) => {
  const [bodyData, setBodyData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [edited, setEdited] = useState({});
  
  const memberIdx = useSelector(state => state.user.user.member_idx);
  
  useEffect(() => {
    axios.get(`/user/latest/${memberIdx}`)
      .then(res => {
        setBodyData(res.data);
        setEdited(res.data);
      })
      .catch(err => console.error(err));
  }, [memberIdx]);

  const handleChange = (e) => {
    setEdited({ ...edited, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await axios.patch(`/user/body/${bodyData.body_idx}`, edited);
      setBodyData(edited);
      setEditMode(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const yyyy = date.getFullYear();
  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
  const dd = date.getDate().toString().padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
};

  if (!bodyData) return null;

  return (
    <>
      <Row>
        <Label>측정일</Label>
        <Value>{formatDate(bodyData.body_regdate)}</Value>
      </Row>
      <Row>
        <Label>몸무게 (kg)</Label>
        {editMode
          ? <Input type="number" name="body_weight" value={edited.body_weight} onChange={handleChange} />
          : <Value>{bodyData.body_weight}</Value>}
      </Row>
      <Row>
        <Label>골격근량 (kg)</Label>
        {editMode
          ? <Input type="number" name="body_skeletal_muscle" value={edited.body_skeletal_muscle} onChange={handleChange} />
          : <Value>{bodyData.body_skeletal_muscle}</Value>}
      </Row>
      <Row>
        <Label>체지방량 (kg)</Label>
        {editMode
          ? <Input type="number" name="body_fat" value={edited.body_fat} onChange={handleChange} />
          : <Value>{bodyData.body_fat}</Value>}
      </Row>
      <Row>
        <Label>체지방률 (%)</Label>
        {editMode
          ? <Input type="number" name="body_fat_percentage" value={edited.body_fat_percentage} onChange={handleChange} />
          : <Value>{bodyData.body_fat_percentage}</Value>}
      </Row>
      <Row>
        <Label>BMI</Label>
        {editMode
          ? <Input type="number" name="body_bmi" value={edited.body_bmi} onChange={handleChange} />
          : <Value>{bodyData.body_bmi}</Value>}
      </Row>
      <ButtonGroup>
        {editMode ? (
          <>
            <PrimaryButton onClick={handleSave}>저장</PrimaryButton>
            <SecondaryButton onClick={() => setEditMode(false)}>취소</SecondaryButton>
          </>
        ) : (
          <PrimaryButton onClick={() => setEditMode(true)}>수정</PrimaryButton>
        )}
      </ButtonGroup>
    </>
  );
};

export default LatestBodyInfo;
