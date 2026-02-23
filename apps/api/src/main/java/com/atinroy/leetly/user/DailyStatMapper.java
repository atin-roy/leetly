package com.atinroy.leetly.user;

import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface DailyStatMapper {
    DailyStatDto toDto(DailyStat stat);
}
