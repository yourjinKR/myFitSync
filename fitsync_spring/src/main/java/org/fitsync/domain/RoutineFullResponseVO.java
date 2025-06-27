package org.fitsync.domain;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoutineFullResponseVO {
    private RoutineListVO routineList;
    private List<RoutineUnitVO> routines;
}
