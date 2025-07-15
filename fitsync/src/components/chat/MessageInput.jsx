import React, { useState, useRef } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border-medium);
  padding: 15px 20px;
`;

// 선택된 이미지 파일의 정보와 미리보기를 표시
const FilePreview = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: var(--bg-tertiary);
  border-radius: 8px;
  margin-bottom: 10px;
  border: 1px solid var(--border-light);
`;

const PreviewImage = styled.img`
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 10px;
`;

const FileInfo = styled.div`
  flex: 1;
`;

const FileName = styled.div`
  font-size: 1.3rem;
  font-weight: 500;
  color: var(--text-primary);
`;

const FileSize = styled.div`
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-top: 2px;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 1.6rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s;
  
  &:hover {
    color: var(--text-secondary);
    background-color: var(--bg-primary);
  }
`;

// 첨부 버튼과 텍스트 입력창의 영역 가로배치
const InputContainer = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 10px;
`;

const AttachButton = styled.button`
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-medium);
  border-radius: 20px;
  padding: 8px 10px;
  cursor: pointer;
  font-size: 1.6rem;
  color: var(--text-primary);
  transition: all 0.2s;
  transform: translateY(-1.5px);
  
  &:hover {
    background-color: var(--bg-tertiary);
    border-color: var(--primary-blue);
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// 텍스트 입력창 상대적 위치 설정으로 내부에 전송 버튼 배치
const TextAreaContainer = styled.div`
  flex: 1;
  position: relative;
`;

// 메시지 입력창 자동 높이 조절 및 최대 높이 제한
const MessageTextArea = styled.textarea`
  width: 100%;
  border: 1px solid var(--border-medium);
  border-radius: 20px;
  padding: 10px 45px 10px 15px;
  resize: none;
  min-height: 20px;
  max-height: 100px;
  font-family: inherit;
  font-size: 1.4rem;
  line-height: 1.4;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
  overflow: hidden !important;
  max-height: 105px; 
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  
  &:focus {
    border-color: var(--primary-blue);
  }
  
  &::placeholder {
    color: var(--text-tertiary);
  }
`;

// 전송 버튼 내부 우측에 위치
const SendButton = styled.button`
  position: absolute;
  right: 8px;
  bottom: 8px;
  background: none;
  border: none;
  color: var(--primary-blue);
  font-size: 2rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s;
  
  &:disabled {
    color: var(--text-tertiary);
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    color: var(--primary-blue-hover);
  }
`;

// 실제 파일 선택 입력 숨김처리
const HiddenFileInput = styled.input`
  display: none;
`;

// 메시지 입력 컴포넌트
const MessageInput = ({ onSendMessage, disabled }) => {
  // 상태 관리
  const [messageText, setMessageText] = useState(''); // 입력 중인 텍스트
  const [selectedFile, setSelectedFile] = useState(null); // 선택된 파일
  const [previewUrl, setPreviewUrl] = useState(null); // 파일 미리보기 URL
  
  // ref 관리
  const fileInputRef = useRef(null); // 파일 입력 요소 참조
  const textAreaRef = useRef(null); // 텍스트에어리어 참조

  // 텍스트 또는 파일이 있을 때 전송 처리
  const handleSend = () => {
    // 전송할 내용이 없으면 리턴
    if (!messageText.trim() && !selectedFile) return;

    if (selectedFile) {
      // 파일이 선택된 경우 이미지 메시지로 전송
      console.log('이미지 메시지 전송:', selectedFile.name);
      onSendMessage('[이미지]', 'image', selectedFile);
      
      // 파일 선택 상태 초기화
      setSelectedFile(null);
      setPreviewUrl(null);
    } else {
      // 텍스트 메시지 전송
      console.log('텍스트 메시지 전송:', messageText.trim());
      onSendMessage(messageText.trim());
    }
    
    // 입력창 초기화
    setMessageText('');
    
    // 텍스트에어리어 높이 초기화
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
    }
  };

  // 키보드 입력 핸들러
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // 기본 줄바꿈 동작 방지
      handleSend();
    }
  };

  // 텍스트 변경 핸들러
  const handleTextChange = (e) => {
    setMessageText(e.target.value);
    
    // 자동 높이 조절
    const textArea = e.target;
    textArea.style.height = 'auto';
    textArea.style.height = textArea.scrollHeight + 'px';
  };

  // 파일 선택 핸들러(유효성 검사 및 미리보기)
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log('파일 선택됨:', file.name, file.size, file.type);

    // 파일 크기 체크 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB를 초과할 수 없습니다.');
      return;
    }

    // 이미지 파일만 허용
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    setSelectedFile(file);
    
    // FileReader를 사용하여 미리보기 URL 생성
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
      console.log('미리보기 생성 완료');
    };
    reader.readAsDataURL(file);
  };

  // 선택된 파일 제거(미리보기 초기화)
  const removeSelectedFile = () => {
    console.log('선택된 파일 제거');
    setSelectedFile(null);
    setPreviewUrl(null);
    
    // 파일 입력 요소 값 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 파일 크기를 읽기 쉬운 형태로 포맷
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Container>
      {/* 파일 미리보기 영역 (파일이 선택된 경우에만 표시) */}
      {selectedFile && (
        <FilePreview>
          <PreviewImage src={previewUrl} alt="미리보기" />
          <FileInfo>
            <FileName>{selectedFile.name}</FileName>
            <FileSize>{formatFileSize(selectedFile.size)}</FileSize>
          </FileInfo>
          <RemoveButton onClick={removeSelectedFile} title="선택된 파일 제거">
            ×
          </RemoveButton>
        </FilePreview>
      )}

      {/* 메시지 입력 영역 */}
      <InputContainer>
        {/* 파일 첨부 버튼 */}
        <AttachButton onClick={() => fileInputRef.current?.click()} disabled={disabled} title="이미지 첨부">
          📎
        </AttachButton>

        {/* 숨겨진 파일 입력 요소 */}
        <HiddenFileInput
          ref={fileInputRef}
          type="file"
          accept="image/*" // 이미지 파일만 허용
          onChange={handleFileSelect}
        />

        {/* 텍스트 입력 영역 */}
        <TextAreaContainer>
          <MessageTextArea
            ref={textAreaRef}
            value={messageText}
            onChange={handleTextChange}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요..."
            disabled={disabled}
            rows={1}
          />
          
          {/* 전송 버튼 */}
          <SendButton onClick={handleSend} disabled={disabled || (!messageText.trim() && !selectedFile)} title="전송 (Enter)">
            ➤
          </SendButton>
        </TextAreaContainer>
      </InputContainer>
    </Container>
  );
};

export default MessageInput;