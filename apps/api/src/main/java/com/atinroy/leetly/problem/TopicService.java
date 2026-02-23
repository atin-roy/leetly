package com.atinroy.leetly.problem;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
                .orElseThrow(() -> new RuntimeException("Topic not found: " + id));
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
