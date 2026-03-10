package com.atinroy.leetly.problem.service;

import com.atinroy.leetly.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import com.atinroy.leetly.problem.model.Topic;
import com.atinroy.leetly.problem.repository.TopicRepository;

@Service
@Transactional
@RequiredArgsConstructor
public class TopicService {

    private final TopicRepository topicRepository;

    @Transactional(readOnly = true)
    public List<Topic> findAll() {
        return topicRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Topic findById(long id) {
        return topicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found: " + id));
    }

    public Topic create(String name, String description) {
        Topic topic = new Topic();
        topic.setName(name);
        topic.setDescription(description);
        return topicRepository.save(topic);
    }

    public Topic update(long id, String name, String description) {
        Topic topic = findById(id);
        topic.setName(name);
        topic.setDescription(description);
        return topicRepository.save(topic);
    }

    public void delete(long id) {
        topicRepository.deleteById(id);
    }
}
