package com.atinroy.leetly.user.mapper;

import com.atinroy.leetly.problem.mapper.ProblemMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import com.atinroy.leetly.user.dto.ProblemListDto;
import com.atinroy.leetly.user.model.ProblemList;

@Mapper(componentModel = "spring", uses = {ProblemMapper.class})
public interface ProblemListMapper {
    @Mapping(source = "default", target = "isDefault")
    ProblemListDto toDto(ProblemList list);
}
