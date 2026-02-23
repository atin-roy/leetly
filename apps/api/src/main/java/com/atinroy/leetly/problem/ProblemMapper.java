package com.atinroy.leetly.problem;

import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {TopicMapper.class, PatternMapper.class, AttemptMapper.class})
public interface ProblemMapper {

    ProblemSummaryDto toSummaryDto(Problem problem);

    ProblemDetailDto toDetailDto(Problem problem);
}
