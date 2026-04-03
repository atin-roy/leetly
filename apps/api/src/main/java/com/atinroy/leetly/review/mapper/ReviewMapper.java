package com.atinroy.leetly.review.mapper;

import com.atinroy.leetly.review.dto.ReviewCardDto;
import com.atinroy.leetly.review.dto.ReviewLogDto;
import com.atinroy.leetly.review.model.ReviewCard;
import com.atinroy.leetly.review.model.ReviewLog;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

    @Mapping(target = "problemId", source = "problem.id")
    @Mapping(target = "leetcodeId", source = "problem.leetcodeId")
    @Mapping(target = "problemTitle", source = "problem.title")
    @Mapping(target = "problemUrl", source = "problem.url")
    @Mapping(target = "difficulty", source = "problem.difficulty")
    @Mapping(target = "problemStatus", source = "problem.status")
    @Mapping(target = "fsrsDifficulty", source = "difficulty")
    ReviewCardDto toDto(ReviewCard card);

    @Mapping(target = "attemptId", source = "attempt.id")
    ReviewLogDto toLogDto(ReviewLog log);
}
