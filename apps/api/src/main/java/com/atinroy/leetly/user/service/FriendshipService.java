package com.atinroy.leetly.user.service;

import com.atinroy.leetly.common.exception.ConflictException;
import com.atinroy.leetly.common.exception.ResourceNotFoundException;
import com.atinroy.leetly.user.dto.FriendOverviewDto;
import com.atinroy.leetly.user.dto.FriendshipState;
import com.atinroy.leetly.user.dto.SocialUserDto;
import com.atinroy.leetly.user.model.Friendship;
import com.atinroy.leetly.user.model.FriendshipStatus;
import com.atinroy.leetly.user.model.User;
import com.atinroy.leetly.user.model.UserProfile;
import com.atinroy.leetly.user.repository.FriendshipRepository;
import com.atinroy.leetly.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
@RequiredArgsConstructor
public class FriendshipService {

    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public Page<SocialUserDto> discoverUsers(User viewer, String search, Pageable pageable) {
        String normalizedSearch = search == null || search.isBlank() ? null : search.trim();
        Page<User> page = userRepository.searchForDirectory(viewer.getId(), normalizedSearch, pageable);
        Map<Long, Friendship> friendships = friendshipMap(viewer, page.getContent().stream().map(User::getId).toList());
        return page.map(user -> toSocialUserDto(user, resolveState(viewer, user, friendships.get(user.getId()))));
    }

    @Transactional(readOnly = true)
    public FriendOverviewDto getOverview(User viewer) {
        List<SocialUserDto> friends = friendshipRepository.findByUserAndStatus(viewer, FriendshipStatus.ACCEPTED).stream()
                .map(friendship -> toSocialUserDto(friendship.otherUser(viewer), new FriendshipView(FriendshipState.FRIENDS, friendship.getId())))
                .sorted(Comparator.comparing(SocialUserDto::displayName, String.CASE_INSENSITIVE_ORDER))
                .toList();

        List<SocialUserDto> incoming = friendshipRepository.findByUserAndStatus(viewer, FriendshipStatus.PENDING).stream()
                .filter(friendship -> !friendship.getRequestedBy().getId().equals(viewer.getId()))
                .map(friendship -> toSocialUserDto(friendship.otherUser(viewer), new FriendshipView(FriendshipState.INCOMING_REQUEST, friendship.getId())))
                .sorted(Comparator.comparing(SocialUserDto::displayName, String.CASE_INSENSITIVE_ORDER))
                .toList();

        List<SocialUserDto> outgoing = friendshipRepository.findByUserAndStatus(viewer, FriendshipStatus.PENDING).stream()
                .filter(friendship -> friendship.getRequestedBy().getId().equals(viewer.getId()))
                .map(friendship -> toSocialUserDto(friendship.otherUser(viewer), new FriendshipView(FriendshipState.OUTGOING_REQUEST, friendship.getId())))
                .sorted(Comparator.comparing(SocialUserDto::displayName, String.CASE_INSENSITIVE_ORDER))
                .toList();

        return new FriendOverviewDto(friends, incoming, outgoing);
    }

    public Friendship sendRequest(User requester, long targetUserId) {
        User target = userService.findById(targetUserId);
        if (requester.getId().equals(target.getId())) {
            throw new ConflictException("You cannot send a friend request to yourself");
        }

        Friendship friendship = getOrCreatePair(requester, target);
        if (friendship.getId() != null) {
            if (friendship.getStatus() == FriendshipStatus.ACCEPTED) {
                throw new ConflictException("You are already friends");
            }
            if (friendship.getStatus() == FriendshipStatus.PENDING) {
                if (friendship.getRequestedBy().getId().equals(requester.getId())) {
                    throw new ConflictException("Friend request already sent");
                }
                throw new ConflictException("This user has already sent you a friend request");
            }
        }

        friendship.setRequestedBy(requester);
        friendship.setStatus(FriendshipStatus.PENDING);
        return friendshipRepository.save(friendship);
    }

    public Friendship acceptRequest(User viewer, long friendshipId) {
        Friendship friendship = friendshipRepository.findByIdAndStatus(friendshipId, FriendshipStatus.PENDING)
                .orElseThrow(() -> new ResourceNotFoundException("Friend request not found: " + friendshipId));

        if (friendship.getRequestedBy().getId().equals(viewer.getId())) {
            throw new ConflictException("You cannot accept your own outgoing request");
        }
        ensureParticipant(viewer, friendship);

        friendship.setStatus(FriendshipStatus.ACCEPTED);
        return friendshipRepository.save(friendship);
    }

    public Friendship declineRequest(User viewer, long friendshipId) {
        Friendship friendship = friendshipRepository.findByIdAndStatus(friendshipId, FriendshipStatus.PENDING)
                .orElseThrow(() -> new ResourceNotFoundException("Friend request not found: " + friendshipId));

        if (friendship.getRequestedBy().getId().equals(viewer.getId())) {
            throw new ConflictException("Use cancel for your own outgoing request");
        }
        ensureParticipant(viewer, friendship);

        friendship.setStatus(FriendshipStatus.DECLINED);
        return friendshipRepository.save(friendship);
    }

