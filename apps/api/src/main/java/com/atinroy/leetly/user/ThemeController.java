package com.atinroy.leetly.user;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/themes")
@RequiredArgsConstructor
public class ThemeController {

    private final ThemeService themeService;
    private final ThemeMapper themeMapper;

    @GetMapping
    public List<ThemeDto> findAll() {
        return themeService.findAll().stream().map(themeMapper::toDto).toList();
    }

    @GetMapping("/{id}")
    public ThemeDto findById(@PathVariable long id) {
        return themeMapper.toDto(themeService.findById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ThemeDto create(@Valid @RequestBody CreateThemeRequest request) {
        return themeMapper.toDto(themeService.create(request.name(), request.properties()));
    }

    @PutMapping("/{id}")
    public ThemeDto update(@PathVariable long id, @Valid @RequestBody CreateThemeRequest request) {
        return themeMapper.toDto(themeService.update(id, request.name(), request.properties()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable long id) {
        themeService.delete(id);
    }
}
