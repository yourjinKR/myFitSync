package org.fitsync.service;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import lombok.extern.log4j.Log4j;

import org.fitsync.domain.ChatAttachVO;
import org.fitsync.mapper.ChatAttachMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Log4j
@Service
@Transactional
public class CloudinaryService {

    private final Cloudinary cloudinary;

    @Autowired
	private ChatAttachMapper mapper;
    
    @Autowired
    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }
    
    // 첨부파일 클라우디너리 업로드
    public String uploadFile(MultipartFile file) {
        try {
            // 원본 파일 이름에서 확장자 추출
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null) {
                throw new IllegalArgumentException("파일 이름이 비어있습니다.");
            }
            
            String fileName = originalFilename.substring(0, originalFilename.indexOf("."));
            
            // UUID를 활용한 고유 파일 이름 생성
            String uuid = UUID.randomUUID().toString();
            String uniqueFilename = uuid +"_"+ fileName;

            // Cloudinary 업로드 옵션 설정
            Map<String, Object> uploadOptions = new HashMap<>();
            uploadOptions.put("public_id", uniqueFilename);

            // Cloudinary에 업로드
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadOptions);
            
            // 업로드된 파일 URL 반환
            return uuid;
            
        } catch (IOException e) {
            throw new RuntimeException("Cloudinary 파일 업로드 실패", e);
        }
    }
    
    // 업로드된 첨부파일 클라우디너리에서 삭제
    public boolean deleteFile(String publicId) {
        try {
            log.info("Cloudinary 파일 삭제 시도: " + publicId);
            
            // Cloudinary 삭제 옵션 설정
            Map<String, Object> deleteOptions = new HashMap<>();
            deleteOptions.put("invalidate", true);  // CDN 캐시 무효화
            
            // Cloudinary에서 파일 삭제 실행
            Map<String, Object> deleteResult = cloudinary.uploader().destroy(publicId, deleteOptions);
            
            // 삭제 결과 확인
            boolean isSuccess = deleteResult.containsKey("result") && "ok".equals(deleteResult.get("result"));
            
            if (isSuccess) {
                log.info("Cloudinary 파일 삭제 성공: " + publicId);
            } else {
                log.warn("Cloudinary 파일 삭제 실패: " + publicId + ", 결과: " + deleteResult);
            }
            
            return isSuccess;
            
        } catch (Exception e) {
            log.error("Cloudinary 파일 삭제 중 오류 발생: " + publicId, e);
            throw new RuntimeException("Cloudinary 파일 삭제 실패", e);
        }
    }
    
    /*----------------------------------------------------------------------------------------------------------*/
    
    // 채팅 메시지에 첨부할 파일 DB+클라우디너리 업로드
    public Map<String, Object> uploadFile(MultipartFile file, int message_idx) throws Exception {
        log.info("CloudinaryService uploadFile..." + file.getOriginalFilename() + ", " + message_idx);
        
        try {
            // 파일 타입에 따른 Cloudinary 업로드 설정 구성
            Map<String, Object> uploadParams = ObjectUtils.asMap(
                "resource_type", "auto",  // 모든 파일 타입 자동 감지 (image, video, raw 등)
                "folder", "pt-chat-files",  // Cloudinary 내 저장 폴더명
                "public_id", "chat_" + System.currentTimeMillis(),  // 고유한 파일 ID 생성
                "overwrite", false,  // 동일한 public_id가 있어도 덮어쓰지 않음
                "quality", "auto:good"  // 이미지/비디오 품질 자동 최적화
            );
            
            // Cloudinary에 파일 업로드 실행
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
            
            // 업로드된 파일 정보를 데이터베이스에 저장하기 위한 VO 객체 생성
            ChatAttachVO vo = new ChatAttachVO();
            vo.setMessage_idx(message_idx);  // 연결될 메시지 ID
            vo.setOriginal_filename(file.getOriginalFilename());  // 원본 파일명
            vo.setCloudinary_url((String) uploadResult.get("secure_url"));  // HTTPS URL
            vo.setCloudinary_public_id((String) uploadResult.get("public_id"));  // Cloudinary 파일 ID
            vo.setFile_size_bytes(file.getSize());  // 파일 크기 (바이트)
            vo.setMime_type(file.getContentType());  // MIME 타입 (예: image/jpeg, application/pdf)
            
            // 파일 확장자 추출 및 설정
            String filename = file.getOriginalFilename();
            if (filename != null && filename.contains(".")) {
                String extension = filename.substring(filename.lastIndexOf("."));  // 마지막 점(.) 이후 문자열
                vo.setFile_extension(extension);
            }
            
            // 첨부파일 정보를 데이터베이스에 저장 (시퀀스를 통해 attach_idx 자동 생성)
            mapper.insertAttach(vo);
            
            // 클라이언트에 반환할 파일 정보 구성
            return ObjectUtils.asMap(
                "attachIdx", vo.getAttach_idx(),  // 생성된 첨부파일 ID
                "originalFilename", vo.getOriginal_filename(),  // 원본 파일명
                "cloudinaryUrl", vo.getCloudinary_url(),  // 접근 가능한 URL
                "cloudinaryPublicId", vo.getCloudinary_public_id(),  // Cloudinary 파일 ID
                "fileSize", vo.getFile_size_bytes(),  // 파일 크기
                "mimeType", vo.getMime_type(),  // MIME 타입
                "fileExtension", vo.getFile_extension()  // 파일 확장자
            );
            
        } catch (IOException e) {
            log.error("Cloudinary 파일 업로드 실패: " + e.getMessage());
            throw new RuntimeException("Cloudinary 파일 업로드 실패", e);
        } catch (Exception e) {
            log.error("파일 업로드 처리 중 오류 발생: " + e.getMessage());
            throw e;  // 다른 예외는 그대로 다시 던짐
        }
    }
    
    // 채팅 메시지에 첨부된 파일 DB+클라우디너리에서 삭제
    @Transactional
    public boolean deleteFile(int attach_idx) {
        try {
            // 1. 데이터베이스에서 첨부파일 정보 조회
            ChatAttachVO attachment = mapper.getAttach(attach_idx);
            
            if (attachment == null) {
                log.warn("삭제할 첨부파일을 찾을 수 없습니다. attach_idx: " + attach_idx);
                return false;
            }
            
            // 2. Cloudinary에서 파일 삭제
            boolean cloudinaryDeleted = deleteFile(attachment.getCloudinary_public_id());
            
            // 3. 데이터베이스에서 첨부파일 정보 삭제
            int deletedRows = mapper.deleteAttach(attach_idx);
            
            boolean dbDeleted = deletedRows > 0;
            
            log.info("첨부파일 삭제 결과 - Cloudinary: " + cloudinaryDeleted + ", DB: " + dbDeleted);
            
            // 둘 다 성공했을 때만 true 반환
            return cloudinaryDeleted && dbDeleted;
            
        } catch (Exception e) {
            log.error("첨부파일 삭제 중 오류 발생: " + attach_idx, e);
            throw new RuntimeException("첨부파일 삭제 실패", e);
        }
    }
    
    // 채팅 메시지에 첨부된 파일목록 조회
    public List<ChatAttachVO> readFile(int message_idx) {
        log.info("CloudinaryService readFile..." + message_idx);
        return mapper.getAttachList(message_idx);  // 메시지의 모든 첨부파일 조회
    }
    
}