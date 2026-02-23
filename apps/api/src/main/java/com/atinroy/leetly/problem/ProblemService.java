package com.atinroy.leetly.problem;

import com.atinroy.leetly.common.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    public Page<Problem> findAll(Pageable pageable) {
        return problemRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Problem findById(long id) {
        return problemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found: " + id));
    }

    @Transactional(readOnly = true)
    public Problem findDetailById(long id) {
        return problemRepository.findDetailById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found: " + id));
    }

    public Problem create(CreateProblemRequest request) {
        Problem problem = new Problem();
        problem.setLeetcodeId(request.leetcodeId());
        problem.setTitle(request.title());
        problem.setUrl(request.url());
        problem.setDifficulty(request.difficulty());
        problem.setStatus(ProblemStatus.UNSEEN);
        return problemRepository.save(problem);
    }

    public Problem update(long id, CreateProblemRequest request) {
        Problem problem = findById(id);
        problem.setLeetcodeId(request.leetcodeId());
        problem.setTitle(request.title());
        problem.setUrl(request.url());
        problem.setDifficulty(request.difficulty());
        return problemRepository.save(problem);
    }

    public void delete(long id) {
        problemRepository.deleteById(id);
    }

    public Problem addTopic(long problemId, long topicId) {
        Problem problem = findById(problemId);
        Topic topic = topicService.findById(topicId);
        if (!problem.getTopics().contains(topic)) {
            problem.getTopics().add(topic);
        }
        return problemRepository.save(problem);
    }

    public Problem removeTopics(long problemId, List<Long> topicIds) {
        Problem problem = findById(problemId);
        problem.getTopics().removeIf(t -> topicIds.contains(t.getId()));
        return problemRepository.save(problem);
    }

    public Problem addPattern(long problemId, long patternId) {
        Problem problem = findById(problemId);
        Pattern pattern = patternService.findById(patternId);
        if (!problem.getPatterns().contains(pattern)) {
            problem.getPatterns().add(pattern);
        }
        return problemRepository.save(problem);
    }

    public Problem removePattern(long problemId, long patternId) {
        Problem problem = findById(problemId);
        problem.getPatterns().removeIf(p -> p.getId().equals(patternId));
        return problemRepository.save(problem);
    }

    public Problem addRelatedProblem(long problemId, long relatedId) {
        Problem problem = findById(problemId);
        Problem related = findById(relatedId);
        if (!problem.getRelatedProblems().contains(related)) {
            problem.getRelatedProblems().add(related);
        }
        return problemRepository.save(problem);
    }

    public Problem updateStatus(long problemId, ProblemStatus status) {
        Problem problem = findById(problemId);
        problem.setStatus(status);
        return problemRepository.save(problem);
    }
}
