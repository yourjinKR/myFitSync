import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useSelector } from 'react-redux';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2.2rem;
  background: var(--bg-secondary);
  border-radius: 1.2rem;
  padding: 2.4rem 2rem 2rem 2rem;
  box-shadow: 0 0.2rem 1.2rem rgba(0, 0, 0, 0.18);
  max-width: 420px;
  margin: 0 auto;

  @media (max-width: 600px) {
    padding: 1.2rem 0.7rem 1.2rem 0.7rem;
    border-radius: 0.8rem;
    max-width: 98vw;
  }
`;

const Row = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 700;
  color: var(--primary-blue-light);
  font-size: 1.18rem;
  margin-bottom: 0.2rem;
  letter-spacing: -0.01em;
`;

const Input = styled.input`
  padding: 1.1rem 1rem;
  border: 1.5px solid var(--border-light);
  border-radius: 0.7rem;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 1.18rem;
  font-weight: 500;
  transition: border 0.18s, background 0.18s;
  outline: none;

  &:focus {
    border: 1.5px solid var(--primary-blue);
    background: var(--bg-secondary);
  }

  &:read-only {
    background: var(--bg-secondary);
    color: var(--text-secondary);
    font-weight: 400;
    border-style: dashed;
  }

  &::placeholder {
    color: var(--text-tertiary);
    font-weight: 400;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(90deg, var(--primary-blue) 60%, var(--primary-blue-light) 100%);
  color: var(--text-primary);
  padding: 1.1rem 0;
  border: none;
  border-radius: 0.9rem;
  font-size: 1.22rem;
  font-weight: 700;
  margin-top: 1.2rem;
  box-shadow: 0 0.08rem 0.4rem rgba(74, 144, 226, 0.13);
  letter-spacing: 0.01em;
  transition: background 0.18s, color 0.18s, box-shadow 0.18s;
  cursor: pointer;

  &:hover,
  &:focus {
    background: linear-gradient(90deg, var(--primary-blue-hover) 60%, var(--primary-blue) 100%);
    color: var(--bg-primary);
    box-shadow: 0 0.12rem 0.7rem rgba(74, 144, 226, 0.18);
    outline: none;
  }

  &:active {
    background: var(--primary-blue-dark);
    color: var(--text-primary);
  }
`;

const BodyInputForm = ({ onSuccess }) => {
  const { member_idx } = useSelector((state) => state.user.user);
  const [bodyData, setBodyData] = useState({
    body_height: '',
    body_weight: '',
    body_skeletal_muscle: '',
    body_fat: '',
    body_fat_percentage: '',
    body_bmi: '',
  });
    
  // 회원 키 정보 불러오기
  useEffect(() => {
    const fetchHeight = async () => {
      try {
        const res = await axios.get(`/user/body/${member_idx}`);
        const latestBody = Array.isArray(res.data) ? res.data[0] : res.data;

        setBodyData((prev) => ({
          ...prev,
          body_height: latestBody?.body_height || '',
        }));

      } catch (err) {
        console.error('키 정보 불러오기 실패:', err);
      }
    };
    fetchHeight();
  }, [member_idx]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setBodyData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/user/body/${member_idx}`, bodyData);
      onSuccess?.();
    } catch (err) {
      console.error('인바디 등록 실패:', err);
      alert('등록 실패');
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <Label>키 (cm)</Label>
        <Input type="number" name="body_height" value={bodyData.body_height} readOnly />
      </Row>
      <Row>
        <Label>몸무게 (kg)</Label>
        <Input type="number" name="body_weight" value={bodyData.body_weight} onChange={handleChange} required />
      </Row>
      <Row>
        <Label>골격근량 (kg)</Label>
        <Input type="number" name="body_skeletal_muscle" value={bodyData.body_skeletal_muscle} onChange={handleChange} required />
      </Row>
      <Row>
        <Label>체지방량 (kg)</Label>
        <Input type="number" name="body_fat" value={bodyData.body_fat} onChange={handleChange} required />
      </Row>
      <Row>
        <Label>체지방률 (%)</Label>
        <Input type="number" name="body_fat_percentage" value={bodyData.body_fat_percentage} onChange={handleChange} required />
      </Row>
      <Row>
        <Label>BMI</Label>
        <Input type="number" name="body_bmi" value={bodyData.body_bmi} onChange={handleChange} required />
      </Row>
      <SubmitButton type="submit">등록하기</SubmitButton>
    </Form>
  );
};

export default BodyInputForm;
