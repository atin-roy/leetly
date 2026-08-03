package com.atinroy.leetly.user.service;

import com.atinroy.leetly.common.exception.ConflictException;
import com.atinroy.leetly.common.exception.ResourceNotFoundException;
import com.atinroy.leetly.note.model.Note;
import com.atinroy.leetly.note.service.NoteService;
import com.atinroy.leetly.problem.model.Problem;
import com.atinroy.leetly.problem.service.ProblemService;
import com.atinroy.leetly.user.dto.FriendshipState;
import com.atinroy.leetly.user.model.ProblemList;
import com.atinroy.leetly.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Friends can only see summaries of each other's lists and notes
 * (see PublicProfileService); reading the actual contents requires an explicit
 * import, which copies the data into the viewer's own account as an
 * independent record rather than granting live access to the original.
 */
@Service
@Transactional
@RequiredArgsConstructor
public class ImportService {

    private final UserService userService;
    private final FriendshipService friendshipService;
    private final ProblemListService problemListService;
    private final NoteService noteService;
    private final ProblemService problemService;

    public ProblemList importList(User viewer, long ownerId, long listId) {
        User owner = requireFriend(viewer, ownerId);
        ProblemList source = problemListService.findByIdAndUser(listId, owner);

        ProblemList imported = problemListService.create(viewer, source.getName());
        for (Problem sourceProblem : source.getProblems()) {
            Problem ownProblem = problemService.findOrCloneForUser(sourceProblem, viewer);
            imported = problemListService.addProblem(imported.getId(), ownProblem.getId(), viewer);
        }
        return imported;
    }

    public Note importNote(User viewer, long ownerId, long noteId) {
        User owner = requireFriend(viewer, ownerId);
        Note source = noteService.findById(noteId, owner);

        Long importedProblemId = null;
        if (source.getProblem() != null) {
            importedProblemId = problemService.findOrCloneForUser(source.getProblem(), viewer).getId();
        }

        return noteService.create(viewer, importedProblemId, source.getTag(), source.getTitle(), source.getContent());
    }

    private User requireFriend(User viewer, long ownerId) {
        User owner = userService.findById(ownerId);
        if (viewer.getId().equals(owner.getId())) {
            throw new ConflictException("Cannot import your own list or note");
        }
        FriendshipService.FriendshipView view = friendshipService.getFriendshipView(viewer, owner);
        if (view.state() != FriendshipState.FRIENDS) {
            throw new ResourceNotFoundException("User not found: " + ownerId);
        }
        return owner;
    }
}
