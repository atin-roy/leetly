package com.atinroy.leetly.user.service;

import com.atinroy.leetly.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.atinroy.leetly.user.model.ProblemList;
import com.atinroy.leetly.user.model.User;
import com.atinroy.leetly.user.model.UserProfile;
import com.atinroy.leetly.user.model.UserSettings;
import com.atinroy.leetly.user.model.UserStats;
import com.atinroy.leetly.user.repository.ProblemListRepository;
import com.atinroy.leetly.user.repository.UserProfileRepository;
import com.atinroy.leetly.user.repository.UserRepository;
import com.atinroy.leetly.user.repository.UserSettingsRepository;
import com.atinroy.leetly.user.repository.UserStatsRepository;

@Service
@Transactional
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final UserStatsRepository userStatsRepository;
    private final ProblemListRepository problemListRepository;
    private final UserProfileRepository userProfileRepository;

    @Transactional(readOnly = true)
    public User findByKeycloakId(String keycloakId) {
        return userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + keycloakId));
    }

    public User getOrCreate(String keycloakId) {
        return userRepository.findByKeycloakId(keycloakId)
                .orElseGet(() -> createUser(keycloakId));
    }

    private User createUser(String keycloakId) {
        User user = new User();
        user.setKeycloakId(keycloakId);
        user = userRepository.save(user);

        UserSettings settings = new UserSettings();
        settings.setUser(user);
        userSettingsRepository.save(settings);

        UserStats stats = new UserStats();
        stats.setUser(user);
        userStatsRepository.save(stats);

        ProblemList defaultList = new ProblemList();
        defaultList.setUser(user);
        defaultList.setName("My Problems");
        defaultList.setDefault(true);
        problemListRepository.save(defaultList);

        UserProfile profile = new UserProfile();
        profile.setUser(user);
        userProfileRepository.save(profile);

        return user;
    }
}
