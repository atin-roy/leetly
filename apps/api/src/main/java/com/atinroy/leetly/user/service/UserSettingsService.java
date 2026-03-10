package com.atinroy.leetly.user.service;

import com.atinroy.leetly.common.exception.ResourceNotFoundException;
import com.atinroy.leetly.problem.model.Language;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.atinroy.leetly.user.model.User;
import com.atinroy.leetly.user.model.UserSettings;
import com.atinroy.leetly.user.repository.UserSettingsRepository;

@Service
@Transactional
@RequiredArgsConstructor
public class UserSettingsService {

    private final UserSettingsRepository userSettingsRepository;
    private final ThemeService themeService;

    @Transactional(readOnly = true)
    public UserSettings getByUser(User user) {
        return userSettingsRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("UserSettings not found for user: " + user.getId()));
    }

    public UserSettings updateLanguage(User user, Language language) {
        UserSettings settings = getByUser(user);
        settings.setPreferredLanguage(language);
        return userSettingsRepository.save(settings);
    }

    public UserSettings updateDailyGoal(User user, int dailyGoal) {
        UserSettings settings = getByUser(user);
        settings.setDailyGoal(dailyGoal);
        return userSettingsRepository.save(settings);
    }

    public UserSettings updateTimezone(User user, String timezone) {
        UserSettings settings = getByUser(user);
        settings.setTimezone(timezone);
        return userSettingsRepository.save(settings);
    }

    public UserSettings updateTheme(User user, Long themeId) {
        UserSettings settings = getByUser(user);
        settings.setTheme(themeId != null ? themeService.findById(themeId) : null);
        return userSettingsRepository.save(settings);
    }
}
