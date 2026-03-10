package com.atinroy.leetly.problem.controller;

import com.atinroy.leetly.problem.dto.MistakeOptionDto;
import com.atinroy.leetly.problem.model.Mistake;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/mistakes")
public class MistakeController {

    @GetMapping
    public List<MistakeOptionDto> findAll() {
        return Arrays.stream(Mistake.values())
                .map(MistakeOptionDto::from)
                .toList();
    }
}
