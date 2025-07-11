package org.fitsync.domain;

import java.sql.Date;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor	
@NoArgsConstructor
public class MatchingVO {
	
	private int matching_idx, trainer_idx, user_idx, matching_total, matching_remain, matching_complete;
	private Date matching_start, matching_end;
	
	private MemberVO member;
}