package com.atinroy.leetly.problem.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.atinroy.leetly.problem.dto.PatternDto;
import com.atinroy.leetly.problem.mapper.PatternMapper;
import com.atinroy.leetly.problem.model.Pattern;
import com.atinroy.leetly.problem.service.PatternService;

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
}
