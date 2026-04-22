package com.atinroy.leetly.problem.service;

import com.atinroy.leetly.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import com.atinroy.leetly.problem.model.Pattern;
import com.atinroy.leetly.problem.model.Topic;
import com.atinroy.leetly.problem.repository.PatternRepository;

@Service
@Transactional
@RequiredArgsConstructor
public class PatternService {

    private final PatternRepository patternRepository;
    private final TopicService topicService;

    @Transactional(readOnly = true)
    public List<Pattern> findAll() {
        return patternRepository.findAllByOrderByNameAsc();
    }

    @Transactional(readOnly = true)
    public Pattern findById(long id) {
        return patternRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pattern not found: " + id));
    }

    @Transactional(readOnly = true)
    public List<Pattern> findByTopic(long topicId) {
        Topic topic = topicService.findById(topicId);
        return patternRepository.findByTopicOrderByNameAsc(topic);
    }

    public Pattern create(String name, String description, Long topicId, boolean namedAlgorithm) {
        Pattern pattern = new Pattern();
        pattern.setName(name);
        pattern.setDescription(description);
        pattern.setNamedAlgorithm(namedAlgorithm);
        if (topicId != null) {
            pattern.setTopic(topicService.findById(topicId));
        }
        return patternRepository.save(pattern);
    }

    public Pattern update(long id, String name, String description, Long topicId, boolean namedAlgorithm) {
        Pattern pattern = findById(id);
        pattern.setName(name);
        pattern.setDescription(description);
        pattern.setNamedAlgorithm(namedAlgorithm);
        pattern.setTopic(topicId != null ? topicService.findById(topicId) : null);
        return patternRepository.save(pattern);
    }

    public void delete(long id) {
        patternRepository.deleteById(id);
    }
}
