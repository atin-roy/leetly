package com.atinroy.leetly.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import com.atinroy.leetly.user.model.User;
import com.atinroy.leetly.user.model.UserProfile;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    Optional<UserProfile> findByUser(User user);
}
