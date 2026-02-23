package com.atinroy.leetly.problem;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AttemptMapper {

    @Mapping(target = "problemId", source = "problem.id")
    AttemptDto toDto(Attempt attempt);
}
