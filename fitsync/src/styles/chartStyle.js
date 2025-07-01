// styles.js
import styled from 'styled-components';

export const Container = styled.div`
  padding: 1.5rem;
  background-color: #f9fafb;
  min-height: 100vh;
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
  background-color: ${props => props.status === 'success' ? '#d1fae5' : '#fee2e2'};
  color: ${props => props.status === 'success' ? '#065f46' : '#991b1b'};
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
