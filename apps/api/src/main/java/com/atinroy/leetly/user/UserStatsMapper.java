package com.atinroy.leetly.user;

import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserStatsMapper {
    UserStatsDto toDto(UserStats stats);
}
