package com.atinroy.leetly.user;

import com.atinroy.leetly.problem.Problem;
import com.atinroy.leetly.problem.ProblemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ProblemListService {

    private final ProblemListRepository problemListRepository;
    private final ProblemService problemService;

    @Transactional(readOnly = true)
    public List<ProblemList> findByUser(User user) {
        return problemListRepository.findByUser(user);
    }

    @Transactional(readOnly = true)
    public ProblemList getDefaultList(User user) {
        return problemListRepository.findByUserAndIsDefaultTrue(user)
                .orElseThrow(() -> new RuntimeException("Default problem list not found for user: " + user.getId()));
    }

    @Transactional(readOnly = true)
    public ProblemList findById(long id) {
        return problemListRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ProblemList not found: " + id));
    }

    public ProblemList create(User user, String name) {
        ProblemList list = new ProblemList();
        list.setUser(user);
        list.setName(name);
        list.setDefault(false);
        return problemListRepository.save(list);
    }

    public void delete(long id) {
        ProblemList list = findById(id);
        if (list.isDefault()) {
            throw new RuntimeException("Cannot delete the default problem list");
        }
        problemListRepository.delete(list);
    }

    public ProblemList addProblem(long listId, long problemId) {
        ProblemList list = findById(listId);
        Problem problem = problemService.findById(problemId);
        if (!list.getProblems().contains(problem)) {
            list.getProblems().add(problem);
        }
        return problemListRepository.save(list);
    }

    public ProblemList removeProblem(long listId, long problemId) {
        ProblemList list = findById(listId);
        list.getProblems().removeIf(p -> p.getId().equals(problemId));
        return problemListRepository.save(list);
    }
}
