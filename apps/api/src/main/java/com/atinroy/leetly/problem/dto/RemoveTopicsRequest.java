package com.atinroy.leetly.problem.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record RemoveTopicsRequest(@NotEmpty List<Long> topicIds) {}
