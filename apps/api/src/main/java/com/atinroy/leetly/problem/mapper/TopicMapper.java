package com.atinroy.leetly.problem.mapper;

import org.mapstruct.Mapper;
import com.atinroy.leetly.problem.dto.TopicDto;
import com.atinroy.leetly.problem.model.Topic;

@Mapper(componentModel = "spring")
public interface TopicMapper {
    TopicDto toDto(Topic topic);
}
