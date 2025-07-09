import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { calculateAge } from '../../utils/utilFunc';

const InputContainer = styled.div`
    background: var(--bg-secondary);
    padding: 2rem;
    border-radius: 12px;
    border: 1px solid var(--border-light);
    margin-bottom: 2rem;
    
    @media (max-width: 768px) {
        padding: 1.5rem;
        margin-bottom: 1.5rem;
    }
`;

const SectionTitle = styled.h3`
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    @media (max-width: 768px) {
        font-size: 1.25rem;
        margin-bottom: 1rem;
    }
`;

const InputGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
    
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 1rem;
        margin-bottom: 1.5rem;
    }
`;

const InputGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const InputLabel = styled.label`
    font-size: 1rem;
    font-weight: 500;
    color: var(--text-primary);
    
    &::after {
        content: ${props => props.required ? '" *"' : '""'};
        color: var(--warning);
        margin-left: 4px;
    }
`;

const InputField = styled.input`
    background: var(--bg-tertiary);
    border: 1px solid var(--border-light);
    color: var(--text-primary);
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 1rem;
    transition: all 0.2s ease;
    
    &:focus {
        border-color: var(--primary-blue);
        box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
        outline: none;
    }
    
    &::placeholder {
        color: var(--text-tertiary);
    }
`;

const SelectField = styled.select`
    background: var(--bg-tertiary);
    border: 1px solid var(--border-light);
    color: var(--text-primary);
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 1rem;
    transition: all 0.2s ease;
    cursor: pointer;
    
    &:focus {
        border-color: var(--primary-blue);
        box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
        outline: none;
    }
    
    option {
        background: var(--bg-tertiary);
        color: var(--text-primary);
    }
`;

const TextAreaField = styled.textarea`
    background: var(--bg-tertiary);
    border: 1px solid var(--border-light);
    color: var(--text-primary);
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 1rem;
    transition: all 0.2s ease;
    resize: vertical;
    min-height: 100px;
    font-family: inherit;
    
    &:focus {
        border-color: var(--primary-blue);
        box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
        outline: none;
    }
    
    &::placeholder {
        color: var(--text-tertiary);
    }
`;

const GenerateButton = styled.button`
    background: var(--primary-blue);
    color: var(--text-primary);
    border: none;
    padding: 1.25rem 3rem;
    font-size: 1.2rem;
    font-weight: 600;
    border-radius: 12px;
    transition: all 0.3s ease;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 auto;
    
    &:hover {
        background: var(--primary-blue-hover);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(74, 144, 226, 0.3);
    }
    
    &:active {
        transform: translateY(0);
    }
    
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }
    
    @media (max-width: 768px) {
        width: 100%;
        justify-content: center;
        padding: 1rem 2rem;
        font-size: 1.1rem;
    }
`;

const InfoMessage = styled.div`
    background: var(--bg-tertiary);
    border: 1px solid var(--border-light);
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 2rem;
    color: var(--text-secondary);
    font-size: 0.95rem;
    line-height: 1.5;
    
    strong {
        color: var(--text-primary);
    }
`;

const bodyParts = [
    '손목', '팔꿈치', '어깨', '목', '허리', '골반', '무릎', '발목'
];

const CheckboxGroup = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.75rem;
    
    @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.5rem;
    }
`;

const CheckboxItem = styled.label`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-light);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.95rem;
    
    &:hover {
        background: var(--bg-primary);
        border-color: var(--primary-blue-light);
    }
    
    &:has(input:checked) {
        background: var(--primary-blue-light);
        border-color: var(--primary-blue);
        color: var(--text-primary);
    }
`;

const CheckboxInput = styled.input`
    width: 16px;
    height: 16px;
    margin: 0;
    accent-color: var(--primary-blue);
    cursor: pointer;
`;

