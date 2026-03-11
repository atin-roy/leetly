package com.atinroy.leetly.user.service;

import com.atinroy.leetly.common.exception.ConflictException;
import com.atinroy.leetly.common.exception.ResourceNotFoundException;
import com.atinroy.leetly.problem.model.Problem;
import com.atinroy.leetly.problem.repository.ProblemRepository;
import com.atinroy.leetly.problem.service.ProblemSpecification;
import com.atinroy.leetly.problem.service.ProblemService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import com.atinroy.leetly.user.model.ProblemList;
import com.atinroy.leetly.user.model.User;
import com.atinroy.leetly.user.repository.ProblemListRepository;

@Service
@Transactional
@RequiredArgsConstructor
public class ProblemListService {

    private final ProblemListRepository problemListRepository;
    private final ProblemRepository problemRepository;
    private final ProblemService problemService;

    @Transactional(readOnly = true)
    public List<ProblemList> findByUser(User user) {
        return problemListRepository.findByUser(user);
    }

    @Transactional(readOnly = true)
    public ProblemList getDefaultList(User user) {
        return problemListRepository.findByUserAndIsDefaultTrue(user)
                .orElseThrow(() -> new ResourceNotFoundException("Default problem list not found for user: " + user.getId()));
    }

    @Transactional(readOnly = true)
    public ProblemList findByIdAndUser(long id, User user) {
        return problemListRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("ProblemList not found: " + id));
    }

    @Transactional(readOnly = true)
    public Page<Problem> findProblems(
            long listId,
            User user,
            Pageable pageable,
            String difficulty,
            String status,
            Long topicId,
            Long patternId,
            String search
    ) {
        ProblemList list = findByIdAndUser(listId, user);
        List<Long> problemIds = list.getProblems().stream().map(Problem::getId).toList();

        if (problemIds.isEmpty()) {
            return Page.empty(pageable);
        }

        Specification<Problem> filters = ProblemSpecification.buildSpec(difficulty, status, topicId, patternId, search);
        Specification<Problem> inList = (root, query, cb) -> root.get("id").in(problemIds);

        return problemRepository.findAll(inList.and(filters), normalizeSort(pageable));
    }

    public ProblemList create(User user, String name) {
        ProblemList list = new ProblemList();
        list.setUser(user);
        list.setName(name);
        list.setDefault(false);
        return problemListRepository.save(list);
    }

    public void delete(long id, User user) {
        ProblemList list = findByIdAndUser(id, user);
        if (list.isDefault()) {
            throw new ConflictException("Cannot delete the default problem list");
        }
        problemListRepository.delete(list);
    }

    public ProblemList addProblem(long listId, long problemId, User user) {
        ProblemList list = findByIdAndUser(listId, user);
        Problem problem = problemService.findById(problemId, user);
        if (!list.getProblems().contains(problem)) {
            list.getProblems().add(problem);
        }
        return problemListRepository.save(list);
    }

    public ProblemList removeProblem(long listId, long problemId, User user) {
        ProblemList list = findByIdAndUser(listId, user);
        list.getProblems().removeIf(p -> p.getId().equals(problemId));
        return problemListRepository.save(list);
    }

    private Pageable normalizeSort(Pageable pageable) {
        List<Sort.Order> orders = new ArrayList<>();
        pageable.getSort().forEach((order) -> orders.add(normalizeOrder(order)));

        if (orders.isEmpty()) {
            return pageable;
        }

        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(orders));
    }

    private Sort.Order normalizeOrder(Sort.Order order) {
        if (!"lastAttemptedAt".equals(order.getProperty())) {
            return order;
        }

        return order.isAscending() ? order.nullsFirst() : order.nullsLast();
    }
}
