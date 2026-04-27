package com.atinroy.leetly.user.service;

import com.atinroy.leetly.note.model.Note;
import com.atinroy.leetly.note.repository.NoteRepository;
import com.atinroy.leetly.problem.model.Problem;
import com.atinroy.leetly.problem.model.ProblemStatus;
import com.atinroy.leetly.user.dto.PublicNoteDto;
import com.atinroy.leetly.user.dto.PublicProblemListDto;
import com.atinroy.leetly.user.dto.PublicUserProfileDto;
import com.atinroy.leetly.user.dto.PublicUserStatsDto;
import com.atinroy.leetly.user.model.ProblemList;
import com.atinroy.leetly.user.model.User;
import com.atinroy.leetly.user.model.UserProfile;
import com.atinroy.leetly.user.model.UserStats;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class PublicProfileService {

    private final UserService userService;
    private final FriendshipService friendshipService;
    private final StatsService statsService;
    private final ProblemListService problemListService;
    private final NoteRepository noteRepository;

    public PublicUserProfileDto getProfile(User viewer, long userId) {
        User subject = userService.findById(userId);
        UserProfile profile = subject.getProfile();
        boolean ownProfile = viewer.getId().equals(subject.getId());
        FriendshipService.FriendshipView friendshipView = friendshipService.getFriendshipView(viewer, subject);

        boolean showStats = ownProfile || (profile != null && profile.isProgressPublic());
        boolean showLists = ownProfile || (profile != null && profile.isListsPublic());
        boolean showNotes = ownProfile || (profile != null && profile.isNotesPublic());

        PublicUserStatsDto stats = showStats ? toPublicStats(statsService.getByUser(subject)) : null;
        List<PublicProblemListDto> lists = showLists
                ? problemListService.findByUser(subject).stream().map(this::toPublicList).toList()
                : List.of();
        List<PublicNoteDto> notes = showNotes
                ? noteRepository.findTop6ByUserOrderByDateTimeDesc(subject).stream().map(this::toPublicNote).toList()
                : List.of();

        return new PublicUserProfileDto(
                subject.getId(),
                subject.getUsername(),
                resolveDisplayName(subject),
                profile != null ? profile.getBio() : null,
                profile != null ? profile.getAvatarDataUrl() : null,
                profile != null ? profile.getLeetcodeUrl() : null,
                profile != null ? profile.getGithubUrl() : null,
                ownProfile,
                profile != null && profile.isProgressPublic(),
                profile != null && profile.isStreakPublic(),
                profile != null && profile.isListsPublic(),
                profile != null && profile.isNotesPublic(),
                friendshipView.state(),
                friendshipView.requestId(),
                stats,
                lists,
                notes
        );
    }

    private PublicUserStatsDto toPublicStats(UserStats stats) {
        return new PublicUserStatsDto(
                stats.getTotalSolved(),
                stats.getTotalSolvedWithHelp(),
                stats.getTotalMastered(),
                stats.getTotalAttempts(),
                stats.getCurrentStreak(),
                stats.getLongestStreak(),
                stats.getSolvedThisWeek(),
                stats.getSolvedThisMonth(),
                stats.getDistinctTopicsCovered(),
                stats.getDistinctPatternsCovered()
        );
    }

    private PublicProblemListDto toPublicList(ProblemList list) {
        int completed = 0;
        int remaining = 0;
        int mastered = 0;

        for (Problem problem : list.getProblems()) {
            ProblemStatus status = problem.getStatus();
            if (status == ProblemStatus.MASTERED) {
                mastered++;
                completed++;
            } else if (status == ProblemStatus.SOLVED || status == ProblemStatus.SOLVED_WITH_HELP) {
                completed++;
            } else {
                remaining++;
            }
        }

        return new PublicProblemListDto(
                list.getId(),
                list.getName(),
                list.isDefault(),
                list.getProblems().size(),
                completed,
                remaining,
                mastered
        );
    }

    private PublicNoteDto toPublicNote(Note note) {
        return new PublicNoteDto(
                note.getId(),
                note.getProblem() != null ? note.getProblem().getId() : null,
                note.getDateTime(),
                note.getTag(),
                note.getTitle(),
                note.getContent()
        );
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
}
