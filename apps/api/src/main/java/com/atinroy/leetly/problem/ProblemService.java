package com.atinroy.leetly.problem;

import com.atinroy.leetly.common.ResourceNotFoundException;
import com.atinroy.leetly.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ProblemService {

    private final ProblemRepository problemRepository;
    private final TopicService topicService;
    private final PatternService patternService;

    @Transactional(readOnly = true)
    public Page<Problem> findAll(User user, Pageable pageable, String difficulty, String status, Long topicId, Long patternId, String search) {
        Specification<Problem> filters = ProblemSpecification.buildSpec(difficulty, status, topicId, patternId, search);
        Specification<Problem> ownedByUser = (root, query, cb) -> cb.equal(root.get("user"), user);
        return problemRepository.findAll(ownedByUser.and(filters), pageable);
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
        return problemRepository.save(problem);
    }

    public Problem update(long id, CreateProblemRequest request, User user) {
        Problem problem = findById(id, user);
        problem.setLeetcodeId(request.leetcodeId());
        problem.setTitle(request.title());
        problem.setUrl(request.url());
        problem.setDifficulty(request.difficulty());
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
}
