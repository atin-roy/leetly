package com.atinroy.leetly.user.dto;

import com.atinroy.leetly.problem.dto.ProblemSummaryDto;

import java.util.List;
import com.atinroy.leetly.user.model.ProblemList;

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
