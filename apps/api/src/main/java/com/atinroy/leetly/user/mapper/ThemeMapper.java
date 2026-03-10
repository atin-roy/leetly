package com.atinroy.leetly.user.mapper;

import org.mapstruct.Mapper;
import com.atinroy.leetly.user.dto.ThemeDto;
import com.atinroy.leetly.user.model.Theme;

@Mapper(componentModel = "spring")
public interface ThemeMapper {
    ThemeDto toDto(Theme theme);
}
