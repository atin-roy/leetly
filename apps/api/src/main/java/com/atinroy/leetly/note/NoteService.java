package com.atinroy.leetly.note;

import com.atinroy.leetly.common.ResourceNotFoundException;
import com.atinroy.leetly.problem.Problem;
import com.atinroy.leetly.problem.ProblemService;
import com.atinroy.leetly.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository noteRepository;
    private final ProblemService problemService;

    @Transactional(readOnly = true)
    public Page<Note> findAll(User user, Pageable pageable) {
        return noteRepository.findAllByUser(user, pageable);
    }

    @Transactional(readOnly = true)
    public Note findById(long id, User user) {
        return noteRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found: " + id));
    }

    @Transactional(readOnly = true)
    public List<Note> findByProblem(long problemId, User user) {
        Problem problem = problemService.findById(problemId);
        return noteRepository.findByProblemAndUser(problem, user);
    }

    @Transactional(readOnly = true)
    public List<Note> findByTag(NoteTag tag, User user) {
        return noteRepository.findByTagAndUser(tag, user);
    }

    public Note create(User user, Long problemId, NoteTag tag, String title, String content) {
        Note note = new Note();
        note.setUser(user);
        if (problemId != null) {
            note.setProblem(problemService.findById(problemId));
        }
        note.setTag(tag);
        note.setTitle(title);
        note.setContent(content);
        note.setDateTime(LocalDateTime.now());
        return noteRepository.save(note);
    }

    public Note update(long id, User user, NoteTag tag, String title, String content) {
        Note note = findById(id, user);
        note.setTag(tag);
        note.setTitle(title);
        note.setContent(content);
        return noteRepository.save(note);
    }

    public void delete(long id, User user) {
        Note note = findById(id, user);
        noteRepository.delete(note);
    }
}
