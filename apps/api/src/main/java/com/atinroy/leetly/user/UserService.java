package com.atinroy.leetly.user;

import com.atinroy.leetly.common.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final UserStatsRepository userStatsRepository;
    private final ProblemListRepository problemListRepository;

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

        return user;
    }
}
