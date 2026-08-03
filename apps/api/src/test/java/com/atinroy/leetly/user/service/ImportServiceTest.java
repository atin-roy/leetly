package com.atinroy.leetly.user.service;

import com.atinroy.leetly.common.exception.ConflictException;
import com.atinroy.leetly.common.exception.ResourceNotFoundException;
import com.atinroy.leetly.note.model.Note;
import com.atinroy.leetly.note.model.NoteTag;
import com.atinroy.leetly.note.service.NoteService;
import com.atinroy.leetly.problem.model.Difficulty;
import com.atinroy.leetly.problem.model.Problem;
import com.atinroy.leetly.problem.model.ProblemStatus;
import com.atinroy.leetly.problem.service.ProblemService;
import com.atinroy.leetly.user.dto.FriendshipState;
import com.atinroy.leetly.user.model.ProblemList;
import com.atinroy.leetly.user.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ImportServiceTest {

    @Mock
    UserService userService;

    @Mock
    FriendshipService friendshipService;

    @Mock
    ProblemListService problemListService;

    @Mock
    NoteService noteService;

    @Mock
    ProblemService problemService;

    ImportService importService;

    @BeforeEach
    void setUp() {
        importService = new ImportService(userService, friendshipService, problemListService, noteService, problemService);
    }

    @Test
    void importList_rejectsNonFriend() {
        User viewer = user(1L);
        User owner = user(2L);
        when(userService.findById(2L)).thenReturn(owner);
        when(friendshipService.getFriendshipView(viewer, owner))
                .thenReturn(new FriendshipService.FriendshipView(FriendshipState.NONE, null));

        assertThatThrownBy(() -> importService.importList(viewer, 2L, 10L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void importList_rejectsImportingOwnList() {
        User viewer = user(1L);
        when(userService.findById(1L)).thenReturn(viewer);

        assertThatThrownBy(() -> importService.importList(viewer, 1L, 10L))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void importList_clonesProblemsAndCopiesListForFriend() {
        User viewer = user(1L);
        User owner = user(2L);
        when(userService.findById(2L)).thenReturn(owner);
        when(friendshipService.getFriendshipView(viewer, owner))
                .thenReturn(new FriendshipService.FriendshipView(FriendshipState.FRIENDS, 99L));

        Problem sourceProblem = problem(50L, 1L);
        ProblemList source = new ProblemList();
        source.setId(10L);
        source.setUser(owner);
        source.setName("Grind 75");
        source.setProblems(List.of(sourceProblem));
        when(problemListService.findByIdAndUser(10L, owner)).thenReturn(source);

        ProblemList imported = new ProblemList();
        imported.setId(20L);
        imported.setUser(viewer);
        imported.setName("Grind 75");
        when(problemListService.create(viewer, "Grind 75")).thenReturn(imported);

        Problem clonedProblem = problem(60L, 1L);
        when(problemService.findOrCloneForUser(sourceProblem, viewer)).thenReturn(clonedProblem);
        when(problemListService.addProblem(20L, 60L, viewer)).thenReturn(imported);

        ProblemList result = importService.importList(viewer, 2L, 10L);

        assertThat(result).isEqualTo(imported);
        verify(problemListService).addProblem(20L, 60L, viewer);
    }

    @Test
    void importNote_copiesContentAndMapsProblemForFriend() {
        User viewer = user(1L);
        User owner = user(2L);
        when(userService.findById(2L)).thenReturn(owner);
        when(friendshipService.getFriendshipView(viewer, owner))
                .thenReturn(new FriendshipService.FriendshipView(FriendshipState.FRIENDS, 99L));

        Problem sourceProblem = problem(50L, 1L);
        Note source = new Note();
        source.setId(30L);
        source.setUser(owner);
        source.setProblem(sourceProblem);
        source.setTag(NoteTag.STRATEGY);
        source.setTitle("Two pointer trick");
        source.setContent("Shrink from both ends");
        source.setDateTime(LocalDateTime.now());
        when(noteService.findById(30L, owner)).thenReturn(source);

        Problem clonedProblem = problem(60L, 1L);
        when(problemService.findOrCloneForUser(sourceProblem, viewer)).thenReturn(clonedProblem);

        Note imported = new Note();
        imported.setId(40L);
        when(noteService.create(viewer, 60L, NoteTag.STRATEGY, "Two pointer trick", "Shrink from both ends"))
                .thenReturn(imported);

        Note result = importService.importNote(viewer, 2L, 30L);

        assertThat(result).isEqualTo(imported);
    }

    private User user(Long id) {
        User user = new User();
        user.setId(id);
        return user;
    }

    private Problem problem(Long id, long leetcodeId) {
        Problem problem = new Problem();
        problem.setId(id);
        problem.setLeetcodeId(leetcodeId);
        problem.setTitle("Two Sum");
        problem.setUrl("https://leetcode.com/problems/two-sum/");
        problem.setDifficulty(Difficulty.EASY);
        problem.setStatus(ProblemStatus.SOLVED);
        return problem;
    }
}
