import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import dateFormat from '../../utils/dateFormat';
const {formatDate} = dateFormat;

const Container = styled.div`
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border-medium);
  padding: 15px 20px;
  position: relative;
  z-index: 30;
  width: 100%;
  bottom: 0;
`;

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

// 메시지 입력 컴포넌트
const MessageInput = ({ 
  onSendMessage, 
  disabled,
  replyToMessage = null,
  onCancelReply = null,
  attachments = {},
  blockDate
}) => {
  const [messageText, setMessageText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef(null);
  const textAreaRef = useRef(null);

  // 답장 모드일 때 자동 포커스
  useEffect(() => {
    if (replyToMessage && textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [replyToMessage]);

  // 답장 미리보기 텍스트 생성 - 이미지 메시지의 경우 파일명 또는 기본 텍스트 표시
  const getReplyPreviewText = () => {
    if (!replyToMessage) return '';
    
    if (replyToMessage.message_type === 'image') {
      // 첨부파일 정보에서 파일명 추출
      const attachment = attachments && attachments[replyToMessage.message_idx];
      
      if (attachment && attachment.original_filename) {
        return `📷 ${attachment.original_filename}`;
      }
      
      // 메시지 내용이 유효한 경우 사용
      if (replyToMessage.message_content && 
          replyToMessage.message_content.trim() !== '' && 
          replyToMessage.message_content !== '[이미지]') {
        return replyToMessage.message_content;
      }
      
      return '📷 이미지';
    }
    
    return replyToMessage.message_content || '';
  };

  // 수정된 메시지 전송 처리 - 이미지 업로드 순서 개선
  const handleSend = async () => {
    if (isUploading) return;
    if (!messageText.trim() && selectedFiles.length === 0) return;

    const textToSend = messageText.trim();
    const filesToSend = [...selectedFiles];
    
    // 입력창 즉시 초기화
    setMessageText('');
    setSelectedFiles([]);
    setPreviewUrls({});
    
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // 이미지 파일 업로드 처리 - 개선된 순서
    if (filesToSend.length > 0) {
      setIsUploading(true);
      const hasText = textToSend;
      
      try {
        // 다중 파일 순차 업로드 - 개선된 처리 방식
        for (let index = 0; index < filesToSend.length; index++) {
          const file = filesToSend[index];
          const isLastFile = index === filesToSend.length - 1;
          
          // 마지막 파일에만 텍스트 메시지 첨부
          const messageContent = (hasText && isLastFile) ? hasText : '[이미지]';
          
          // onSendMessage에서 직접 처리하도록 변경
          await onSendMessage(
            messageContent, 
            'image', 
            file, 
            replyToMessage?.message_idx
          );
          
          // 업로드 간격 조절 - 안정성을 위한 지연 최소화
          if (index < filesToSend.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      } catch (error) {
        alert('파일 업로드 중 오류가 발생했습니다.');
      } finally {
        setIsUploading(false);
      }
    } else {
      // 텍스트 메시지만 전송
      try {
        await onSendMessage(
          textToSend, 
          'text', 
          null, 
          replyToMessage?.message_idx
        );
      } catch (error) {
        alert('메시지 전송 중 오류가 발생했습니다.');
      }
    }

    // 답장 모드 해제
    if (replyToMessage && onCancelReply) {
      onCancelReply();
    }
  };

  // Enter 키로 전송 (Shift+Enter는 줄바꿈)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 텍스트 입력 및 높이 자동 조절
  const handleTextChange = (e) => {
    setMessageText(e.target.value);
    
    const textArea = e.target;
    textArea.style.height = 'auto';
    textArea.style.height = textArea.scrollHeight + 'px';
  };

  // 파일 선택 처리 - 유효성 검사 강화
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (files.length > 10) {
      alert('최대 10개의 파일만 선택할 수 있습니다.');
      return;
    }

    const validFiles = [];
    const newPreviewUrls = {};

    files.forEach((file, index) => {
      // 파일 크기 검증
      if (file.size > 10 * 1024 * 1024) {
        alert(`파일 "${file.name}"의 크기가 10MB를 초과합니다.`);
        return;
      }

      // 이미지 파일 검증
      if (!file.type.startsWith('image/')) {
        alert(`파일 "${file.name}"은 이미지 파일이 아닙니다.`);
        return;
      }

      validFiles.push(file);

      // 미리보기 생성 - 메모리 효율성을 위한 개선
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrls(prev => ({
          ...prev,
          [index]: e.target.result
        }));
      };
      reader.onerror = () => {
        // 에러 처리 (무시)
      };
      reader.readAsDataURL(file);
    });

    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
      
      // 파일 선택 후 텍스트 입력창에 포커스
      setTimeout(() => {
        if (textAreaRef.current) {
          textAreaRef.current.focus();
        }
      }, 100);
    }
  };

  // 선택된 파일 제거
  const removeSelectedFile = (indexToRemove) => {
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
    
    // 모든 파일이 제거되면 input 초기화
    if (selectedFiles.length === 1) {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 파일 크기 포맷팅
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Container>
      {/* 답장 미리보기 */}
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

      {/* 선택된 파일 미리보기 */}
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

        {/* 숨겨진 파일 입력 */}
        <HiddenFileInput
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
        />

        {/* 텍스트 입력 영역 */}
        <TextAreaContainer>
          <MessageTextArea
            ref={textAreaRef}
            value={messageText}
            onChange={handleTextChange}
            onKeyPress={handleKeyPress}
            placeholder={
              replyToMessage 
                ? "답장을 입력하세요..." 
                : selectedFiles.length > 0 
                  ? "이미지와 함께 보낼 메시지를 입력하세요..." 
                  : blockDate !== null && blockDate >= Date.now()
                    ? `제재되어 ${formatDate(blockDate - 1, "none")}까지 메시지를 입력할 수 없습니다.`
                    : "메시지를 입력하세요..."
            }
            disabled={(blockDate !== null && blockDate >= Date.now()) && disabled}
            rows={1}
          />
          
          <SendButton 
            onClick={handleSend} 
            disabled={disabled || (!messageText.trim() && selectedFiles.length === 0) || isUploading} 
            title="전송 (Enter)"
          >
            {isUploading ? '⏳' : '➤'}
          </SendButton>
        </TextAreaContainer>
      </InputContainer>
    </Container>
  );
};

export default MessageInput;