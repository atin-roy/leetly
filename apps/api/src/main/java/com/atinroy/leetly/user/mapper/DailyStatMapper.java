package com.atinroy.leetly.user.mapper;

import org.mapstruct.Mapper;
import com.atinroy.leetly.user.dto.DailyStatDto;
import com.atinroy.leetly.user.model.DailyStat;

@Mapper(componentModel = "spring")
public interface DailyStatMapper {
    DailyStatDto toDto(DailyStat stat);
}
