package com.atinroy.leetly.problem;

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
