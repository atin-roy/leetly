package com.atinroy.leetly.config;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThatCode;

class JwtConfigTest {

    private static final String INSECURE_DEFAULT = "dev-only-insecure-secret-change-me-32b";
    private static final String REAL_SECRET = "a-generated-secret-that-is-at-least-32-bytes-long";

    @Test
    void rejectsSecretsShorterThan32Bytes() {
        assertThatThrownBy(() -> new JwtConfig("too-short", ""))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("32 bytes");
    }

    /**
     * The deployment does not set SPRING_PROFILES_ACTIVE, so this — not the
     * prod-profile case — is the condition the guard actually has to catch.
     * The earlier version keyed on the prod profile and so was inert exactly
     * where it mattered.
     */
    @Test
    void rejectsInsecureDefaultWhenNoProfileIsSet() {
        assertThatThrownBy(() -> new JwtConfig(INSECURE_DEFAULT, ""))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("insecure dev default");
    }

    @Test
    void rejectsInsecureDefaultUnderProdProfile() {
        assertThatThrownBy(() -> new JwtConfig(INSECURE_DEFAULT, "prod"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("insecure dev default");
    }

    @Test
    void rejectsInsecureDefaultUnderAnUnrecognisedProfile() {
        assertThatThrownBy(() -> new JwtConfig(INSECURE_DEFAULT, "staging"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("insecure dev default");
    }

    /** A profile merely containing "dev" as a substring must not open the gate. */
    @Test
    void rejectsInsecureDefaultUnderProfilesThatMerelyContainDev() {
        assertThatThrownBy(() -> new JwtConfig(INSECURE_DEFAULT, "development-eu"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("insecure dev default");
    }

    @Test
    void allowsInsecureDefaultWhenDevProfileIsExplicit() {
        assertThatCode(() -> new JwtConfig(INSECURE_DEFAULT, "dev"))
                .doesNotThrowAnyException();
    }

    @Test
    void allowsInsecureDefaultWhenDevIsOneOfSeveralProfiles() {
        assertThatCode(() -> new JwtConfig(INSECURE_DEFAULT, "dev,local"))
                .doesNotThrowAnyException();
    }

    @Test
    void allowsInsecureDefaultUnderTestProfile() {
        assertThatCode(() -> new JwtConfig(INSECURE_DEFAULT, "test"))
                .doesNotThrowAnyException();
    }

    @Test
    void allowsRealSecretWithNoProfileSet() {
        assertThatCode(() -> new JwtConfig(REAL_SECRET, ""))
                .doesNotThrowAnyException();
    }

    @Test
    void allowsRealSecretUnderProdProfile() {
        assertThatCode(() -> new JwtConfig(REAL_SECRET, "prod"))
                .doesNotThrowAnyException();
    }
}
