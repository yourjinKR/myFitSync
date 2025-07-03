package org.fitsync.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RecordSetVO {
	private int record_idx, set_num, set_volum, set_count, purpose_volum, purpose_count;
}