package com.atinroy.leetly.user.model;

import com.atinroy.leetly.common.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "friendships",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_friendships_pair", columnNames = {"user_one_id", "user_two_id"})
        },
        indexes = {
                @Index(name = "idx_friendships_user_one", columnList = "user_one_id"),
                @Index(name = "idx_friendships_user_two", columnList = "user_two_id"),
                @Index(name = "idx_friendships_status", columnList = "status")
        })
public class Friendship extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_one_id", nullable = false)
    private User userOne;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_two_id", nullable = false)
    private User userTwo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by_id", nullable = false)
    private User requestedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FriendshipStatus status = FriendshipStatus.PENDING;

    public User otherUser(User user) {
        if (userOne != null && userOne.getId().equals(user.getId())) {
            return userTwo;
        }
        return userOne;
    }
}
