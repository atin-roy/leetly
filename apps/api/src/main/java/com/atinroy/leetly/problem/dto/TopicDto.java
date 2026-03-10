package com.atinroy.leetly.problem.dto;

import com.atinroy.leetly.problem.model.Topic;
public record TopicDto(
        Long id,
        String name,
        String description
) {
    public static TopicDto from(Topic topic) {
        return new TopicDto(
                topic.getId(),
                topic.getName(),
                topic.getDescription()
        );
    }
}
