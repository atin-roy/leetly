package com.atinroy.leetly.user.service;

import com.atinroy.leetly.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.atinroy.leetly.user.dto.UpdateProfileRequest;
import com.atinroy.leetly.user.model.User;
import com.atinroy.leetly.user.model.UserProfile;
import com.atinroy.leetly.user.repository.UserProfileRepository;

@Service
@Transactional
@RequiredArgsConstructor
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;

    @Transactional(readOnly = true)
    public UserProfile getByUser(User user) {
        return userProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user: " + user.getId()));
    }

    public UserProfile update(User user, UpdateProfileRequest request) {
        UserProfile profile = getByUser(user);
        profile.setDisplayName(request.displayName());
        profile.setBio(request.bio());
        profile.setAvatarDataUrl(blankToNull(request.avatarDataUrl()));
        profile.setLeetcodeUrl(blankToNull(request.leetcodeUrl()));
        profile.setGithubUrl(blankToNull(request.githubUrl()));
        profile.setProgressPublic(request.progressPublic());
        profile.setStreakPublic(request.streakPublic());
        profile.setListsPublic(request.listsPublic());
        profile.setNotesPublic(request.notesPublic());
        return userProfileRepository.save(profile);
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
