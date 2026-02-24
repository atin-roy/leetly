package com.atinroy.leetly.user;

import com.atinroy.leetly.common.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        profile.setProgressPublic(request.progressPublic());
        profile.setStreakPublic(request.streakPublic());
        profile.setListsPublic(request.listsPublic());
        profile.setNotesPublic(request.notesPublic());
        return userProfileRepository.save(profile);
    }
}
