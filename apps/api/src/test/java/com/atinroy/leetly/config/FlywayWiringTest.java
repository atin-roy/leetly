package com.atinroy.leetly.config;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.AutoConfigurations;
import org.springframework.boot.flyway.autoconfigure.FlywayAutoConfiguration;
import org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Guards against the migration runner silently disappearing.
 *
 * Spring Boot 4 split auto-configuration into per-technology modules, so
 * depending on flyway-core alone leaves the library on the classpath with
 * nothing wiring it up. Production ran that way for months: migrations stopped
 * being applied and nothing failed until an entity needed a table that no
 * longer got created.
 */
class FlywayWiringTest {

    @Test
    void flywayIsAutoConfigured() {
        new ApplicationContextRunner()
                .withConfiguration(AutoConfigurations.of(
                        DataSourceAutoConfiguration.class,
                        FlywayAutoConfiguration.class))
                .withPropertyValues(
                        "spring.datasource.url=jdbc:h2:mem:flyway-wiring;DB_CLOSE_DELAY=-1",
                        "spring.datasource.driver-class-name=org.h2.Driver",
                        "spring.datasource.username=sa",
                        "spring.datasource.password=",
                        // No migrations are run here; only the wiring matters.
                        "spring.flyway.locations=classpath:db/no-migrations")
                .run(context -> assertThat(context).hasSingleBean(Flyway.class));
    }
}
