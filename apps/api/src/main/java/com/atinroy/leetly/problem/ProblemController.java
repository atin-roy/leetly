package com.atinroy.leetly.problem;

import com.atinroy.leetly.common.PagedResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/problems")
@RequiredArgsConstructor
public class ProblemController {

    private final ProblemService problemService;
    private final ProblemMapper problemMapper;

    @GetMapping
    public PagedResponse<ProblemSummaryDto> findAll(
            @PageableDefault(size = 20, sort = "leetcodeId", direction = Sort.Direction.ASC) Pageable pageable,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long topicId,
            @RequestParam(required = false) Long patternId,
            @RequestParam(required = false) String search) {
        return PagedResponse.of(problemService.findAll(pageable, difficulty, status, topicId, patternId, search).map(problemMapper::toSummaryDto));
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ProblemDetailDto findById(@PathVariable long id) {
        return problemMapper.toDetailDto(problemService.findDetailById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProblemSummaryDto create(@Valid @RequestBody CreateProblemRequest request) {
        return problemMapper.toSummaryDto(problemService.create(request));
    }

    @PutMapping("/{id}")
    public ProblemSummaryDto update(@PathVariable long id, @Valid @RequestBody CreateProblemRequest request) {
        return problemMapper.toSummaryDto(problemService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable long id) {
        problemService.delete(id);
    }

    @PatchMapping("/{id}/status")
    public ProblemSummaryDto updateStatus(@PathVariable long id, @Valid @RequestBody UpdateStatusRequest request) {
        return problemMapper.toSummaryDto(problemService.updateStatus(id, request.status()));
    }

    @PostMapping("/{id}/topics/{topicId}")
    @Transactional
    public ProblemDetailDto addTopic(@PathVariable long id, @PathVariable long topicId) {
        return problemMapper.toDetailDto(problemService.addTopic(id, topicId));
    }

    @DeleteMapping("/{id}/topics")
    @Transactional
    public ProblemDetailDto removeTopics(@PathVariable long id, @Valid @RequestBody RemoveTopicsRequest request) {
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
