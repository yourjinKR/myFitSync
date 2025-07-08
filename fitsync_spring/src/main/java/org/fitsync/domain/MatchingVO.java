package org.fitsync.domain;

import java.sql.Timestamp;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import oracle.sql.DATE;

@Data
@AllArgsConstructor	
@NoArgsConstructor
public class MatchingVO {
	
	private int matching_idx, trainer_idx, user_idx, matching_total, matching_remain, matching_complete;
	private DATE matching_start, matching_end;
	
}