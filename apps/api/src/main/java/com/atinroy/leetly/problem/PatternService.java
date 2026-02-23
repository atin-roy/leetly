package com.atinroy.leetly.problem;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class PatternService {

    private final PatternRepository patternRepository;
    private final TopicService topicService;

    @Transactional(readOnly = true)
    public List<Pattern> findAll() {
        return patternRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Pattern findById(long id) {
        return patternRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pattern not found: " + id));
    }

    @Transactional(readOnly = true)
    public List<Pattern> findByTopic(long topicId) {
        Topic topic = topicService.findById(topicId);
        return patternRepository.findByTopic(topic);
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
