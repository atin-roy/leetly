package com.atinroy.leetly.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;

/**
 * Time is injected rather than read from the static clock so that date-derived
 * statistics (streaks, "this week", "this month") can be tested at a fixed
 * instant instead of depending on the day the suite happens to run.
 */
@Configuration
public class ClockConfig {

    @Bean
    public Clock clock() {
        return Clock.systemDefaultZone();
    }
}
