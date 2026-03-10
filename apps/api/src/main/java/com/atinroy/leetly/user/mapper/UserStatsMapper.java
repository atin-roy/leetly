package com.atinroy.leetly.user.mapper;

import org.mapstruct.Mapper;
import com.atinroy.leetly.user.dto.UserStatsDto;
import com.atinroy.leetly.user.model.UserStats;

@Mapper(componentModel = "spring")
public interface UserStatsMapper {
    UserStatsDto toDto(UserStats stats);
}
