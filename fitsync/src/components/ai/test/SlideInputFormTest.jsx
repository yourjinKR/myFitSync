import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { calculateAge } from '../../../utils/utilFunc';
import { getMemberTotalData } from '../../../utils/memberUtils';
import { useNavigate } from 'react-router-dom';

// 애니메이션 정의
const slideIn = keyframes`
    from {
        opacity: 0;
        transform: translateX(30px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
`;

const pulse = keyframes`
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
    100% {
        transform: scale(1);
    }
`;

// 메인 컨테이너 - 전체 화면 사용
const FormContainer = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--bg-primary);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 1000;
    max-width: 750px;
    margin: 0 auto;
`;

// 상단 헤더 영역
const TopHeader = styled.div`
    background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-hover));
    padding: 1.5rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
    position: relative;
    
    @media (max-width: 480px) {
        padding: 1.2rem 1.5rem;
    }
`;

const HeaderTitle = styled.h1`
    font-size: 2.2rem;
    font-weight: 800;
    color: white;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    
    @media (max-width: 480px) {
        font-size: 2.2rem;
        gap: 0.5rem;
    }
`;

const CloseButton = styled.button`
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    padding: 0.8rem;
    font-size: 1.4rem;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 48px;
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
    
    &:hover {
        background: rgba(255, 255, 255, 0.3);
        border-color: rgba(255, 255, 255, 0.6);
        transform: scale(1.1) rotate(90deg);
    }
    
    @media (max-width: 480px) {
        font-size: 1.2rem;
        min-width: 44px;
        min-height: 44px;
        padding: 0.6rem;
    }
`;

const HeaderBackButton = styled.button`
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    padding: 0.8rem;
    font-size: 1.4rem;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 48px;
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
    margin-right: 1rem;
    
    &:hover {
        background: rgba(255, 255, 255, 0.3);
        border-color: rgba(255, 255, 255, 0.6);
        transform: scale(1.1) translateX(-3px);
    }
    
    &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
        transform: none;
    }
    
    @media (max-width: 480px) {
        font-size: 1.2rem;
        min-width: 44px;
        min-height: 44px;
        padding: 0.6rem;
        margin-right: 0.8rem;
    }
`;

// 진행 표시기 영역 - 헤더 하단 선형 스타일
const ProgressBar = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    overflow: hidden;
`;

const ProgressFill = styled.div`
    height: 100%;
    background: linear-gradient(90deg, var(--check-green), var(--success));
    width: ${props => ((props.currentSlide + 1) / props.totalSlides) * 100}%;
    transition: width 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    position: relative;
    
    &::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 20px;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3));
        animation: ${pulse} 2s ease-in-out infinite;
    }
`;

// 메인 콘텐츠 영역 - 남은 공간 모두 사용
const MainContent = styled.div`
    flex: 1;
    display: flex;
    overflow: hidden;
    position: relative;
    min-height: 0;
`;

const SlideContainer = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    transform: translateX(${props => props.currentSlide * -100}%);
    transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
`;

const Slide = styled.div`
    min-width: 100%;
    display: flex;
    flex-direction: column;
    padding: 2rem 2rem 6rem 2rem; /* 하단에 네비게이션 공간 확보 */
    overflow-y: auto;
    animation: ${slideIn} 0.6s ease-out;
    
    /* 커스텀 스크롤바 */
    &::-webkit-scrollbar {
        width: 8px;
    }
    
    &::-webkit-scrollbar-track {
        background: var(--bg-secondary);
        border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
        background: var(--primary-blue);
        border-radius: 4px;
    }
    
    @media (max-width: 480px) {
        padding: 1.5rem 1.5rem 5rem 1.5rem;
    }
`;

const SlideTitle = styled.h2`
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--text-primary);
    margin-bottom: 1rem;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    flex-shrink: 0;
    
    @media (max-width: 480px) {
        font-size: 2.8rem;
        gap: 0.5rem;
        margin-bottom: 0.8rem;
    }
`;

const SlideSubtitle = styled.p`
    font-size: 1.3rem;
    color: var(--text-secondary);
    text-align: center;
    margin-bottom: 2.5rem;
    line-height: 1.6;
    flex-shrink: 0;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    
    @media (max-width: 480px) {
        font-size: 2.1rem;
        margin-bottom: 2rem;
    }

    p {
        @media (max-width: 480px) {
        font-size: 1.5rem;
        }
    }
