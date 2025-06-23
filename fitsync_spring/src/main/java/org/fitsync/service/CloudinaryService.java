package org.fitsync.service;
import com.cloudinary.Cloudinary;

import lombok.extern.log4j.Log4j;

import org.fitsync.domain.ChatAttachVO;
import org.fitsync.mapper.ChatAttachMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Log4j
@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    @Autowired
	private ChatAttachMapper mapper;
    
    @Autowired
    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }
    // 파일 업로드
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
            
            // attachDAO에 insert
            ChatAttachVO vo = new ChatAttachVO();
//            vo.setFilename(originalFilename);
//            vo.setUuid(uuid);
//            mapper.insertAttach(vo);
            
            // 업로드된 파일 URL 반환
            return uuid;
            
        } catch (IOException e) {
            throw new RuntimeException("Cloudinary 파일 업로드 실패", e);
        }
    }
    
    // 파일 삭제
//    public boolean deleteFile(String uuid) {
//        try {
//             Cloudinary에서 파일 삭제
//        	ChatAttachVO vo = mapper.getAttach(uuid);
//            if(vo != null) {
//            	String fileName = vo.getUuid() + "_" + vo.getFilename(); // Cloudinary에서 삭제할 파일 이름
//            	log.info(fileName);
//            	// Cloudinary에서 파일 삭제
//            	String public_id = fileName.substring(0, fileName.indexOf("."));
//            	Map<String, Object> deleteOptions = new HashMap<>();
//            	deleteOptions.put("invalidate", true);
//            	Map<String, Object> deleteResult = cloudinary.uploader().destroy(public_id,deleteOptions);
//            	// 삭제 결과 확인
//            	if (deleteResult.containsKey("result") && "ok".equals(deleteResult.get("result"))) {
//            		// 삭제 성공, 데이터베이스에서 파일 정보도 삭제
//            		mapper.deleteAttach(vo.getUuid());
//            		return true;
//            	} else {
//            		return false;
//            	}
//            }else {
//            	return false;
//            }
//
//        } catch (IOException e) {
//            throw new RuntimeException("Cloudinary 파일 삭제 실패", e);
//        } catch (Exception e) {
//            throw new RuntimeException("파일 삭제 중 오류 발생", e);
//        }
//    }

//    public List<ChatAttachVO> getFilesByUuidList(List<String> uuidList) {
//        return mapper.getFilesByUuidList(uuidList);
//    }
    
//    @Transactional
//    public void updateEventImagesWithDeleteAndNewFiles(int event_idx, List<String> deleteUuids, List<MultipartFile> newFiles) {
//        // 1. 삭제할 UUID 파일 삭제 (Cloudinary + DB)
//        if (deleteUuids != null && !deleteUuids.isEmpty()) {
//            for (String uuid : deleteUuids) {
//                deleteFile(uuid);
//            }
//        }
//
//        // 2. 기존 이벤트 정보 가져오기
//        EventVO event = eventService.getEventByIdx(event_idx);
//        List<String> currentUuids = new ArrayList<>();
//
//        // 수정된 조건 : event_file이 null이 아니고, 빈 문자열이 아닐 때만 처리
//        if (event.getEvent_file() != null && event.getEvent_file().trim().length() > 0) {
//            currentUuids.addAll(Arrays.asList(event.getEvent_file().split(",")));
//        }
//
//        // 3. 삭제 UUID 리스트는 기존 UUID 목록에서 제거
//        if (deleteUuids != null) {
//            currentUuids.removeAll(deleteUuids);
//        }
//
//        // 4. 새 파일 업로드 및 UUID 추가
//        if (newFiles != null) {
//            for (MultipartFile file : newFiles) {
//                if (!file.isEmpty()) {
//                    String newUuid = uploadFile(file);
//                    currentUuids.add(newUuid);
//                }
//            }
//        }
//
//        // 5. event_file 컬럼 업데이트용 문자열 생성
//        String joinedUuids = String.join(",", currentUuids);
//        event.setEvent_file(joinedUuids);
//
//        // 6. 디버깅용 로그 출력
//        System.out.println("최종 UUID: " + joinedUuids);
//        System.out.println("수정할 idx: " + event.getEvent_idx());
//
//        // 7. DB 업데이트 (event_file 컬럼만)
//        int updated = eventMapper.updateEventFileOnly(event);
//        System.out.println("수정된 행 수: " + updated);
//    }
//    
//    public List<AttachFileVO> getFilesByEventIdx(int event_idx) {
//        EventVO event = eventService.getEventByIdx(event_idx);
//        List<String> uuidList = new ArrayList<>();
//
//        if (event.getEvent_file() != null && !event.getEvent_file().trim().isEmpty()) {
//            uuidList = Arrays.asList(event.getEvent_file().split(","));
//        }
//
//        return uuidList.isEmpty() ? new ArrayList<>() : mapper.getFilesByUuidList(uuidList);
//    }
//
//    public List<String> getExternalUrlsByEventIdx(int event_idx) {
//        EventVO event = eventService.getEventByIdx(event_idx);
//        String eventFile = event.getEvent_file();
//
//        if (eventFile == null || eventFile.isEmpty()) return new ArrayList<>();
//
//        List<String> urls = new ArrayList<>();
//        for (String uuid : eventFile.split(",")) {
//            if (uuid.startsWith("http")) { // 외부 링크
//                urls.add(uuid);
//            }
//        }
//        return urls;
//    }

}