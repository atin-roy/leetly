package com.atinroy.leetly.problem.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import com.atinroy.leetly.problem.dto.AttemptDto;
import com.atinroy.leetly.problem.model.Attempt;

@Mapper(componentModel = "spring")
public interface AttemptMapper {

    @Mapping(target = "problemId", source = "problem.id")
    AttemptDto toDto(Attempt attempt);
}
