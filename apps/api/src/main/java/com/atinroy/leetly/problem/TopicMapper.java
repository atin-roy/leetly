package com.atinroy.leetly.problem;

import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TopicMapper {
    TopicDto toDto(Topic topic);
}