`;

// 입력 영역
const InputArea = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    max-width: 700px;
    margin: 0 auto;
    width: 100%;
    min-height: 0;
    
    @media (max-width: 480px) {
        gap: 1.5rem;
    }
`;

const InputGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    flex-shrink: 0;
`;

const InputLabel = styled.label`
    font-size: 2.4rem;
    font-weight: 700;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 0.8rem;
    
    &::after {
        content: ${props => props.required ? '" *"' : '""'};
        color: var(--warning);
        font-weight: 800;
        font-size: 1.2rem;
    }
    
    @media (max-width: 480px) {
        font-size: 2.2rem;
        gap: 0.6rem;
    }
`;

const InputField = styled.input`
    background: var(--bg-secondary);
    border: 3px solid var(--border-light);
    color: var(--text-primary);
    border-radius: 16px;
    padding: 1.5rem 1.2rem;
    font-size: 2.2rem;
    transition: all 0.3s ease;
    font-weight: 500;
    
    &:focus {
        border-color: var(--primary-blue);
        outline: none;
        transform: translateY(-2px);
        background: var(--bg-tertiary);
    }
    
    &::placeholder {
        color: var(--text-tertiary);
        font-size: 1.1rem;
        font-weight: 400;
    }
    
    @media (max-width: 480px) {
        padding: 1.3rem 1rem;
        font-size: 2.1rem;
    }
`;

const SelectField = styled.select`
    background: var(--bg-secondary);
    border: 3px solid var(--border-light);
    color: var(--text-primary);
    border-radius: 16px;
    padding: 1.5rem 1.2rem;
    font-size: 2.2rem;
    transition: all 0.3s ease;
    cursor: pointer;
    font-weight: 500;
    
    &:focus {
        border-color: var(--primary-blue);
        outline: none;
        transform: translateY(-2px);
        background: var(--bg-tertiary);
    }
    
    option {
        background: var(--bg-secondary);
        color: var(--text-primary);
        padding: 1rem;
        font-weight: 500;
    }
    
    @media (max-width: 480px) {
        padding: 1.3rem 1rem;
        font-size: 2.1rem;
    }
`;

// 체크박스 그룹
const CheckboxGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 1.2rem;
    
    @media (max-width: 480px) {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    }
`;

const CheckboxCard = styled.label`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.2rem;
    background: var(--bg-secondary);
    border: 3px solid var(--border-light);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 2.1rem;
    font-weight: 600;
    
    &:hover {
        background: var(--bg-tertiary);
        border-color: var(--primary-blue-light);
        transform: translateY(-2px);
    }
    
    &:has(input:checked) {
        background: var(--primary-blue-light);
        border-color: var(--primary-blue);
        color: var(--text-primary);
        transform: translateY(-2px);
    }
    
    @media (max-width: 480px) {
        padding: 1rem;
        font-size: 1rem;
        gap: 0.8rem;
    }
`;

const CheckboxInput = styled.input`
    width: 22px;
    height: 22px;
    margin: 0;
    accent-color: var(--primary-blue);
    cursor: pointer;
    
    @media (max-width: 480px) {
        width: 20px;
        height: 20px;
    }
`;

// 하단 네비게이션 영역 - 고정 위치 (다음 버튼만)
const BottomNavigation = styled.div`
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 750px;
    backdrop-filter: blur(20px);
    padding: 1.2rem 2rem;
    display: flex;
    justify-content: center;
    z-index: 1001;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(74, 144, 226, 0.3), transparent);
    }
    
    @media (max-width: 480px) {
        padding: 1rem 1.5rem;
    }
`;

const NavButton = styled.button`
    padding: 1rem 2rem;
    font-size: 1.7rem;
    font-weight: 600;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 48px;
    width: 100%;
    position: relative;
    overflow: hidden;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.6s;
    }
    
    &:hover::before {
        left: 100%;
    }
    
    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        transform: none;
        
        &::before {
            display: none;
        }
    }
    
    &:active:not(:disabled) {
        transform: scale(0.98);
    }
    
    @media (max-width: 480px) {
        padding: 0.8rem 1.5rem;
        font-size: 2rem;
        min-height: 44px;
        gap: 0.4rem;
    }
`;