const StepInputInfo = ({ memberData, onGenerate }) => {
    // 신체 부위 목록 정의
    const bodyParts = ['손목', '팔꿈치', '어깨', '목', '허리', '골반', '발목', '무릎'];

    const [formData, setFormData] = useState({
        // 기본 정보 (멤버 데이터에서 가져옴)
        name: '',
        age: '',
        gender: '',
        height: '',
        weight: '',
        disease: [], // 배열로 변경
        purpose: '',
        bmi: '',
        fat: '',
        fat_percentage: '',
        skeletal_muscle: '',
        
        // 추가 정보 (사용자 입력)
        split: 4,
    });

    // 멤버 데이터 로드 시 폼 데이터 초기화
    useEffect(() => {
        if (memberData) {
            const { member, body } = memberData;
            setFormData(prev => ({
                ...prev,
                name: member?.member_name || '',
                age: member?.member_birth ? calculateAge(member.member_birth) : '',
                gender: member?.member_gender || '',
                height: body?.body_height || '',
                weight: body?.body_weight || '',
                // disease: member?.member_disease || '',
                purpose: member?.member_purpose || '',
                bmi: body?.body_bmi || '',
                fat: body?.body_fat || '',
                fat_percentage: body?.body_fat_percentage || '',
                skeletal_muscle: body?.body_skeletal_muscle || '',
            }));
        }
    }, [memberData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 체크박스 핸들러 추가
    const handleCheckboxChange = (bodyPart) => {
        setFormData(prev => ({
            ...prev,
            disease: prev.disease.includes(bodyPart)
                ? prev.disease.filter(item => item !== bodyPart)
                : [...prev.disease, bodyPart]
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // 필수 입력 검증
        if (!formData.name || !formData.age || !formData.gender) {
            alert('기본 정보를 모두 입력해주세요.');
            return;
        }
        
        if (formData.age < 1 || formData.age > 120) {
            alert('올바른 나이를 입력해주세요.');
            return;
        }

        // 부위 체크박스 파싱 "허리, 손목..."
        const parsedDisease = formData.disease.join(', ');
        setFormData(prev => ({
            ...prev,
            disease: parsedDisease
        }));
        
        console.log('전송할 폼 데이터:', formData);
        
        onGenerate(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <InfoMessage>
                <strong>💡 안내:</strong> 기본 정보는 회원가입 시 입력한 정보가 자동으로 불러와집니다. 
                누락된 정보나 변경사항이 있다면 직접 입력해주세요. 
                더 정확한 정보를 입력할수록 맞춤형 루틴을 제공받을 수 있습니다.
            </InfoMessage>

            <InputContainer>
                <SectionTitle>👤 기본 정보</SectionTitle>
                <InputGrid>
                    <InputGroup>
                        <InputLabel required>나이</InputLabel>
                        <InputField
                            name="age"
                            type="number"
                            min="1"
                            max="120"
                            value={formData.age}
                            onChange={handleInputChange}
                            placeholder="나이를 입력하세요"
                            required
                        />
                    </InputGroup>
                    <InputGroup>
                        <InputLabel required>성별</InputLabel>
                        <SelectField
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">선택하세요</option>
                            <option value="남자">남자</option>
                            <option value="여자">여자</option>
                        </SelectField>
                    </InputGroup>
                    <InputGroup>
                        <InputLabel required>키 (cm)</InputLabel>
                        <InputField
                            name="height"
                            type="number"
                            min="100"
                            max="250"
                            value={formData.height}
                            onChange={handleInputChange}
                            placeholder="키를 입력하세요"
                            required
                        />
                    </InputGroup>
                    <InputGroup>
                        <InputLabel required>몸무게 (kg)</InputLabel>
                        <InputField
                            name="weight"
                            type="number"
                            min="30"
                            max="300"
                            value={formData.weight}
                            onChange={handleInputChange}
                            placeholder="몸무게를 입력하세요"
                            required
                        />
                    </InputGroup>
                    <InputGroup>
                        <InputLabel>체지방량 (kg)</InputLabel>
                        <InputField
                            name="fat"
                            type="number"
                            min="5"
                            max="300"
                            value={formData.fat}
                            onChange={handleInputChange}
                            placeholder="체지방량을 입력하세요"
                        />
                    </InputGroup>
                    <InputGroup>
                        <InputLabel>체지방률 (%)</InputLabel>
                        <InputField
                            name="fat_percentage"
                            type="number"
                            min="1"
                            max="100"
                            value={formData.fat_percentage}
                            onChange={handleInputChange}
                            placeholder="체지방률을 입력하세요"
                        />
                    </InputGroup>
                    <InputGroup>
                        <InputLabel>골격근량 (kg)</InputLabel>
                        <InputField
                            name="skeletal_muscle"
                            type="number"
                            min="1"
                            max="100"
                            value={formData.skeletal_muscle}
                            onChange={handleInputChange}
                            placeholder="골격근량을 입력하세요"
                        />
                    </InputGroup>
                </InputGrid>
                <InputGroup>
                    <InputLabel>불편한 신체 부위</InputLabel>
                    <CheckboxGroup>
                        {bodyParts.map((bodyPart) => (
                            <CheckboxItem key={bodyPart}>
                                <CheckboxInput
                                    type="checkbox"
                                    checked={formData.disease.includes(bodyPart)}
                                    onChange={() => handleCheckboxChange(bodyPart)}
                                />
                                {bodyPart}
                            </CheckboxItem>
                        ))}
                    </CheckboxGroup>
                </InputGroup>
            </InputContainer>

            <InputContainer>
                <SectionTitle>🎯 운동 목표</SectionTitle>
                <InputGrid>
                    <InputGroup>
                        <InputLabel>운동 목적</InputLabel>
                        <SelectField
                            name="purpose"
                            value={formData.purpose}
                            onChange={handleInputChange}>
                            <option value="">선택하세요</option>
                            <option value="체중 관리">체중 관리</option>
                            <option value="근육 증가">근육 증가</option>
                            <option value="체형 교정">체형 교정</option>
                            <option value="체력 증진">체력 증진</option>
                            <option value="재활">재활</option>
                            <option value="바디 프로필">바디 프로필</option>
                        </SelectField>
                    </InputGroup>
                    <InputGroup>
                        <InputLabel>분할 수</InputLabel>
                        <SelectField
                            name="split"
                            value={formData.split}
                            onChange={handleInputChange}
                        >
                            <option value="2">2분할</option>
                            <option value="3">3분할</option>
                            <option value="4">4분할</option>
                            <option value="5">5분할</option>
                        </SelectField>
                    </InputGroup>
                </InputGrid>
            </InputContainer>
            <div style={{ textAlign: 'center' }}>
                <GenerateButton type="submit">
                    🚀 AI 루틴 생성하기
                </GenerateButton>
            </div>
        </form>
    );
};

export default StepInputInfo;