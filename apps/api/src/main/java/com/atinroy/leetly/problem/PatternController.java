package com.atinroy.leetly.problem;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patterns")
@RequiredArgsConstructor
public class PatternController {

    private final PatternService patternService;
    private final PatternMapper patternMapper;

    @GetMapping
    public List<PatternDto> findAll(@RequestParam(required = false) Long topicId) {
        List<Pattern> patterns = topicId != null
                ? patternService.findByTopic(topicId)
                : patternService.findAll();
        return patterns.stream().map(patternMapper::toDto).toList();
    }

    @GetMapping("/{id}")
    public PatternDto findById(@PathVariable long id) {
        return patternMapper.toDto(patternService.findById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PatternDto create(@Valid @RequestBody CreatePatternRequest request) {
        return patternMapper.toDto(
                patternService.create(request.name(), request.description(), request.topicId(), request.namedAlgorithm()));
    }

    @PutMapping("/{id}")
    public PatternDto update(@PathVariable long id, @Valid @RequestBody CreatePatternRequest request) {
        return patternMapper.toDto(
                patternService.update(id, request.name(), request.description(), request.topicId(), request.namedAlgorithm()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable long id) {
        patternService.delete(id);
    }
}
