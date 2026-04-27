package com.atinroy.leetly.user.service;

import com.atinroy.leetly.common.exception.ConflictException;
import com.atinroy.leetly.user.dto.FriendOverviewDto;
import com.atinroy.leetly.user.dto.FriendshipState;
import com.atinroy.leetly.user.model.Friendship;
import com.atinroy.leetly.user.model.FriendshipStatus;
import com.atinroy.leetly.user.model.User;
import com.atinroy.leetly.user.model.UserProfile;
import com.atinroy.leetly.user.repository.FriendshipRepository;
import com.atinroy.leetly.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FriendshipServiceTest {

    @Mock
    FriendshipRepository friendshipRepository;

    @Mock
    UserRepository userRepository;

    @Mock
    UserService userService;

    FriendshipService friendshipService;

    @BeforeEach
    void setUp() {
        friendshipService = new FriendshipService(friendshipRepository, userRepository, userService);
    }

    @Test
    void sendRequest_createsPendingFriendshipForFreshPair() {
        User viewer = user(1L, "viewer", "Viewer");
        User target = user(4L, "target", "Target");
        when(userService.findById(4L)).thenReturn(target);
        when(friendshipRepository.findByUserOneAndUserTwo(viewer, target)).thenReturn(Optional.empty());
        when(friendshipRepository.save(any(Friendship.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Friendship friendship = friendshipService.sendRequest(viewer, 4L);

        assertThat(friendship.getStatus()).isEqualTo(FriendshipStatus.PENDING);
        assertThat(friendship.getRequestedBy()).isEqualTo(viewer);
        assertThat(friendship.getUserOne()).isEqualTo(viewer);
        assertThat(friendship.getUserTwo()).isEqualTo(target);
    }

    @Test
    void sendRequest_rejectsDuplicateOutgoingRequest() {
        User viewer = user(1L, "viewer", "Viewer");
        User target = user(4L, "target", "Target");
        Friendship existing = friendship(viewer, target, viewer, FriendshipStatus.PENDING, 10L);

        when(userService.findById(4L)).thenReturn(target);
        when(friendshipRepository.findByUserOneAndUserTwo(viewer, target)).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> friendshipService.sendRequest(viewer, 4L))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("already sent");
    }

    @Test
    void acceptRequest_marksIncomingRequestAccepted() {
        User viewer = user(1L, "viewer", "Viewer");
        User target = user(4L, "target", "Target");
        Friendship existing = friendship(viewer, target, target, FriendshipStatus.PENDING, 10L);

        when(friendshipRepository.findByIdAndStatus(10L, FriendshipStatus.PENDING)).thenReturn(Optional.of(existing));
        when(friendshipRepository.save(existing)).thenReturn(existing);

        Friendship accepted = friendshipService.acceptRequest(viewer, 10L);

        assertThat(accepted.getStatus()).isEqualTo(FriendshipStatus.ACCEPTED);
    }

    @Test
    void discoverUsers_mapsFriendshipStateForResults() {
        User viewer = user(1L, "viewer", "Viewer");
        User target = user(4L, "target", "Target");
        Friendship existing = friendship(viewer, target, target, FriendshipStatus.PENDING, 10L);

        when(userRepository.searchForDirectory(1L, "tar", PageRequest.of(0, 24)))
                .thenReturn(new PageImpl<>(List.of(target), PageRequest.of(0, 24), 1));
        when(friendshipRepository.findBetweenUserAndCandidateIds(viewer, List.of(4L))).thenReturn(List.of(existing));

        var page = friendshipService.discoverUsers(viewer, "tar", PageRequest.of(0, 24));

        assertThat(page.getContent()).singleElement().satisfies(user -> {
            assertThat(user.displayName()).isEqualTo("Target");
            assertThat(user.friendshipState()).isEqualTo(FriendshipState.INCOMING_REQUEST);
            assertThat(user.friendshipRequestId()).isEqualTo(10L);
        });
    }

    @Test
    void getOverview_splitsFriendsAndPendingDirections() {
        User viewer = user(1L, "viewer", "Viewer");
        User acceptedTarget = user(2L, "ally", "Ally");
        User incomingTarget = user(3L, "coach", "Coach");
        User outgoingTarget = user(4L, "peer", "Peer");

        when(friendshipRepository.findByUserAndStatus(viewer, FriendshipStatus.ACCEPTED))
                .thenReturn(List.of(friendship(viewer, acceptedTarget, viewer, FriendshipStatus.ACCEPTED, 21L)));
        when(friendshipRepository.findByUserAndStatus(viewer, FriendshipStatus.PENDING))
                .thenReturn(List.of(
                        friendship(viewer, incomingTarget, incomingTarget, FriendshipStatus.PENDING, 31L),
                        friendship(viewer, outgoingTarget, viewer, FriendshipStatus.PENDING, 41L)
                ));

        FriendOverviewDto overview = friendshipService.getOverview(viewer);

        assertThat(overview.friends()).extracting("displayName").containsExactly("Ally");
        assertThat(overview.incomingRequests()).extracting("displayName").containsExactly("Coach");
        assertThat(overview.outgoingRequests()).extracting("displayName").containsExactly("Peer");
        verify(friendshipRepository).findByUserAndStatus(viewer, FriendshipStatus.ACCEPTED);
    }

    private Friendship friendship(User left, User right, User requestedBy, FriendshipStatus status, Long id) {
        Friendship friendship = new Friendship();
        friendship.setId(id);
        friendship.setUserOne(left.getId() < right.getId() ? left : right);
        friendship.setUserTwo(left.getId() < right.getId() ? right : left);
        friendship.setRequestedBy(requestedBy);
        friendship.setStatus(status);
        return friendship;
    }

    private User user(Long id, String username, String displayName) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);

        UserProfile profile = new UserProfile();
        profile.setDisplayName(displayName);
        profile.setBio(displayName + " bio");
        user.setProfile(profile);
        return user;
    }
}
