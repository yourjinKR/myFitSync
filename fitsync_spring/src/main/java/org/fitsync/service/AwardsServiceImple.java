package org.fitsync.service;

import java.sql.Timestamp;
import java.util.List;

import org.fitsync.domain.AwardsVO;
import org.fitsync.domain.MessageVO;
import org.fitsync.domain.RoomVO;
import org.fitsync.mapper.AwardsMapper;
import org.fitsync.mapper.MessageMapper;
import org.fitsync.mapper.RoomMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.extern.log4j.Log4j;

@Log4j
@Service
public class AwardsServiceImple implements AwardsService {
	
	@Autowired
	private AwardsMapper mapper;
	@Autowired
	private RoomMapper roomMapper;
	@Autowired
	private MessageMapper messageMapper;

	@Override
	public int insertAward(AwardsVO vo) {
		return mapper.insertAward(vo);
	}
	
	@Override
	public List<AwardsVO> getApprovedAwards(int trainerIdx) {
		return mapper.selectApprovedAwards(trainerIdx);
	}
	// 경력 요청 리스트
	@Override
	public List<AwardsVO> getAwards() {
		return mapper.getAwards();
	}
	// 경력 요청 처리
	@Override
	public boolean updateAwards(AwardsVO vo) {
		if(vo.getAwards_reason() != null && !vo.getAwards_reason().equals("")) {
			List<RoomVO> list = roomMapper.getRoomList(vo.getTrainer_idx());
			boolean adminRoom = list.stream()
				    .anyMatch(room -> room.getTrainer_idx() == 141);
			if(!adminRoom) {	
				RoomVO rvo = new RoomVO();
				rvo.setTrainer_idx(141);
				rvo.setUser_idx(vo.getTrainer_idx());
				Timestamp timestamp = new Timestamp(System.currentTimeMillis());
				rvo.setRoom_regdate(timestamp);
				rvo.setRoom_status("active");
				rvo.setRoom_name("관리자 문의");
				if(roomMapper.insertRoom(rvo) == 0) {
					return false;
				}
				list = roomMapper.getRoomList(vo.getTrainer_idx());
			}
			for (RoomVO rvo : list) {
				if(rvo.getTrainer_idx() == 141) {
					MessageVO mvo = new MessageVO();
					mvo.setRoom_idx(rvo.getRoom_idx());
					mvo.setSender_idx(141);
					mvo.setReceiver_idx(vo.getTrainer_idx());
					mvo.setMessage_content(
						"반려된 요청 : "+ vo.getAwards_name() + "\n" +
						"반려 사유 : " + vo.getAwards_reason());
					mvo.setMessage_type("text");
					Timestamp timestamp = new Timestamp(System.currentTimeMillis());
					mvo.setMessage_senddate(timestamp);
					mvo.setMessage_delete("N");
					if(messageMapper.insertMessage(mvo) > 0) {
						roomMapper.updateLastMessage(rvo.getRoom_idx(), mvo.getMessage_idx());
					}
				}
			}
		}
		return mapper.updateAwards(vo) > 0;
	}

}