const NextButton = styled(NavButton)`
    background: linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-hover) 100%);
    color: white;
    box-shadow: 0 4px 16px rgba(74, 144, 226, 0.3);
    font-weight: 700;
    
    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);
    }
`;

const SubmitButton = styled(NavButton)`
    background: linear-gradient(135deg, var(--check-green) 0%, var(--success) 100%);
    color: white;
    box-shadow: 0 4px 16px rgba(76, 175, 80, 0.3);
    font-weight: 700;
    
    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
    }
`;

// Welcome 화면 전용
const WelcomeCenter = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 3rem;
    
    @media (max-width: 480px) {
        gap: 2rem;
    }
`;

const WelcomeIcon = styled.div`
    font-size: 6rem !important; /* !important로 글로벌 스타일 오버라이드 */
    animation: ${pulse} 3s ease-in-out infinite;
    line-height: 1;
    
    /* 모바일에서도 큰 크기 유지 */
    @media (max-width: 750px) {
        font-size: 5rem !important; /* 모바일에서도 충분히 큰 크기 */
    }
    
    @media (max-width: 480px) {
        font-size: 4.5rem !important; /* 작은 모바일에서도 적당히 큰 크기 */
    }
    
    @media (max-width: 320px) {
        font-size: 4rem !important; /* 매우 작은 화면에서 최소 크기 */
    }
`;

const WelcomeMessage = styled.div`
    background: linear-gradient(135deg, var(--primary-blue-light), var(--primary-blue));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-size: 1.5rem;
    font-weight: 600;
    line-height: 1.8;
    
    @media (max-width: 480px) {
        font-size: 1.3rem;
    }
