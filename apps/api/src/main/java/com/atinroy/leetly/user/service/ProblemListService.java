package com.atinroy.leetly.user.service;

import com.atinroy.leetly.common.exception.ConflictException;
import com.atinroy.leetly.common.exception.ResourceNotFoundException;
import com.atinroy.leetly.problem.dto.ProblemSummaryDto;
import com.atinroy.leetly.problem.model.Problem;
import com.atinroy.leetly.problem.repository.AttemptRepository;
import com.atinroy.leetly.problem.repository.ProblemRepository;
import com.atinroy.leetly.problem.service.ProblemSpecification;
import com.atinroy.leetly.problem.service.ProblemService;
import com.atinroy.leetly.review.model.ReviewCard;
import com.atinroy.leetly.review.repository.ReviewCardRepository;
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
import java.util.Map;
import java.util.stream.Collectors;
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
    private final AttemptRepository attemptRepository;
    private final ReviewCardRepository reviewCardRepository;

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
    public Page<ProblemSummaryDto> findProblems(
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
        List<Long> listProblemIds = list.getProblems().stream().map(Problem::getId).toList();

        if (listProblemIds.isEmpty()) {
            return Page.empty(pageable);
        }

        Specification<Problem> filters = ProblemSpecification.buildSpec(difficulty, status, topicId, patternId, search);
        Specification<Problem> inList = (root, query, cb) -> root.get("id").in(listProblemIds);

        Page<Problem> page = problemRepository.findAll(inList.and(filters), normalizeSort(pageable));
        List<Long> ids = page.stream().map(Problem::getId).toList();

        Map<Long, Long> attemptCounts = attemptRepository.countByProblemIdsAndUser(ids, user)
                .stream().collect(Collectors.toMap(row -> (Long) row[0], row -> (Long) row[1]));

        Map<Long, ReviewCard> reviewCardMap = reviewCardRepository.findByUserAndProblemIdIn(user, ids)
                .stream().collect(Collectors.toMap(rc -> rc.getProblem().getId(), rc -> rc));

        return page.map(p -> ProblemSummaryDto.of(p, attemptCounts, reviewCardMap));
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
