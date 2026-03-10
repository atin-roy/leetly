package com.atinroy.leetly.user.dto;

import java.time.LocalDate;
import com.atinroy.leetly.user.model.DailyStat;

public record DailyStatDto(
        Long id,
        LocalDate date,
        int solved,
        int attempted,
        int timeMinutes
) {
    public static DailyStatDto from(DailyStat stat) {
        return new DailyStatDto(
                stat.getId(),
                stat.getDate(),
                stat.getSolved(),
                stat.getAttempted(),
                stat.getTimeMinutes()
        );
    }
}
