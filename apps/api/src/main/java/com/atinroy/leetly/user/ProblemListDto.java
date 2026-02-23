package com.atinroy.leetly.user;

import com.atinroy.leetly.problem.ProblemSummaryDto;

import java.util.List;

public record ProblemListDto(
        Long id,
        String name,
        boolean isDefault,
        List<ProblemSummaryDto> problems
) {
    public static ProblemListDto from(ProblemList list) {
        return new ProblemListDto(
                list.getId(),
                list.getName(),
                list.isDefault(),
                list.getProblems().stream().map(ProblemSummaryDto::from).toList()
        );
    }
}
