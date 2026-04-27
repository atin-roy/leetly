package com.atinroy.leetly.user.service;

import com.atinroy.leetly.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.oauth2.jwt.Jwt;
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

    @Transactional(readOnly = true)
    public User findById(long id) {
        return userRepository.findWithProfileById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    public User getOrCreate(String keycloakId) {
        return userRepository.findByKeycloakId(keycloakId)
                .orElseGet(() -> createUser(keycloakId));
    }

    public User getOrCreate(Jwt jwt) {
        User user = userRepository.findByKeycloakId(jwt.getSubject())
                .orElseGet(() -> createUser(jwt.getSubject()));
        syncIdentity(user, jwt);
        return user;
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

    private void syncIdentity(User user, Jwt jwt) {
        boolean changed = false;

        String username = blankToNull(jwt.getClaimAsString("preferred_username"));
        if (!equalsOrNull(user.getUsername(), username)) {
            user.setUsername(username);
            changed = true;
        }

        String email = blankToNull(jwt.getClaimAsString("email"));
        if (!equalsOrNull(user.getEmail(), email)) {
            user.setEmail(email);
            changed = true;
        }

        if (changed) {
            userRepository.save(user);
        }
    }

    private boolean equalsOrNull(String left, String right) {
        if (left == null) return right == null;
        return left.equals(right);
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
