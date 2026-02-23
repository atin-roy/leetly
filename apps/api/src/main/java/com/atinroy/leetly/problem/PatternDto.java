package com.atinroy.leetly.problem;

public record PatternDto(
        Long id,
        String name,
        String description,
        Long topicId,
        String topicName,
        boolean namedAlgorithm
) {
    public static PatternDto from(Pattern pattern) {
        Topic topic = pattern.getTopic();
        return new PatternDto(
                pattern.getId(),
                pattern.getName(),
                pattern.getDescription(),
                topic != null ? topic.getId() : null,
                topic != null ? topic.getName() : null,
                pattern.isNamedAlgorithm()
        );
    }
}
