import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

// 모달 크기 고정: 이미지 크기와 상관없이 일정한 크기 유지
const ModalContent = styled.div`
  background: var(--bg-secondary);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  animation: scaleIn 0.2s ease;
  
  /* 고정 크기 설정 */
  width: 500px;
  height: 600px;
  
  @keyframes scaleIn {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  
  /* 모바일 반응형 */
  @media (max-width: 768px) {
    width: 90vw;
    height: 70vh;
    max-width: 450px;
    max-height: 550px;
  }
  
  @media (max-width: 480px) {
    width: 95vw;
    height: 65vh;
    max-width: 400px;
    max-height: 500px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-tertiary);
  flex-shrink: 0;
`;

const ModalTitle = styled.h2`
  font-size: 1.6rem;
  color: var(--text-primary);
  margin: 0;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 350px;
  
  @media (max-width: 480px) {
    font-size: 1.4rem;
    max-width: 250px;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  
  &:hover {
    color: var(--text-primary);
    background: var(--bg-primary);
    transform: scale(1.1);
  }
  
  &:focus {
    outline: 2px solid var(--primary-blue);
    outline-offset: 2px;
  }
`;

// 이미지 컨테이너 크기 고정 및 중앙 정렬
const ImageContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #000;
  position: relative;
  
  /* 고정 높이 설정하여 일관된 크기 유지 */
  min-height: 400px;
  max-height: 400px;
  
  @media (max-width: 768px) {
    min-height: 300px;
    max-height: 300px;
  }
  
  @media (max-width: 480px) {
    min-height: 250px;
    max-height: 250px;
  }
`;

// 이미지 크기 조정: 컨테이너에 맞게 자동 조정되면서 비율 유지
const StyledImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  user-select: none;
  transform-origin: center;
  will-change: transform;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
`;

const ModalControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-top: 1px solid var(--border-light);
  background: var(--bg-tertiary);
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px;
  }
`;

const ZoomInfo = styled.div`
  font-size: 1.4rem;
  color: var(--text-secondary);
  font-weight: 500;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const ControlButtons = styled.div`
  display: flex;
  gap: 8px;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const ZoomButton = styled.button`
  background: var(--bg-secondary);
  border: 1px solid var(--border-medium);
  color: var(--text-primary);
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.4rem;
  min-height: 44px;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: var(--bg-primary);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:focus {
    outline: 2px solid var(--primary-blue);
    outline-offset: 2px;
  }
`;

const DownloadButton = styled.button`
  background: var(--primary-blue);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.4rem;
  font-weight: 500;
  min-height: 44px;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--primary-blue-hover);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
  }
  
  &:focus {
    outline: 2px solid var(--primary-blue-light);
    outline-offset: 2px;
  }
`;

// 이미지 모달 컴포넌트
const ImageModal = ({ isOpen, imageUrl, originalFilename, onClose }) => {
  // 확대/축소 관련 상태
  const [scale, setScale] = useState(1); // 현재 확대 비율 (1 = 100%)
  const [position, setPosition] = useState({ x: 0, y: 0 }); // 이미지 위치 (드래그용)
  const [isDragging, setIsDragging] = useState(false); // 드래그 상태
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 }); // 드래그 시작 위치
  
  const modalRef = useRef(null);
  const imageRef = useRef(null);

  // ESC 키로 모달 닫기 + 접근성 개선
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // 모달 열릴 때 포커스 트랩
      modalRef.current?.focus();
      // 배경 스크롤 방지
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // 모달이 열릴 때마다 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setIsDragging(false);
    }
  }, [isOpen, originalFilename]);

  // 마우스 휠로 확대/축소 기능 - 이미지 중심점을 기준으로 확대/축소
  const handleWheel = useCallback((e) => {
    e.preventDefault(); // 기본 스크롤 동작 방지
    
    const delta = e.deltaY > 0 ? -0.1 : 0.1; // 휠 방향에 따른 확대/축소 비율
    const newScale = Math.max(0.1, Math.min(5, scale + delta)); // 최소 10%, 최대 500%로 제한
    
    setScale(newScale);
    
    // 확대/축소 시 이미지가 중앙에서 벗어나지 않도록 위치 조정
    if (newScale === 1) {
      setPosition({ x: 0, y: 0 }); // 100%일 때는 중앙 정렬
    }
  }, [scale]);

  // 마우스 드래그로 이미지 이동 (확대 상태일 때만)
  const handleMouseDown = useCallback((e) => {
    if (scale > 1) { // 확대된 상태에서만 드래그 가능
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  }, [scale, position]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart, scale]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging]);

  // 드래그 이벤트 리스너 등록/해제
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // 원본 파일명으로 다운로드 기능 - Cloudinary URL에서 이미지 데이터를 가져와서 다운로드
  const handleDownload = useCallback(async () => {
    try {
      // 1. Cloudinary URL에서 이미지 데이터 가져오기
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error('이미지를 가져올 수 없습니다.');
      }
      
      const blob = await response.blob();
      
      // 2. Blob URL 생성
      const downloadUrl = URL.createObjectURL(blob);
      
      // 3. 임시 링크 생성하여 다운로드 실행
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = originalFilename || `image_${Date.now()}.jpg`; // 원본 파일명 사용
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      // 4. 임시 요소 정리
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
      
    } catch (error) {
      alert('이미지 다운로드에 실패했습니다.');
    }
  }, [imageUrl, originalFilename]);

  // 확대/축소 버튼 핸들러
  const handleZoomIn = useCallback(() => {
    setScale(Math.min(5, scale + 0.2));
  }, [scale]);

  const handleZoomOut = useCallback(() => {
    const newScale = Math.max(0.1, scale - 0.2);
    setScale(newScale);
    if (newScale === 1) {
      setPosition({ x: 0, y: 0 });
    }
  }, [scale]);

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 닫기 방지
        onWheel={handleWheel} // 마우스 휠 이벤트
      >
        {/* 모달 헤더 */}
        <ModalHeader>
          <ModalTitle id="modal-title">{originalFilename}</ModalTitle>
          <CloseButton
            onClick={onClose}
            aria-label="모달 닫기"
          >
            ✕
          </CloseButton>
        </ModalHeader>

        {/* 고정 크기 이미지 컨테이너 */}
        <ImageContainer>
          <StyledImage
            ref={imageRef}
            src={imageUrl}
            alt={originalFilename || '이미지'}
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
              transition: isDragging ? 'none' : 'transform 0.2s ease'
            }}
            onMouseDown={handleMouseDown}
            onDragStart={(e) => e.preventDefault()} // 기본 드래그 방지
            loading="lazy"
          />
        </ImageContainer>

        {/* 컨트롤 영역 */}
        <ModalControls>
          <ZoomInfo>
            🔍: {Math.round(scale * 100)}%
          </ZoomInfo>
          <ControlButtons>
            <ZoomButton 
              onClick={handleZoomOut}
              disabled={scale <= 0.2}
              aria-label="축소"
            >
              -
            </ZoomButton>
            <ZoomButton 
              onClick={handleZoomIn}
              disabled={scale >= 5}
              aria-label="확대"
            >
              +
            </ZoomButton>
            <DownloadButton 
              onClick={handleDownload}
              aria-label={`${originalFilename} 다운로드`}
            >
              💾
            </DownloadButton>
          </ControlButtons>
        </ModalControls>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ImageModal;