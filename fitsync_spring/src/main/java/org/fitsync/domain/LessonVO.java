package org.fitsync.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import oracle.sql.DATE;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LessonVO {
	
	private int lesson_idx, member_idx, lesson_price, lesson_percent, lesson_num;
	
}