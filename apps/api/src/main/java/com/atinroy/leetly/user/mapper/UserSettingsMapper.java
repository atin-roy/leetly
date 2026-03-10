package com.atinroy.leetly.user.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import com.atinroy.leetly.user.dto.UserSettingsDto;
import com.atinroy.leetly.user.model.UserSettings;

@Mapper(componentModel = "spring")
public interface UserSettingsMapper {

    @Mapping(target = "themeId", source = "theme.id")
    @Mapping(target = "themeName", source = "theme.name")
    UserSettingsDto toDto(UserSettings settings);
}
