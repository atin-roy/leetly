package com.atinroy.leetly.problem.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.atinroy.leetly.problem.dto.TopicDto;
import com.atinroy.leetly.problem.mapper.TopicMapper;
import com.atinroy.leetly.problem.service.TopicService;

@RestController
@RequestMapping("/api/topics")
@RequiredArgsConstructor
public class TopicController {

    private final TopicService topicService;
    private final TopicMapper topicMapper;

    @GetMapping
    public List<TopicDto> findAll() {
        return topicService.findAll().stream().map(topicMapper::toDto).toList();
    }

    @GetMapping("/{id}")
    public TopicDto findById(@PathVariable long id) {
        return topicMapper.toDto(topicService.findById(id));
    }
}
