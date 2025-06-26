package org.fitsync.domain;

import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AwardsVO {
	
	private int trainer_idx;
	private String awards_category, awards_name, awards_certificate, awards_approval;
	
}