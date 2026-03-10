package com.atinroy.leetly.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.atinroy.leetly.user.model.Theme;

@Repository
public interface ThemeRepository extends JpaRepository<Theme, Long> {
}
