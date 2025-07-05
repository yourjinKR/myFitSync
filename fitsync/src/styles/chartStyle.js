// styles.js
import styled from 'styled-components';

export const Container = styled.div`
  padding: 1.5rem;
  background-color: #f9fafb;
  min-height: 100vh;
  width 100%;
`;

export const Inner = styled.div`
  max-width: 1120px;
  margin: 0 auto;
`;

export const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 1rem;
`;

export const Button = styled.button`
  background-color: #2563eb;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  &:hover {
    background-color: #1d4ed8;
  }
  &:disabled {
    opacity: 0.5;
  }
`;

export const Select = styled.select`
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
`;

export const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
`;

export const StatTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
`;

export const StatValue = styled.p`
  font-size: 1.875rem;
  font-weight: bold;
  color: ${props => props.color || '#111827'};
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

export const Th = styled.th`
  padding: 0.75rem 1.5rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  background-color: #f9fafb;
`;

export const Td = styled.td`
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  color: #111827;
  white-space: nowrap;
`;

export const StatusTag = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;

  background-color: ${props =>
    props.status === 'success'
      ? '#d1fae5' // 연두색
      : props.status === 'exception'
      ? '#fef9c3' // 연노랑
      : '#fee2e2'}; // 연분홍 (error)

  color: ${props =>
    props.status === 'success'
      ? '#065f46' // 진녹
      : props.status === 'exception'
      ? '#92400e' // 진갈색/주황
      : '#991b1b'}; // 진빨강
`;


export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
`;

export const ModalContent = styled.div`
  background: white;
  border-radius: 0.75rem;
  max-width: 64rem;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 1.5rem;
`;

export const Section = styled.div`
  margin-bottom: 1rem;
`;

export const SectionTitle = styled.h4`
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.5rem;
`;

export const SectionContent = styled.div`
  background-color: #f3f4f6;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
`;

export const RoutineCard = styled.div`
  background-color: #eff6ff;
  padding: 0.75rem;
  border-radius: 0.5rem;
`;

export const Exercise = styled.li`
  font-size: 0.875rem;
  color: #374151;
`;

// AdminApiContainer용 추가 컴포넌트들
export const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
`;

export const AutoRefreshContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const AutoRefreshLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #374151;
  font-weight: 500;
  
  input {
    transform: scale(1.1);
  }
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

export const TabContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
  overflow-x: auto;
  
  @media (max-width: 768px) {
    gap: 0.25rem;
  }
`;

export const TabButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  background: ${props => props.active ? '#4f46e5' : 'transparent'};
  color: ${props => props.active ? 'white' : '#6b7280'};
  border-radius: 0.5rem 0.5rem 0 0;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: ${props => props.active ? '600' : '400'};
  transition: all 0.2s;
  white-space: nowrap;
  
  &:hover {
    background: ${props => props.active ? '#4338ca' : '#f3f4f6'};
    color: ${props => props.active ? 'white' : '#374151'};
  }
  
  @media (max-width: 768px) {
    padding: 1rem 1.25rem;
    font-size: 0.85rem;
  }
`;

export const FilterContainer = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    padding: 1.25rem;
  }
`;

export const FilterTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #374151;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

export const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

export const FilterLabel = styled.label`
  display: block;
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
  font-weight: 500;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: white;
  color: #374151;
  
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem;
    font-size: 0.9rem;
  }
`;

export const CurrentFiltersContainer = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-bottom: 1.5rem;
  border: 1px solid #e5e7eb;
  
  @media (max-width: 768px) {
    padding: 1.25rem;
    margin-bottom: 1.25rem;
  }
`;

export const CurrentFiltersTitle = styled.h4`
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 1rem;
  }
`;

export const FilterTagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    gap: 0.75rem;
  }
`;

export const FilterTag = styled.span`
  padding: 0.25rem 0.75rem;
  background-color: ${props => props.bgColor || '#dbeafe'};
  color: ${props => props.textColor || '#1e40af'};
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    padding: 0.375rem 0.875rem;
    font-size: 0.8rem;
  }
`;

export const ClearFiltersButton = styled.button`
  padding: 0.25rem 0.75rem;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #e5e7eb;
    color: #1f2937;
  }
  
  @media (max-width: 768px) {
    padding: 0.375rem 0.875rem;
    font-size: 0.8rem;
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
`;

export const ChartContainer = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  
  @media (max-width: 768px) {
    padding: 1.25rem;
  }
`;

export const ChartTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
  }
`;

export const ChartWrapper = styled.div`
  height: 300px;
  position: relative;
  
  @media (max-width: 768px) {
    height: 250px;
  }
`;

export const ChartDescription = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
  margin-top: 1rem;
  background: #f9fafb;
  padding: 0.5rem;
  border-radius: 0.375rem;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 0.75rem;
  }
`;

export const PerformanceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }
`;

// 상세 모달 관련 컴포넌트들
export const DetailModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0 0 1rem 0;
  border-bottom: 1px solid #e5e7eb;
