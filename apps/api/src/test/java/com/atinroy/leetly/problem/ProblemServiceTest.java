package com.atinroy.leetly.problem;

import com.atinroy.leetly.user.ProblemList;
import com.atinroy.leetly.user.ProblemListRepository;
import com.atinroy.leetly.user.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
}
