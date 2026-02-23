package com.atinroy.leetly.user;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserSettingsMapper {

    @Mapping(target = "themeId", source = "theme.id")
    @Mapping(target = "themeName", source = "theme.name")
    UserSettingsDto toDto(UserSettings settings);
}
