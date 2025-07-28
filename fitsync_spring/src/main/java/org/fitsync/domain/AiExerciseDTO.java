package org.fitsync.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiExerciseDTO {
    private String pt_name;
    private int pt_idx;
    private int set_volume;
    private int set_count;
    private int set_num;
}