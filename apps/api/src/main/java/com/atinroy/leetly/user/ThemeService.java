package com.atinroy.leetly.user;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ThemeService {

    private final ThemeRepository themeRepository;

    @Transactional(readOnly = true)
    public List<Theme> findAll() {
        return themeRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Theme findById(long id) {
        return themeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Theme not found: " + id));
    }

    public Theme create(String name, String properties) {
        Theme theme = new Theme();
        theme.setName(name);
        theme.setProperties(properties);
        return themeRepository.save(theme);
    }

    public Theme update(long id, String name, String properties) {
        Theme theme = findById(id);
        theme.setName(name);
        theme.setProperties(properties);
        return themeRepository.save(theme);
    }

    public void delete(long id) {
        themeRepository.deleteById(id);
    }
}
