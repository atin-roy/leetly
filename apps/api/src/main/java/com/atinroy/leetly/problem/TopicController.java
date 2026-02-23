package com.atinroy.leetly.problem;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TopicDto create(@RequestBody CreateTopicRequest request) {
        return topicMapper.toDto(topicService.create(request.name(), request.description()));
    }

    @PutMapping("/{id}")
    public TopicDto update(@PathVariable long id, @RequestBody CreateTopicRequest request) {
        return topicMapper.toDto(topicService.update(id, request.name(), request.description()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable long id) {
        topicService.delete(id);
    }
}
