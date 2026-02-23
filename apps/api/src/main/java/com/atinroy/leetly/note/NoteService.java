package com.atinroy.leetly.note;

import com.atinroy.leetly.problem.Problem;
import com.atinroy.leetly.problem.ProblemService;
import lombok.RequiredArgsConstructor;
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
    public List<Note> findAll() {
        return noteRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Note findById(long id) {
        return noteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Note not found: " + id));
    }

    @Transactional(readOnly = true)
    public List<Note> findByProblem(long problemId) {
        Problem problem = problemService.findById(problemId);
        return noteRepository.findByProblem(problem);
    }

    @Transactional(readOnly = true)
    public List<Note> findByTag(NoteTag tag) {
        return noteRepository.findByTag(tag);
    }

    public Note create(Long problemId, NoteTag tag, String title, String content) {
        Note note = new Note();
        if (problemId != null) {
            note.setProblem(problemService.findById(problemId));
        }
        note.setTag(tag);
        note.setTitle(title);
        note.setContent(content);
        note.setDateTime(LocalDateTime.now());
        return noteRepository.save(note);
    }

    public Note update(long id, NoteTag tag, String title, String content) {
        Note note = findById(id);
        note.setTag(tag);
        note.setTitle(title);
        note.setContent(content);
        return noteRepository.save(note);
    }

    public void delete(long id) {
        noteRepository.deleteById(id);
    }
}
