import React, { useState, useRef } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border-medium);
  padding: 15px 20px;
`;

// 다중 파일 미리보기 컨테이너
const MultiFilePreview = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
  max-height: 200px;
  overflow-y: auto;
  
  /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-tertiary);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border-medium);
    border-radius: 2px;
  }
`;

// 선택된 이미지 파일의 정보와 미리보기를 표시
const FilePreview = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: var(--bg-tertiary);
  border-radius: 8px;
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

/* 첨부 버튼 */
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
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  
  &:hover {
    background-color: var(--bg-tertiary);
    border-color: var(--primary-blue);
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    display: block;
    margin: 0;
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

// 다중 파일 업로드 지원하는 메시지 입력 컴포넌트
const MessageInput = ({ onSendMessage, disabled }) => {
  // 상태 관리 - 다중 파일 지원으로 변경
  const [messageText, setMessageText] = useState(''); // 입력 중인 텍스트
  const [selectedFiles, setSelectedFiles] = useState([]); // 선택된 파일들 (배열로 변경)
  const [previewUrls, setPreviewUrls] = useState({}); // 파일 미리보기 URL들 (객체로 변경)
  const [isUploading, setIsUploading] = useState(false); // 업로드 진행 상태 추가
  
  // ref 관리
  const fileInputRef = useRef(null); // 파일 입력 요소 참조
  const textAreaRef = useRef(null); // 텍스트에어리어 참조

  // 전송 처리 - 즉시 초기화 적용
  const handleSend = async () => {
    // 이미 업로드 중이면 리턴
    if (isUploading) {
      console.log('⏳ 이미 업로드 진행 중...');
      return;
    }
    
    // 텍스트와 파일 모두 없으면 리턴
    if (!messageText.trim() && selectedFiles.length === 0) return;

    // 전송 버튼 클릭 즉시 입력창과 파일 미리보기 초기화
    const textToSend = messageText.trim();
    const filesToSend = [...selectedFiles]; // 배열 복사
    
    // 즉시 UI 초기화
    setMessageText('');
    setSelectedFiles([]);
    setPreviewUrls({});
    
    // 텍스트에어리어 높이 초기화
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
    }
    
    // 파일 입력 요소 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    console.log('✅ 입력창 즉시 초기화 완료 - 업로드 시작');

    if (filesToSend.length > 0) {
      setIsUploading(true); // 업로드 시작
      
      // 파일이 선택된 경우 - 순차적으로 하나씩 전송
      console.log('순차적 이미지 업로드 시작:', {
        fileCount: filesToSend.length,
        text: textToSend
      });
      
      const hasText = textToSend;
      
      try {
        // 파일들을 순차적으로 하나씩 전송
        for (let index = 0; index < filesToSend.length; index++) {
          const file = filesToSend[index];
          const isLastFile = index === filesToSend.length - 1;
          
          // 마지막 파일에만 텍스트 붙이기 (텍스트가 있는 경우)
          const messageContent = (hasText && isLastFile) ? hasText : '[이미지]';
          
          console.log(`순차 업로드 ${index + 1}/${filesToSend.length}:`, {
            fileName: file.name,
            messageContent: messageContent,
            isLastFile: isLastFile
          });
          
          // 파일과 메시지를 동시에 전송 (await로 완료 대기)
          await onSendMessage(messageContent, 'image', file);
          
          // 각 파일 전송 후 잠깐 대기 (서버 처리 시간 확보)
          if (index < filesToSend.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500)); // 500ms 대기
          }
        }
        
        console.log('✅ 모든 파일 업로드 완료');
      } catch (error) {
        console.error('❌ 파일 업로드 중 오류:', error);
        alert('파일 업로드 중 오류가 발생했습니다.');
      } finally {
        setIsUploading(false); // 업로드 완료
      }
    } else {
      // 텍스트만 있는 경우
      console.log('텍스트 메시지 전송:', textToSend);
      try {
        await onSendMessage(textToSend);
      } catch (error) {
        console.error('텍스트 메시지 전송 실패:', error);
      }
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

  // 다중 파일 선택 핸들러 (자동 포커스 추가)
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    console.log('파일들 선택됨:', files.length, '개');

    // 파일 개수 제한 (예: 최대 10개)
    if (files.length > 10) {
      alert('최대 10개의 파일만 선택할 수 있습니다.');
      return;
    }

    const validFiles = [];
    const newPreviewUrls = {};

    files.forEach((file, index) => {
      // 파일 크기 체크 (10MB 제한)
      if (file.size > 10 * 1024 * 1024) {
        alert(`파일 "${file.name}"의 크기가 10MB를 초과합니다.`);
        return;
      }

      // 이미지 파일만 허용
      if (!file.type.startsWith('image/')) {
        alert(`파일 "${file.name}"은 이미지 파일이 아닙니다.`);
        return;
      }

      validFiles.push(file);

      // FileReader를 사용하여 미리보기 URL 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrls(prev => ({
          ...prev,
          [index]: e.target.result
        }));
        console.log(`미리보기 생성 완료: ${index + 1}/${validFiles.length}`);
      };
      reader.readAsDataURL(file);
    });

    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
      
      // 파일 선택 후 텍스트 입력창에 자동 포커스
      setTimeout(() => {
        if (textAreaRef.current) {
          textAreaRef.current.focus();
          console.log('✅ 파일 선택 후 텍스트 입력창에 포커스');
        }
      }, 100);
    }
  };

  // 특정 파일 제거 (다중 파일용)
  const removeSelectedFile = (indexToRemove) => {
    console.log('특정 파일 제거:', indexToRemove);
    
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setPreviewUrls(prev => {
      const newUrls = { ...prev };
      delete newUrls[indexToRemove];
      // 인덱스 재정렬
      const reorderedUrls = {};
      Object.keys(newUrls).forEach((key, newIndex) => {
        if (parseInt(key) > indexToRemove) {
          reorderedUrls[newIndex] = newUrls[key];
        } else {
          reorderedUrls[key] = newUrls[key];
        }
      });
      return reorderedUrls;
    });
    
    // 모든 파일이 제거된 경우 파일 입력 요소 값 초기화
    if (selectedFiles.length === 1) {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
      {/* 다중 파일 미리보기 영역 (파일이 선택된 경우에만 표시) */}
      {selectedFiles.length > 0 && (
        <MultiFilePreview>
          {selectedFiles.map((file, index) => (
            <FilePreview key={index}>
              <PreviewImage src={previewUrls[index]} alt="미리보기" />
              <FileInfo>
                <FileName>{file.name}</FileName>
                <FileSize>{formatFileSize(file.size)}</FileSize>
              </FileInfo>
              <RemoveButton onClick={() => removeSelectedFile(index)} title="선택된 파일 제거">
                ×
              </RemoveButton>
            </FilePreview>
          ))}
        </MultiFilePreview>
      )}

      {/* 메시지 입력 영역 */}
      <InputContainer>
        {/* 파일 첨부 버튼 */}
        <AttachButton onClick={() => fileInputRef.current?.click()} disabled={disabled || isUploading} title="이미지 첨부">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M21.44 11.05l-9.19 9.19a5 5 0 0 1-7.07-7.07l9.19-9.19a3.5 3.5 0 1 1 4.95 4.95L8.83 17.66"></path>
          </svg>
        </AttachButton>

        {/* 숨겨진 파일 입력 요소 - multiple 속성 추가 */}
        <HiddenFileInput
          ref={fileInputRef}
          type="file"
          accept="image/*" // 이미지 파일만 허용
          multiple // 다중 선택 허용
          onChange={handleFileSelect}
        />

        {/* 텍스트 입력 영역 */}
        <TextAreaContainer>
          <MessageTextArea
            ref={textAreaRef}
            value={messageText}
            onChange={handleTextChange}
            onKeyPress={handleKeyPress}
            placeholder={selectedFiles.length > 0 ? "이미지와 함께 보낼 메시지를 입력하세요..." : "메시지를 입력하세요..."}
            disabled={disabled}
            rows={1}
          />
          
          {/* 전송 버튼 */}
          <SendButton onClick={handleSend} disabled={disabled || (!messageText.trim() && selectedFiles.length === 0)} title="전송 (Enter)">
            ➤
          </SendButton>
        </TextAreaContainer>
      </InputContainer>
    </Container>
  );
};

export default MessageInput;