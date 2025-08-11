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
    
    // Cloudinary 설정을 주입받아 서비스 초기화
    @Autowired
    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }
    
    // 파일을 Cloudinary에 업로드하고 DB에 파일 정보 저장
    public ChatAttachVO uploadFile(MultipartFile file) throws Exception {
        try {
            // Cloudinary 업로드 파라미터 설정
            Map<String, Object> uploadParams = new HashMap<>();
            uploadParams.put("resource_type", "auto"); // 파일 타입 자동 감지
            uploadParams.put("folder", "fitsync"); // 업로드 폴더 지정
            uploadParams.put("public_id", "chat_" + System.currentTimeMillis()); // 고유 ID 생성
            uploadParams.put("overwrite", false); // 덮어쓰기 방지
            uploadParams.put("quality", "auto:good"); // 품질 자동 최적화
            
            // Cloudinary에 파일 업로드 실행
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
            
            // 업로드 결과를 바탕으로 첨부파일 정보 객체 생성
            ChatAttachVO vo = new ChatAttachVO();
            vo.setOriginal_filename(file.getOriginalFilename());
            vo.setCloudinary_url((String) uploadResult.get("secure_url")); // HTTPS URL
            vo.setCloudinary_public_id((String) uploadResult.get("public_id"));
            vo.setFile_size_bytes(file.getSize());
            vo.setMime_type(file.getContentType());
            
            // 파일 확장자 추출 및 설정
            String filename = file.getOriginalFilename();
            if (filename != null && filename.contains(".")) {
                String extension = filename.substring(filename.lastIndexOf("."));
                vo.setFile_extension(extension);
            }
            
            // 첨부파일 정보를 DB에 저장
            mapper.insertAttach(vo);
            
            return vo;
            
        } catch (Exception e) {
            throw e;
        }
    }
    
    // Cloudinary와 DB에서 파일 삭제
    public boolean deleteFile(int attach_idx) {
        try {
            // DB에서 첨부파일 정보 조회
            ChatAttachVO attachment = mapper.getAttach(attach_idx);
            
            if (attachment == null) {
                return false;
            }
            
            // Cloudinary에서 파일 삭제
            boolean cloudinaryDeleted = deleteCloudinaryFile(attachment.getCloudinary_public_id());
            
            // DB에서 첨부파일 정보 삭제
            int deletedRows = mapper.deleteAttach(attach_idx);
            
            // 양쪽 모두 성공해야 true 반환
            return cloudinaryDeleted && deletedRows > 0;
            
        } catch (Exception e) {
            return false;
        }
    }
    
    // Cloudinary에서 파일 삭제 (내부 메서드)
    private boolean deleteCloudinaryFile(String publicId) {
        try {
            // Cloudinary 삭제 옵션 설정
            Map<String, Object> deleteOptions = new HashMap<>();
            deleteOptions.put("invalidate", true); // CDN 캐시 무효화
            
            // Cloudinary API를 통한 파일 삭제 실행
            Map<String, Object> deleteResult = cloudinary.uploader().destroy(publicId, deleteOptions);
            
            // 삭제 결과 확인 (result가 "ok"이면 성공)
            return deleteResult.containsKey("result") && "ok".equals(deleteResult.get("result"));
            
        } catch (Exception e) {
            return false;
        }
    }
}