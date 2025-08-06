package org.fitsync.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReviewVO {
	private int matching_idx, review_star, member_idx;
	private String review_title, review_content, review_hidden, member_name, member_image;
}