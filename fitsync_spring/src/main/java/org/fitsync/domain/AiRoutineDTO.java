package org.fitsync.domain;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiRoutineDTO {
    private String routine_name;
    private List<AiExerciseDTO> exercises;
}