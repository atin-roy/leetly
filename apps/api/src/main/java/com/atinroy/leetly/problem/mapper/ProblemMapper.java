package com.atinroy.leetly.problem.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import com.atinroy.leetly.problem.dto.ProblemDetailDto;
import com.atinroy.leetly.problem.dto.ProblemSummaryDto;
import com.atinroy.leetly.problem.model.Problem;

@Mapper(componentModel = "spring", uses = {TopicMapper.class, PatternMapper.class, AttemptMapper.class})
public interface ProblemMapper {

    ProblemSummaryDto toSummaryDto(Problem problem);

    @Mapping(target = "reviewCard", ignore = true)
    ProblemDetailDto toDetailDto(Problem problem);
}
