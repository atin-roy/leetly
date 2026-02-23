package com.atinroy.leetly.note;

import com.atinroy.leetly.problem.Problem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {

    List<Note> findByProblem(Problem problem);

    List<Note> findByTag(NoteTag tag);
}
