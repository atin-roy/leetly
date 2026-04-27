package com.atinroy.leetly.user.repository;

import com.atinroy.leetly.user.model.Friendship;
import com.atinroy.leetly.user.model.FriendshipStatus;
import com.atinroy.leetly.user.model.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface FriendshipRepository extends JpaRepository<Friendship, Long> {

    @EntityGraph(attributePaths = {"userOne", "userOne.profile", "userTwo", "userTwo.profile", "requestedBy"})
    Optional<Friendship> findByUserOneAndUserTwo(User userOne, User userTwo);

    @EntityGraph(attributePaths = {"userOne", "userOne.profile", "userTwo", "userTwo.profile", "requestedBy"})
    @Query("""
            select f from Friendship f
            where (f.userOne = :user or f.userTwo = :user)
              and f.status = :status
            order by f.lastModifiedDate desc
            """)
    List<Friendship> findByUserAndStatus(@Param("user") User user, @Param("status") FriendshipStatus status);

    @EntityGraph(attributePaths = {"userOne", "userOne.profile", "userTwo", "userTwo.profile", "requestedBy"})
    @Query("""
            select f from Friendship f
            where (f.userOne = :user and f.userTwo.id in :candidateIds)
               or (f.userTwo = :user and f.userOne.id in :candidateIds)
            """)
    List<Friendship> findBetweenUserAndCandidateIds(@Param("user") User user, @Param("candidateIds") Collection<Long> candidateIds);

    @EntityGraph(attributePaths = {"userOne", "userOne.profile", "userTwo", "userTwo.profile", "requestedBy"})
    Optional<Friendship> findByIdAndStatus(Long id, FriendshipStatus status);
}
