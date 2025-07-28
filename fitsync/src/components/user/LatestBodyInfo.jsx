import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useSelector } from 'react-redux';

const Container = styled.div`
  padding: 2.2rem 2rem;
  background: var(--bg-secondary);
  border-radius: 1.2rem;
  box-shadow: 0 0.2rem 1.2rem rgba(0,0,0,0.10);
  margin-bottom: 2.2rem;
  max-width: 420px;
  margin-left: auto;
  margin-right: auto;
`;

const Title = styled.h3`
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--primary-blue);
  margin-bottom: 1.6rem;
  text-align: center;
  letter-spacing: -0.02em;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.1rem;
  gap: 0.7rem;
`;

const Label = styled.label`
  width: 120px;
  font-weight: 600;
  color: var(--primary-blue-light);
  font-size: 1.08rem;
`;

const Value = styled.div`
  flex: 1;
  color: var(--text-primary);
  font-size: 1.08rem;
  font-weight: 500;
  background: var(--bg-tertiary);
  border-radius: 0.7rem;
  padding: 0.7rem 1rem;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.7rem 1rem;
  font-size: 1.08rem;
  border: 1.5px solid var(--border-light);
  border-radius: 0.7rem;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-weight: 500;
  transition: border 0.18s, background 0.18s;
  outline: none;

  &:focus {
    border: 1.5px solid var(--primary-blue);
    background: var(--bg-secondary);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.7rem;
  justify-content: center;
  margin-top: 1.2rem;
`;

const Button = styled.button`
  padding: 0.7rem 1.6rem;
  font-size: 1.08rem;
  font-weight: 600;
  background: ${({ primary }) =>
    primary ? 'linear-gradient(90deg, var(--primary-blue) 60%, var(--primary-blue-light) 100%)' : 'var(--border-light)'};
  color: ${({ primary }) => (primary ? 'var(--text-primary)' : 'var(--text-secondary)')};
  border: none;
  border-radius: 0.8rem;
  box-shadow: ${({ primary }) => primary ? '0 0.05rem 0.2rem rgba(74,144,226,0.10)' : 'none'};
  transition: background 0.18s, color 0.18s;
  cursor: pointer;

  &:hover, &:focus {
    background: ${({ primary }) =>
      primary
        ? 'linear-gradient(90deg, var(--primary-blue-hover) 60%, var(--primary-blue) 100%)'
        : 'var(--border-medium)'};
    color: ${({ primary }) => (primary ? 'var(--bg-primary)' : 'var(--text-primary)')};
    outline: none;
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
  }, []);

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
    <Container>
      <Title>최신 인바디 정보</Title>
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
            <Button onClick={handleSave} primary>저장</Button>
            <Button onClick={() => setEditMode(false)}>취소</Button>
          </>
        ) : (
          <Button onClick={() => setEditMode(true)} primary>수정</Button>
        )}
      </ButtonGroup>
    </Container>
  );
};

export default LatestBodyInfo;
