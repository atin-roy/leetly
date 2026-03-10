package com.atinroy.leetly.user.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import com.atinroy.leetly.user.model.User;
import com.atinroy.leetly.user.model.UserSettings;

@Repository
public interface UserSettingsRepository extends JpaRepository<UserSettings, Long> {

    @EntityGraph(attributePaths = "theme")
    Optional<UserSettings> findByUser(User user);
}
