package com.atinroy.leetly.user;

import com.atinroy.leetly.problem.ProblemMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {ProblemMapper.class})
public interface ProblemListMapper {
    @Mapping(source = "default", target = "isDefault")
    ProblemListDto toDto(ProblemList list);
}
