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
        // Cloudinary 설정 확인 로그 추가
        log.info("=== Cloudinary 설정 확인 ===");
        log.info("Cloud Name: " + cloudinary.config.cloudName);
        log.info("API Key: " + cloudinary.config.apiKey);
        log.info("API Secret: " + (cloudinary.config.apiSecret != null ? "설정됨" : "설정되지 않음"));
        log.info("========================");
    }
    
    // 파일 업로드
    public ChatAttachVO uploadFile(MultipartFile file) throws Exception {
        log.info("CloudinaryService uploadFile..." + file.getOriginalFilename());
        
        try {
            // Cloudinary 업로드 파라미터 설정
            Map<String, Object> uploadParams = new HashMap<>();
            uploadParams.put("resource_type", "auto");
            uploadParams.put("folder", "fitsync");
            uploadParams.put("public_id", "chat_" + System.currentTimeMillis());
            uploadParams.put("overwrite", false);
            uploadParams.put("quality", "auto:good");
            
            // Cloudinary에 파일 업로드
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
            
            // 첨부파일 정보 생성
            ChatAttachVO vo = new ChatAttachVO();
            vo.setOriginal_filename(file.getOriginalFilename());
            vo.setCloudinary_url((String) uploadResult.get("secure_url"));
            vo.setCloudinary_public_id((String) uploadResult.get("public_id"));
            vo.setFile_size_bytes(file.getSize());
            vo.setMime_type(file.getContentType());
            
            // 파일 확장자 추출
            String filename = file.getOriginalFilename();
            if (filename != null && filename.contains(".")) {
                String extension = filename.substring(filename.lastIndexOf("."));
                vo.setFile_extension(extension);
            }
            
            // 첨부파일 정보 DB 저장
            mapper.insertAttach(vo);
            
            return vo;
            
        } catch (Exception e) {
            log.error("파일 업로드 처리 중 오류 발생: " + e.getMessage());
            throw e;
        }
    }
    
    // 파일 삭제 메서드
    public boolean deleteFile(int attach_idx) {
        try {
            // 첨부파일 정보 조회
            ChatAttachVO attachment = mapper.getAttach(attach_idx);
            
            if (attachment == null) {
                log.warn("삭제할 첨부파일을 찾을 수 없습니다. attach_idx: " + attach_idx);
                return false;
            }
            
            // Cloudinary에서 파일 삭제
            boolean cloudinaryDeleted = deleteCloudinaryFile(attachment.getCloudinary_public_id());
            
            // DB에서 첨부파일 정보 삭제
            int deletedRows = mapper.deleteAttach(attach_idx);
            
            return cloudinaryDeleted && deletedRows > 0;
            
        } catch (Exception e) {
            log.error("첨부파일 삭제 중 오류 발생: " + attach_idx, e);
            return false;
        }
    } // 클라우디너리 삭제
    private boolean deleteCloudinaryFile(String publicId) {
        try {
            Map<String, Object> deleteOptions = new HashMap<>();
            deleteOptions.put("invalidate", true);
            
            Map<String, Object> deleteResult = cloudinary.uploader().destroy(publicId, deleteOptions);
            
            return deleteResult.containsKey("result") && "ok".equals(deleteResult.get("result"));
            
        } catch (Exception e) {
            log.error("Cloudinary 파일 삭제 중 오류 발생: " + publicId, e);
            return false;
        }
    }
    
}