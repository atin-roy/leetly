package com.atinroy.leetly.user;

import com.atinroy.leetly.problem.ProblemMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {ProblemMapper.class})
public interface ProblemListMapper {
    ProblemListDto toDto(ProblemList list);
}
