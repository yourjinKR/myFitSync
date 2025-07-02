package org.fitsync.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PtVO {
	private int pt_idx;
	private String pt_name, pt_category, pt_image, pt_content, pt_writer;
}