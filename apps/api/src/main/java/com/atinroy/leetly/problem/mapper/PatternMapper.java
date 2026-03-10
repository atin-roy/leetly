package com.atinroy.leetly.problem.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import com.atinroy.leetly.problem.dto.PatternDto;
import com.atinroy.leetly.problem.model.Pattern;

@Mapper(componentModel = "spring")
public interface PatternMapper {

    @Mapping(target = "topicId", source = "topic.id")
    @Mapping(target = "topicName", source = "topic.name")
    PatternDto toDto(Pattern pattern);
}
