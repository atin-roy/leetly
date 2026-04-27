package com.atinroy.leetly.note.repository;

import com.atinroy.leetly.problem.model.Problem;
import com.atinroy.leetly.user.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import com.atinroy.leetly.note.model.Note;
import com.atinroy.leetly.note.model.NoteTag;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {

    Page<Note> findAllByUser(User user, Pageable pageable);

    List<Note> findByProblemAndUser(Problem problem, User user);

    List<Note> findByTagAndUser(NoteTag tag, User user);

    Optional<Note> findByIdAndUser(long id, User user);

    List<Note> findTop6ByUserOrderByDateTimeDesc(User user);
}
