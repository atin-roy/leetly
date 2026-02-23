package com.atinroy.leetly.problem;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/problems")
@RequiredArgsConstructor
public class ProblemController {

    private final ProblemService problemService;
    private final ProblemMapper problemMapper;

    @GetMapping
    public List<ProblemSummaryDto> findAll() {
        return problemService.findAll().stream().map(problemMapper::toSummaryDto).toList();
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ProblemDetailDto findById(@PathVariable long id) {
        return problemMapper.toDetailDto(problemService.findById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProblemSummaryDto create(@RequestBody CreateProblemRequest request) {
        return problemMapper.toSummaryDto(problemService.create(request));
    }

    @PutMapping("/{id}")
    public ProblemSummaryDto update(@PathVariable long id, @RequestBody CreateProblemRequest request) {
        return problemMapper.toSummaryDto(problemService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable long id) {
        problemService.delete(id);
    }

    @PatchMapping("/{id}/status")
    public ProblemSummaryDto updateStatus(@PathVariable long id, @RequestBody UpdateStatusRequest request) {
        return problemMapper.toSummaryDto(problemService.updateStatus(id, request.status()));
    }

    @PostMapping("/{id}/topics/{topicId}")
    @Transactional
    public ProblemDetailDto addTopic(@PathVariable long id, @PathVariable long topicId) {
        return problemMapper.toDetailDto(problemService.addTopic(id, topicId));
    }

    @DeleteMapping("/{id}/topics")
    @Transactional
    public ProblemDetailDto removeTopics(@PathVariable long id, @RequestBody RemoveTopicsRequest request) {
        return problemMapper.toDetailDto(problemService.removeTopics(id, request.topicIds()));
    }

    @PostMapping("/{id}/patterns/{patternId}")
    @Transactional
    public ProblemDetailDto addPattern(@PathVariable long id, @PathVariable long patternId) {
        return problemMapper.toDetailDto(problemService.addPattern(id, patternId));
    }

    @DeleteMapping("/{id}/patterns/{patternId}")
    @Transactional
    public ProblemDetailDto removePattern(@PathVariable long id, @PathVariable long patternId) {
        return problemMapper.toDetailDto(problemService.removePattern(id, patternId));
    }

    @PostMapping("/{id}/related/{relatedId}")
    @Transactional
    public ProblemDetailDto addRelatedProblem(@PathVariable long id, @PathVariable long relatedId) {
        return problemMapper.toDetailDto(problemService.addRelatedProblem(id, relatedId));
    }
}
