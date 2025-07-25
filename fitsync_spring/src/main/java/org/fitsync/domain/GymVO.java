package org.fitsync.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GymVO {
	private int gym_idx;
	private String gym_name, gym_latitude, gym_longitude, gym_address;
}