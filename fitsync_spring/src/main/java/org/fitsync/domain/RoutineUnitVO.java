package org.fitsync.domain;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoutineUnitVO {
    private PtVO pt;
    private List<RoutineSetVO> routine_set;
}