`;

// 슬라이드 컴포넌트들
const WelcomeSlide = ({ onNext }) => (
    <Slide>
        <SlideTitle>🎯 맞춤형 운동 루틴</SlideTitle>
        <SlideSubtitle>
            AI가 당신만의 특별한 운동 루틴을 만들어드려요!
        </SlideSubtitle>
        
        <WelcomeCenter>
            <WelcomeIcon>🤖💪</WelcomeIcon>
            <WelcomeMessage>
                몇 가지 간단한 정보만 입력하면<br/>
                개인 맞춤형 운동 계획을 받을 수 있어요!
            </WelcomeMessage>
        </WelcomeCenter>
    </Slide>
);

const BasicInfoSlide = ({ formData, setFormData }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Slide>
            <SlideTitle>👤 기본 정보</SlideTitle>
            <SlideSubtitle>
                정확한 루틴 생성을 위해 기본 정보를 알려주세요
            </SlideSubtitle>
            
            <InputArea>
                <InputGroup>
                    <InputLabel required>🎂 나이</InputLabel>
                    <InputField
                        name="age"
                        type="number"
                        min="1"
                        max="120"
                        value={formData.age}
                        onChange={handleChange}
                        placeholder="나이를 입력하세요"
                    />
                </InputGroup>
                
                <InputGroup>
                    <InputLabel required>⚧ 성별</InputLabel>
                    <SelectField
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                    >
                        <option value="">선택하세요</option>
                        <option value="남자">남자</option>
                        <option value="여자">여자</option>
                    </SelectField>
                </InputGroup>
                
                <InputGroup>
                    <InputLabel required>📏 키 (cm)</InputLabel>
                    <InputField
                        name="height"
                        type="number"
                        min="100"
                        max="250"
                        value={formData.height}
                        onChange={handleChange}
                        placeholder="키를 입력하세요"
                    />
                </InputGroup>
                
                <InputGroup>
                    <InputLabel required>⚖️ 몸무게 (kg)</InputLabel>
                    <InputField
                        name="weight"
                        type="number"
                        min="30"
                        max="300"
                        value={formData.weight}
                        onChange={handleChange}
                        placeholder="몸무게를 입력하세요"
                    />
                </InputGroup>
            </InputArea>
        </Slide>
    );
};

const BodyCompositionSlide = ({ formData, setFormData }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Slide>
            <SlideTitle>📊 체성분 정보</SlideTitle>
            <SlideSubtitle>
                체성분 정보를 알고 계시면 더 정확한 루틴을 제공할 수 있어요<br/>
                <span style={{ fontSize: '1.1rem', opacity: 0.8, fontWeight: '600' }}>(선택사항)</span>
            </SlideSubtitle>
            
            <InputArea>
                <InputGroup>
                    <InputLabel>🧈 체지방량 (kg)</InputLabel>
                    <InputField
                        name="fat"
                        type="number"
                        min="5"
                        max="300"
                        value={formData.fat}
                        onChange={handleChange}
                        placeholder="체지방량을 입력하세요"
                    />
                </InputGroup>
                
                <InputGroup>
                    <InputLabel>📈 체지방률 (%)</InputLabel>
                    <InputField
                        name="fat_percentage"
                        type="number"
                        min="1"
                        max="100"
                        value={formData.fat_percentage}
                        onChange={handleChange}
                        placeholder="체지방률을 입력하세요"
                    />
                </InputGroup>
                
                <InputGroup>
                    <InputLabel>💪 골격근량 (kg)</InputLabel>
                    <InputField
                        name="skeletal_muscle"
                        type="number"
                        min="1"
                        max="100"
                        value={formData.skeletal_muscle}
                        onChange={handleChange}
                        placeholder="골격근량을 입력하세요"
                    />
                </InputGroup>
            </InputArea>
        </Slide>
    );
};

const HealthConditionSlide = ({ formData, setFormData }) => {
    const bodyParts = ['손목', '팔꿈치', '어깨', '목', '허리', '골반', '발목', '무릎'];
    
    const handleCheckboxChange = (bodyPart) => {
        setFormData(prev => ({
            ...prev,
            disease: prev.disease.includes(bodyPart)
                ? prev.disease.filter(item => item !== bodyPart)
                : [...prev.disease, bodyPart]
        }));
    };

    return (
        <Slide>
            <SlideTitle>🏥 건강 상태</SlideTitle>
            <SlideSubtitle>
                불편한 신체 부위가 있다면 알려주세요<br/>
                해당 부위를 피한 안전한 루틴을 만들어드려요
            </SlideSubtitle>
            
            <InputArea>
                <InputGroup>
                    <InputLabel>🩹 불편한 신체 부위</InputLabel>
                    <CheckboxGrid>
                        {bodyParts.map((bodyPart) => (
                            <CheckboxCard key={bodyPart}>
                                <CheckboxInput
                                    type="checkbox"
                                    checked={formData.disease.includes(bodyPart)}
                                    onChange={() => handleCheckboxChange(bodyPart)}
                                />
                                {bodyPart}
                            </CheckboxCard>
                        ))}
                    </CheckboxGrid>
                </InputGroup>
            </InputArea>
        </Slide>
    );
};

const GoalsSlide = ({ formData, setFormData }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Slide>
            <SlideTitle>🎯 운동 목표</SlideTitle>
            <SlideSubtitle>
                어떤 목표로 운동하시나요?<br/>
                목표에 맞는 최적의 루틴을 추천해드려요
            </SlideSubtitle>
            
            <InputArea>
                <InputGroup>
                    <InputLabel>🏃 운동 목적</InputLabel>
                    <SelectField
                        name="purpose"
                        value={formData.purpose}
                        onChange={handleChange}
                    >
                        <option value="">선택하세요</option>
                        <option value="체중 관리">🔥 체중 관리</option>
                        <option value="근육 증가">💪 근육 증가</option>
                        <option value="체형 교정">📐 체형 교정</option>
                        <option value="체력 증진">⚡ 체력 증진</option>
                        <option value="재활">🏥 재활</option>
                        <option value="바디 프로필">📸 바디 프로필</option>
                    </SelectField>
                </InputGroup>
                
                <InputGroup>
                    <InputLabel>🗓️ 분할 루틴</InputLabel>
                    <SelectField
                        name="split"
                        value={formData.split}
                        onChange={handleChange}
                    >
                        <option value="2">2분할 (주 2회)</option>
                        <option value="3">3분할 (주 3회)</option>
                        <option value="4">4분할 (주 4회)</option>
                        <option value="5">5분할 (주 5회)</option>
                    </SelectField>
                </InputGroup>
            </InputArea>
        </Slide>
    );
};

const SlideInputFormTest = () => {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: '',
        height: '',
        weight: '',
        disease: [],
        purpose: '',
        bmi: '',
        fat: '',
        fat_percentage: '',
        skeletal_muscle: '',
        split: 4,
    });

    // 멤버 데이터 로드
    useEffect(() => {
        const fetchMemberData = async () => {
            try {
                const data = await getMemberTotalData();
                
                if (data) {
                    const { member, body } = data;
                    setFormData(prev => ({
                        ...prev,
                        name: member?.member_name || '',
                        age: member?.member_birth ? calculateAge(member.member_birth) : '',
                        gender: member?.member_gender || '',
                        height: body?.body_height || '',
                        weight: body?.body_weight || '',
                        purpose: member?.member_purpose || '',
                        bmi: body?.body_bmi || '',
                        fat: body?.body_fat || '',
                        fat_percentage: body?.body_fat_percentage || '',
                        skeletal_muscle: body?.body_skeletal_muscle || '',
                        split: member?.member_split || 4,
                    }));
                }
            } catch (error) {
                console.error('멤버 데이터 로드 실패:', error);
            }
        };
        
        fetchMemberData();
    }, []);

    const slides = [
        { component: WelcomeSlide, title: "시작", subtitle: "AI 루틴 생성을 시작해보세요" },
        { component: BodyCompositionSlide, title: "체성분", subtitle: "체성분 정보로 더 정확한 분석을 해드려요" },
        { component: HealthConditionSlide, title: "건강 상태", subtitle: "불편한 부위를 알려주시면 안전한 루틴을 제공해요" },
        { component: GoalsSlide, title: "운동 목표", subtitle: "목표에 맞는 최적의 루틴을 추천해드려요" }
    ];

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(current => current + 1);
        }
    };

    const handleBack = () => {
        if (currentSlide > 0) {
            setCurrentSlide(current => current - 1);
        }
    };

    const handleClose = () => {
        navigate('/ai');
    };

    const handleGenerate = () => {
        if (!formData.age || !formData.gender || !formData.height || !formData.weight) {
            alert('필수 정보를 모두 입력해주세요.');
            return;
        }
        
        const finalFormData = {
            ...formData,
            disease: formData.disease.join(', ')
        };
        
        console.log('생성할 데이터:', finalFormData);
        // 실제 AI 생성 로직으로 이동
        navigate('/ai/test/result', { state: { formData: finalFormData } });
    };

    const isFormValid = formData.age && formData.gender && formData.height && formData.weight;

    const getButtonConfig = () => {
        switch (currentSlide) {
            case 0:
                return {
                    type: 'next',
                    text: '시작하기 🚀',
                    disabled: false
                };
            case slides.length - 1:
                return {
                    type: 'submit',
                    text: '루틴 생성하기 🚀',
                    disabled: false
                };
            default:
                return {
                    type: 'next',
                    text: '다음 →',
                    disabled: currentSlide === 1 && !isFormValid
                };
        }
    };

    const handleButtonClick = () => {
        const config = getButtonConfig();
        if (config.type === 'submit') {
            handleGenerate();
        } else {
            handleNext();
        }
    };

    const renderSlide = () => {
        const SlideComponent = slides[currentSlide].component;
        
        const commonProps = {
            formData,
            setFormData
        };

        return <SlideComponent {...commonProps} />;
    };

    const buttonConfig = getButtonConfig();

    return (
        <FormContainer>
            <TopHeader>
                {currentSlide > 0 && (
                    <HeaderBackButton onClick={handleBack}>
                        ←
                    </HeaderBackButton>
                )}
                <HeaderTitle>AI 루틴 생성</HeaderTitle>
                <CloseButton onClick={handleClose}>✕</CloseButton>
                <ProgressBar>
                    <ProgressFill currentSlide={currentSlide} totalSlides={slides.length} />
                </ProgressBar>
            </TopHeader>
            
            <MainContent>
                <SlideContainer currentSlide={0}>
                    {renderSlide()}
                </SlideContainer>
            </MainContent>
            
            <BottomNavigation>
                {buttonConfig.type === 'submit' ? (
                    <SubmitButton onClick={handleButtonClick} disabled={buttonConfig.disabled}>
                        {buttonConfig.text}
                    </SubmitButton>
                ) : (
                    <NextButton onClick={handleButtonClick} disabled={buttonConfig.disabled}>
                        {buttonConfig.text}
                    </NextButton>
                )}
            </BottomNavigation>
        </FormContainer>
    );
};

export default SlideInputFormTest;