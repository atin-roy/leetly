package com.atinroy.leetly.note;

import com.atinroy.leetly.problem.Problem;
import com.atinroy.leetly.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {

    Page<Note> findAllByUser(User user, Pageable pageable);

    List<Note> findByProblemAndUser(Problem problem, User user);

    List<Note> findByTagAndUser(NoteTag tag, User user);

    Optional<Note> findByIdAndUser(long id, User user);
}
