package com.atinroy.leetly.user.mapper;

import org.mapstruct.Mapper;
import com.atinroy.leetly.user.dto.UserProfileDto;
import com.atinroy.leetly.user.model.UserProfile;

@Mapper(componentModel = "spring")
public interface UserProfileMapper {
    UserProfileDto toDto(UserProfile profile);
}