    public Friendship cancelOutgoingRequest(User viewer, long friendshipId) {
        Friendship friendship = friendshipRepository.findByIdAndStatus(friendshipId, FriendshipStatus.PENDING)
                .orElseThrow(() -> new ResourceNotFoundException("Friend request not found: " + friendshipId));

        if (!friendship.getRequestedBy().getId().equals(viewer.getId())) {
            throw new ConflictException("Only the sender can cancel this request");
        }
        ensureParticipant(viewer, friendship);

        friendship.setStatus(FriendshipStatus.CANCELLED);
        return friendshipRepository.save(friendship);
    }

    public void unfriend(User viewer, long targetUserId) {
        User target = userService.findById(targetUserId);
        Friendship friendship = findPair(viewer, target)
                .orElseThrow(() -> new ResourceNotFoundException("Friendship not found"));

        if (friendship.getStatus() != FriendshipStatus.ACCEPTED) {
            throw new ConflictException("Users are not currently friends");
        }

        friendshipRepository.delete(friendship);
    }

    @Transactional(readOnly = true)
    public FriendshipView getFriendshipView(User viewer, User subject) {
        if (viewer.getId().equals(subject.getId())) {
            return new FriendshipView(FriendshipState.SELF, null);
        }
        Friendship friendship = findPair(viewer, subject).orElse(null);
        return resolveState(viewer, subject, friendship);
    }

    private Map<Long, Friendship> friendshipMap(User viewer, List<Long> candidateIds) {
        if (candidateIds.isEmpty()) {
            return Map.of();
        }

        Map<Long, Friendship> mapped = new HashMap<>();
        for (Friendship friendship : friendshipRepository.findBetweenUserAndCandidateIds(viewer, candidateIds)) {
            mapped.put(friendship.otherUser(viewer).getId(), friendship);
        }
        return mapped;
    }

    private FriendshipView resolveState(User viewer, User subject, Friendship friendship) {
        if (viewer.getId().equals(subject.getId())) {
            return new FriendshipView(FriendshipState.SELF, null);
        }
        if (friendship == null || friendship.getStatus() == FriendshipStatus.CANCELLED || friendship.getStatus() == FriendshipStatus.DECLINED) {
            return new FriendshipView(FriendshipState.NONE, null);
        }
        if (friendship.getStatus() == FriendshipStatus.ACCEPTED) {
            return new FriendshipView(FriendshipState.FRIENDS, friendship.getId());
        }
        if (friendship.getRequestedBy().getId().equals(viewer.getId())) {
            return new FriendshipView(FriendshipState.OUTGOING_REQUEST, friendship.getId());
        }
        return new FriendshipView(FriendshipState.INCOMING_REQUEST, friendship.getId());
    }

    private SocialUserDto toSocialUserDto(User user, FriendshipView friendshipView) {
        UserProfile profile = user.getProfile();
        return new SocialUserDto(
                user.getId(),
                user.getUsername(),
                resolveDisplayName(user),
                profile != null ? profile.getAvatarDataUrl() : null,
                profile != null ? profile.getBio() : null,
                friendshipView.state(),
                friendshipView.requestId()
        );
    }

    private Friendship getOrCreatePair(User left, User right) {
        User first = left.getId() < right.getId() ? left : right;
        User second = left.getId() < right.getId() ? right : left;
        return friendshipRepository.findByUserOneAndUserTwo(first, second)
                .orElseGet(() -> {
                    Friendship friendship = new Friendship();
                    friendship.setUserOne(first);
                    friendship.setUserTwo(second);
                    friendship.setRequestedBy(left);
                    return friendship;
                });
    }

    private java.util.Optional<Friendship> findPair(User left, User right) {
        User first = left.getId() < right.getId() ? left : right;
        User second = left.getId() < right.getId() ? right : left;
        return friendshipRepository.findByUserOneAndUserTwo(first, second);
    }

    private void ensureParticipant(User viewer, Friendship friendship) {
        if (!friendship.getUserOne().getId().equals(viewer.getId()) && !friendship.getUserTwo().getId().equals(viewer.getId())) {
            throw new ResourceNotFoundException("Friend request not found");
        }
    }

    private String resolveDisplayName(User user) {
        UserProfile profile = user.getProfile();
        if (profile != null && profile.getDisplayName() != null && !profile.getDisplayName().isBlank()) {
            return profile.getDisplayName().trim();
        }
        if (user.getUsername() != null && !user.getUsername().isBlank()) {
            return user.getUsername().trim();
        }
        return "User " + user.getId();
    }

    public record FriendshipView(FriendshipState state, Long requestId) {}
}
