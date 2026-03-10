package com.atinroy.leetly.user.dto;

import com.atinroy.leetly.user.model.Theme;
public record ThemeDto(
        Long id,
        String name,
        String properties
) {
    public static ThemeDto from(Theme theme) {
        return new ThemeDto(
                theme.getId(),
                theme.getName(),
                theme.getProperties()
        );
    }
}
