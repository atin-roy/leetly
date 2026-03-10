package com.atinroy.leetly.user.dto;

import com.atinroy.leetly.problem.model.Language;
import com.atinroy.leetly.user.model.Theme;
import com.atinroy.leetly.user.model.UserSettings;

public record UserSettingsDto(
        Language preferredLanguage,
        int dailyGoal,
        String timezone,
        Long themeId,
        String themeName
) {
    public static UserSettingsDto from(UserSettings settings) {
        Theme theme = settings.getTheme();
        return new UserSettingsDto(
                settings.getPreferredLanguage(),
                settings.getDailyGoal(),
                settings.getTimezone(),
                theme != null ? theme.getId() : null,
                theme != null ? theme.getName() : null
        );
    }
}