`;

export const DetailModalTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #111827;
`;

export const DetailModalSubtitle = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;

export const DetailModalCloseButton = styled.button`
  color: #6b7280;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s;
  
  &:hover {
    color: #374151;
  }
`;

export const NavigationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1rem;
  }
`;

export const NavigationButton = styled.button`
  font-size: 1rem;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 0.375rem;
  cursor: pointer;
  opacity: ${props => props.disabled ? 0.5 : 1};
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: #f3f4f6;
    border-color: #9ca3af;
  }
  
  &:disabled {
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem 1.25rem;
  }
`;

export const NavigationInfo = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
  
  @media (max-width: 768px) {
    order: -1;
  }
`;

export const FilteredResultInfo = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.25rem;
`;

export const MetaInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.75rem;
    padding: 0.75rem;
  }
`;

export const MetaInfoItem = styled.div`
  display: flex;
  flex-direction: column;
`;

export const MetaInfoLabel = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
  font-weight: 500;
  
  @media (max-width: 768px) {
    font-size: 0.7rem;
  }
`;

export const MetaInfoValue = styled.div`
  font-weight: 600;
  color: ${props => props.color || '#111827'};
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

export const MetaInfoSubValue = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.125rem;
  
  @media (max-width: 768px) {
    font-size: 0.7rem;
  }
`;

export const FeedbackContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const FeedbackIcon = styled.span`
  font-size: 1.25rem;
`;

export const FeedbackText = styled.span`
  font-weight: 600;
`;

export const FeedbackReason = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;

export const UserRequestContainer = styled.div`
  background: #f8fafc;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  
  @media (max-width: 768px) {
    padding: 0.75rem;
  }
`;

export const UserRequestGrid = styled.div`
  display: grid;
  gap: 0.5rem;
`;

export const UserRequestItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem;
  background: white;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
`;

export const UserRequestKey = styled.strong`
  min-width: 100px;
  color: #374151;
  
  @media (max-width: 768px) {
    min-width: auto;
    font-size: 0.875rem;
  }
`;

export const UserRequestValue = styled.span`
  margin-left: 0.5rem;
  
  @media (max-width: 768px) {
    margin-left: 0;
    font-size: 0.875rem;
  }
`;

export const SplitMatchBadge = styled.span`
  margin-left: 0.5rem;
  padding: 0.125rem 0.5rem;
  background: #10b981;
  color: white;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    margin-left: 0;
    margin-top: 0.25rem;
    font-size: 0.7rem;
  }
`;

export const MonospaceContent = styled.div`
  padding: 1rem;
  font-family: monospace;
  font-size: 0.875rem;
  white-space: pre-wrap;
  background: white;
  border-radius: 0.375rem;
  
  @media (max-width: 768px) {
    padding: 0.75rem;
    font-size: 0.8rem;
  }
`;

export const RoutineContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const RoutineHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

export const RoutineTitle = styled.h5`
  font-weight: 600;
  color: #1e3a8a;
  margin: 0;
  font-size: 1.125rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

export const RoutineBadge = styled.span`
  padding: 0.25rem 0.75rem;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 1rem;
  font-size: 0.875rem;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 0.2rem 0.6rem;
  }
`;

export const ExerciseGrid = styled.div`
  display: grid;
  gap: 0.5rem;
`;

export const ExerciseItem = styled.div`
  color: ${props => props.isValid ? 'inherit' : '#dc2626'};
  padding: 0.75rem;
  background: ${props => props.isValid ? '#f0fdf4' : '#fef2f2'};
  border: 1px solid ${props => props.isValid ? '#bbf7d0' : '#fecaca'};
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem;
  }
`;

export const ExerciseIcon = styled.span`
  font-size: 1.25rem;
  flex-shrink: 0;
`;

export const ExerciseContent = styled.div`
  flex: 1;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const ExerciseName = styled.div`
  font-weight: 600;
  margin-bottom: 0.25rem;
  
  @media (max-width: 768px) {
    margin-bottom: 0.5rem;
  }
`;

export const ExerciseDetails = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

export const SimilarExercise = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

export const InvalidExerciseBadge = styled.span`
  padding: 0.25rem 0.5rem;
  background: #dc2626;
  color: white;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  white-space: nowrap;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    font-size: 0.7rem;
    padding: 0.2rem 0.4rem;
  }
`;

export const ErrorContainer = styled.div`
  padding: 2rem;
  text-align: center;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  color: #dc2626;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    font-size: 0.9rem;
  }
`;

// AItest에서 사용할 수 있는 결과 표시 컴포넌트
export const AIResultContainer = styled.div`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  padding: 1.5rem;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    padding: 1.25rem;
    margin-top: 1.5rem;
  }
`;

export const AIResultHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
`;

export const AIResultTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`;

export const AIResultMeta = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

export const ViewDetailsButton = styled.button`
  background: #2563eb;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.2s;
  
  &:hover {
    background: #1d4ed8;
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem 1.25rem;
    font-size: 0.9rem;
  }
`;
