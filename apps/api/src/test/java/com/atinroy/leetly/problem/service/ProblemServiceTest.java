package com.atinroy.leetly.problem.service;

import com.atinroy.leetly.user.model.ProblemList;
import com.atinroy.leetly.user.repository.ProblemListRepository;
import com.atinroy.leetly.user.model.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import com.atinroy.leetly.problem.dto.CreateProblemRequest;
import com.atinroy.leetly.problem.model.Difficulty;
import com.atinroy.leetly.problem.model.Problem;
import com.atinroy.leetly.problem.repository.ProblemRepository;

@ExtendWith(MockitoExtension.class)
class ProblemServiceTest {

    @Mock
    ProblemRepository problemRepository;

    @Mock
    ProblemListRepository problemListRepository;

    @Mock
    TopicService topicService;

    @Mock
    PatternService patternService;

    @InjectMocks
    ProblemService problemService;

    @Test
    void create_addsProblemToDefaultList() {
        User user = new User();
        user.setId(1L);

        ProblemList defaultList = new ProblemList();
        defaultList.setUser(user);
        defaultList.setDefault(true);

        when(problemRepository.save(any(Problem.class))).thenAnswer(invocation -> {
            Problem problem = invocation.getArgument(0);
            problem.setId(42L);
            return problem;
        });
        when(problemListRepository.findByUserAndIsDefaultTrue(user)).thenReturn(Optional.of(defaultList));
        when(problemListRepository.save(any(ProblemList.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Problem created = problemService.create(
                new CreateProblemRequest(1L, "Two Sum", "https://leetcode.com/problems/two-sum/", Difficulty.EASY),
                user
        );

        assertThat(created.getId()).isEqualTo(42L);
        assertThat(defaultList.getProblems()).contains(created);

        ArgumentCaptor<ProblemList> listCaptor = ArgumentCaptor.forClass(ProblemList.class);
        verify(problemListRepository).save(listCaptor.capture());
        assertThat(listCaptor.getValue().getProblems()).contains(created);
    }

    @Test
    void findAll_treatsNeverAttemptedProblemsAsOldest() {
        User user = new User();
        user.setId(1L);

        when(problemRepository.findAll(any(), any(org.springframework.data.domain.Pageable.class)))
                .thenReturn(new PageImpl<>(java.util.List.of()));

        problemService.findAll(
                user,
                PageRequest.of(0, 20, Sort.by(Sort.Order.desc("lastAttemptedAt"))),
                null,
                null,
                null,
                null,
                null
        );

        ArgumentCaptor<org.springframework.data.domain.Pageable> pageableCaptor =
                ArgumentCaptor.forClass(org.springframework.data.domain.Pageable.class);
        verify(problemRepository).findAll(any(), pageableCaptor.capture());

        Sort.Order appliedOrder = pageableCaptor.getValue().getSort().getOrderFor("lastAttemptedAt");
        assertThat(appliedOrder).isNotNull();
        assertThat(appliedOrder.getNullHandling()).isEqualTo(Sort.NullHandling.NULLS_LAST);
    }
}
