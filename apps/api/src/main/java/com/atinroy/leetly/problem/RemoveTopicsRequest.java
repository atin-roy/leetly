package com.atinroy.leetly.problem;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record RemoveTopicsRequest(@NotEmpty List<Long> topicIds) {}
