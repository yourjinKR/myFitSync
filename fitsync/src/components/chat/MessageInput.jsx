import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

// Nav.jsx에 가리지 않도록 위치 보장
const Container = styled.div`
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border-medium);
  padding: 15px 20px;
  position: relative;
  z-index: 30; /* Nav.jsx(999)보다 낮지만 Container 내부에서는 높게 */
  width: 100%;
  /* Nav.jsx 영역을 침범하지 않도록 확실하게 위치 고정 */
  bottom: 0;
`;

// 답장 미리보기 컨테이너
const ReplyPreviewContainer = styled.div`
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ReplyPreviewContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ReplyPreviewLabel = styled.div`
  font-size: 1.2rem;
  color: var(--text-secondary);
  font-weight: 500;
  margin-bottom: 4px;
`;

const ReplyPreviewText = styled.div`
  font-size: 1.3rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CancelReplyButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.6rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover {
    color: var(--text-primary);
    background: var(--bg-primary);
  }
`;

// 다중 파일 미리보기 컨테이너
const MultiFilePreview = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
  max-height: 200px;
  overflow-y: auto;
  
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
`;

const TextAreaContainer = styled.div`
  flex: 1;
  position: relative;
`;

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

const HiddenFileInput = styled.input`
  display: none;
`;

// 답장 기능이 추가된 메시지 입력 컴포넌트
const MessageInput = ({ 
  onSendMessage, 
  disabled,
  replyToMessage = null, // 답장할 메시지
  onCancelReply = null // 답장 취소 핸들러
}) => {
  const [messageText, setMessageText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef(null);
  const textAreaRef = useRef(null);

  // 답장 모드일 때 입력창에 포커스
  useEffect(() => {
    if (replyToMessage && textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [replyToMessage]);

  // 전송 처리 - 답장 기능 추가
  const handleSend = async () => {
    if (isUploading) {
      console.log('⏳ 이미 업로드 진행 중...');
      return;
    }
    
    if (!messageText.trim() && selectedFiles.length === 0) return;

    const textToSend = messageText.trim();
    const filesToSend = [...selectedFiles];
    
    // 즉시 UI 초기화
    setMessageText('');
    setSelectedFiles([]);
    setPreviewUrls({});
    
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    console.log('✅ 입력창 즉시 초기화 완료 - 업로드 시작');

    if (filesToSend.length > 0) {
      setIsUploading(true);
      
      const hasText = textToSend;
      
      try {
        for (let index = 0; index < filesToSend.length; index++) {
          const file = filesToSend[index];
          const isLastFile = index === filesToSend.length - 1;
          
          const messageContent = (hasText && isLastFile) ? hasText : '[이미지]';
          
          console.log(`순차 업로드 ${index + 1}/${filesToSend.length}:`, {
            fileName: file.name,
            messageContent: messageContent,
            isLastFile: isLastFile,
            parentIdx: replyToMessage?.message_idx // 답장 정보 추가
          });
          
          // 답장 정보와 함께 메시지 전송
          await onSendMessage(
            messageContent, 
            'image', 
            file, 
            replyToMessage?.message_idx // parent_idx로 전달
          );
          
          if (index < filesToSend.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
        
        console.log('✅ 모든 파일 업로드 완료');
      } catch (error) {
        console.error('❌ 파일 업로드 중 오류:', error);
        alert('파일 업로드 중 오류가 발생했습니다.');
      } finally {
        setIsUploading(false);
      }
    } else {
      // 텍스트만 있는 경우
      console.log('텍스트 메시지 전송:', textToSend, '답장:', replyToMessage?.message_idx);
      try {
        await onSendMessage(
          textToSend, 
          'text', 
          null, 
          replyToMessage?.message_idx // parent_idx로 전달
        );
      } catch (error) {
        console.error('텍스트 메시지 전송 실패:', error);
      }
    }

    // 답장 모드 해제
    if (replyToMessage && onCancelReply) {
      onCancelReply();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextChange = (e) => {
    setMessageText(e.target.value);
    
    const textArea = e.target;
    textArea.style.height = 'auto';
    textArea.style.height = textArea.scrollHeight + 'px';
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    console.log('파일들 선택됨:', files.length, '개');

    if (files.length > 10) {
      alert('최대 10개의 파일만 선택할 수 있습니다.');
      return;
    }

    const validFiles = [];
    const newPreviewUrls = {};

    files.forEach((file, index) => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`파일 "${file.name}"의 크기가 10MB를 초과합니다.`);
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert(`파일 "${file.name}"은 이미지 파일이 아닙니다.`);
        return;
      }

      validFiles.push(file);

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
      
      setTimeout(() => {
        if (textAreaRef.current) {
          textAreaRef.current.focus();
          console.log('✅ 파일 선택 후 텍스트 입력창에 포커스');
        }
      }, 100);
    }
  };

  const removeSelectedFile = (indexToRemove) => {
    console.log('특정 파일 제거:', indexToRemove);
    
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setPreviewUrls(prev => {
      const newUrls = { ...prev };
      delete newUrls[indexToRemove];
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
    
    if (selectedFiles.length === 1) {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 답장 미리보기 텍스트 생성
  const getReplyPreviewText = () => {
    if (!replyToMessage) return '';
    
    if (replyToMessage.message_type === 'image') {
      return replyToMessage.message_content && replyToMessage.message_content !== '[이미지]' 
        ? replyToMessage.message_content 
        : '📷 이미지';
    }
    
    return replyToMessage.message_content || '';
  };

  return (
    <Container>
      {/* 답장 미리보기 (답장 모드일 때만 표시) */}
      {replyToMessage && (
        <ReplyPreviewContainer>
          <ReplyPreviewContent>
            <ReplyPreviewLabel>답장</ReplyPreviewLabel>
            <ReplyPreviewText>{getReplyPreviewText()}</ReplyPreviewText>
          </ReplyPreviewContent>
          <CancelReplyButton 
            onClick={onCancelReply}
            title="답장 취소"
          >
            ✕
          </CancelReplyButton>
        </ReplyPreviewContainer>
      )}

      {/* 다중 파일 미리보기 영역 */}
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

        <HiddenFileInput
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
        />

        <TextAreaContainer>
          <MessageTextArea
            ref={textAreaRef}
            value={messageText}
            onChange={handleTextChange}
            onKeyPress={handleKeyPress}
            placeholder={replyToMessage ? "답장을 입력하세요..." : selectedFiles.length > 0 ? "이미지와 함께 보낼 메시지를 입력하세요..." : "메시지를 입력하세요..."}
            disabled={disabled}
            rows={1}
          />
          
          <SendButton onClick={handleSend} disabled={disabled || (!messageText.trim() && selectedFiles.length === 0)} title="전송 (Enter)">
            ➤
          </SendButton>
        </TextAreaContainer>
      </InputContainer>
    </Container>
  );
};

export default MessageInput;