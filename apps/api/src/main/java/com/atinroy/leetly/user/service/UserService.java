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
    public User findBySubjectId(String subjectId) {
        return userRepository.findBySubjectId(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + subjectId));
    }

    @Transactional(readOnly = true)
    public User findById(long id) {
        return userRepository.findWithProfileById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    /**
     * Resolves the user a token belongs to. Accounts are created only by
     * registration, so a subject with no row is an authentication failure
     * rather than a reason to provision a new account.
     */
    @Transactional(readOnly = true)
    public User requireBySubject(String subjectId) {
        return userRepository.findBySubjectId(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + subjectId));
    }

    @Transactional(readOnly = true)
    public User requireBySubject(Jwt jwt) {
        return requireBySubject(jwt.getSubject());
    }

    /** Creates a user together with the rows every account is expected to have. */
    public User provision(String subjectId, String email, String username, String passwordHash) {
        User user = new User();
        user.setSubjectId(subjectId);
        user.setEmail(email);
        user.setUsername(username);
        user.setPasswordHash(passwordHash);
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
