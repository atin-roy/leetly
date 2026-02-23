package com.atinroy.leetly.user;

import com.atinroy.leetly.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "daily_stats",
        indexes = {
                @Index(name = "idx_daily_stat_user_date", columnList = "user_id, date", unique = true)
        })
public class DailyStat extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private int solved = 0;

    @Column(nullable = false)
    private int attempted = 0;

    @Column(nullable = false)
    private int timeMinutes = 0;
}
