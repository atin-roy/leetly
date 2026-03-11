package com.atinroy.leetly.problem.service;

import com.atinroy.leetly.common.exception.ResourceNotFoundException;
import com.atinroy.leetly.user.model.ProblemList;
import com.atinroy.leetly.user.repository.ProblemListRepository;
import com.atinroy.leetly.user.model.User;
import org.springframework.data.domain.PageRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import com.atinroy.leetly.problem.dto.CreateProblemRequest;
import com.atinroy.leetly.problem.model.Pattern;
import com.atinroy.leetly.problem.model.Problem;
import com.atinroy.leetly.problem.model.ProblemStatus;
import com.atinroy.leetly.problem.model.Topic;
import com.atinroy.leetly.problem.repository.ProblemRepository;

@Service
@Transactional
@RequiredArgsConstructor
public class ProblemService {

    private final ProblemRepository problemRepository;
    private final ProblemListRepository problemListRepository;
    private final TopicService topicService;
    private final PatternService patternService;

    @Transactional(readOnly = true)
    public Page<Problem> findAll(User user, Pageable pageable, String difficulty, String status, Long topicId, Long patternId, String search) {
        Specification<Problem> filters = ProblemSpecification.buildSpec(difficulty, status, topicId, patternId, search);
        Specification<Problem> ownedByUser = (root, query, cb) -> cb.equal(root.get("user"), user);
        return problemRepository.findAll(ownedByUser.and(filters), normalizeSort(pageable));
    }

    private Pageable normalizeSort(Pageable pageable) {
        List<Sort.Order> orders = pageable.getSort().stream()
                .map(this::normalizeOrder)
                .toList();

        if (orders.isEmpty()) {
            return pageable;
        }

        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(orders));
    }

    private Sort.Order normalizeOrder(Sort.Order order) {
        if (!"lastAttemptedAt".equals(order.getProperty())) {
            return order;
        }

        return order.isAscending()
                ? order.nullsFirst()
                : order.nullsLast();
    }

    @Transactional(readOnly = true)
    public Problem findById(long id, User user) {
        return problemRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found: " + id));
    }

    @Transactional(readOnly = true)
    public Problem findDetailById(long id, User user) {
        return findById(id, user);
    }

    public Problem create(CreateProblemRequest request, User user) {
        Problem problem = new Problem();
        problem.setUser(user);
        problem.setLeetcodeId(request.leetcodeId());
        problem.setTitle(request.title());
        problem.setUrl(request.url());
        problem.setDifficulty(request.difficulty());
        problem.setStatus(ProblemStatus.UNSEEN);
        problem.setAiReview(request.aiReview());

        Problem savedProblem = problemRepository.save(problem);
        ProblemList defaultList = problemListRepository.findByUserAndIsDefaultTrue(user)
                .orElseThrow(() -> new ResourceNotFoundException("Default problem list not found for user: " + user.getId()));
        if (!defaultList.getProblems().contains(savedProblem)) {
            defaultList.getProblems().add(savedProblem);
            problemListRepository.save(defaultList);
        }

        return savedProblem;
    }

    public Problem update(long id, CreateProblemRequest request, User user) {
        Problem problem = findById(id, user);
        problem.setLeetcodeId(request.leetcodeId());
        problem.setTitle(request.title());
        problem.setUrl(request.url());
        problem.setDifficulty(request.difficulty());
        problem.setAiReview(request.aiReview());
        return problemRepository.save(problem);
    }

    public void delete(long id, User user) {
        problemRepository.delete(findById(id, user));
    }

    public Problem addTopic(long problemId, long topicId, User user) {
        Problem problem = findById(problemId, user);
        Topic topic = topicService.findById(topicId);
        if (!problem.getTopics().contains(topic)) {
            problem.getTopics().add(topic);
        }
        return problemRepository.save(problem);
    }

    public Problem removeTopics(long problemId, List<Long> topicIds, User user) {
        Problem problem = findById(problemId, user);
        problem.getTopics().removeIf(t -> topicIds.contains(t.getId()));
        return problemRepository.save(problem);
    }

    public Problem addPattern(long problemId, long patternId, User user) {
        Problem problem = findById(problemId, user);
        Pattern pattern = patternService.findById(patternId);
        if (!problem.getPatterns().contains(pattern)) {
            problem.getPatterns().add(pattern);
        }
        return problemRepository.save(problem);
    }

    public Problem removePattern(long problemId, long patternId, User user) {
        Problem problem = findById(problemId, user);
        problem.getPatterns().removeIf(p -> p.getId().equals(patternId));
        return problemRepository.save(problem);
    }

    public Problem addRelatedProblem(long problemId, long relatedId, User user) {
        Problem problem = findById(problemId, user);
        Problem related = findById(relatedId, user);
        if (!problem.getRelatedProblems().contains(related)) {
            problem.getRelatedProblems().add(related);
        }
        return problemRepository.save(problem);
    }

    public Problem updateStatus(long problemId, ProblemStatus status, User user) {
        Problem problem = findById(problemId, user);
        problem.setStatus(status);
        return problemRepository.save(problem);
    }

    public Problem updateAiReview(long problemId, String aiReview, User user) {
        Problem problem = findById(problemId, user);
        problem.setAiReview(aiReview);
        return problemRepository.save(problem);
    }
}
