package com.atinroy.leetly.user.repository;

import com.atinroy.leetly.user.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByKeycloakId(String keycloakId);

    @EntityGraph(attributePaths = {"profile"})
    Optional<User> findWithProfileById(Long id);

    @EntityGraph(attributePaths = {"profile"})
    @Query("""
            select u from User u
            left join u.profile p
            where u.id <> :viewerId
              and (
                :search is null
                or lower(coalesce(p.displayName, '')) like lower(concat('%', :search, '%'))
                or lower(coalesce(u.username, '')) like lower(concat('%', :search, '%'))
              )
            order by
              case when p.displayName is null or p.displayName = '' then 1 else 0 end,
              lower(coalesce(p.displayName, u.username, u.keycloakId)) asc
            """)
    Page<User> searchForDirectory(@Param("viewerId") Long viewerId, @Param("search") String search, Pageable pageable);
}
