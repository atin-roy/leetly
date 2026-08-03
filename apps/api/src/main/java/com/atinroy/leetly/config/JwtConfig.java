package com.atinroy.leetly.config;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

/**
 * Access tokens are signed and verified with a symmetric key held by this
 * service. The resource-server model is kept from the Keycloak setup — only the
 * issuer changes — so controllers continue to receive a {@code Jwt} principal.
 */
@Configuration
public class JwtConfig {

    private static final String INSECURE_DEV_DEFAULT = "dev-only-insecure-secret-change-me-32b";

    private final SecretKeySpec secretKey;

    public JwtConfig(
            @Value("${app.jwt.secret}") String secret,
            @Value("${spring.profiles.active:}") String activeProfiles) {
        if (secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException(
                    "app.jwt.secret must be at least 32 bytes for HS256");
        }
        /*
         * Fail closed, on the secret rather than on the profile.
         *
         * This used to trigger only when the prod profile was active — which
         * meant it could not fire on the actual deployment, where
         * SPRING_PROFILES_ACTIVE is unset and the app runs under the default
         * profile. A guard that needs the configuration to already be correct
         * in order to catch incorrect configuration protects nothing.
         *
         * Now the known-bad value is refused everywhere unless a developer has
         * explicitly opted in by naming the dev or test profile.
         */
        if (INSECURE_DEV_DEFAULT.equals(secret) && !isExplicitlyNonProduction(activeProfiles)) {
            throw new IllegalStateException(
                    "app.jwt.secret is still the insecure dev default. Set APP_JWT_SECRET "
                            + "(openssl rand -base64 48), or run with the dev profile locally.");
        }
        this.secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
    }

    private static boolean isExplicitlyNonProduction(String activeProfiles) {
        return Arrays.stream(activeProfiles.split(","))
                .map(String::trim)
                .anyMatch(profile -> profile.equals("dev") || profile.equals("test"));
    }

    @Bean
    public JwtEncoder jwtEncoder() {
        return new NimbusJwtEncoder(new ImmutableSecret<>(secretKey));
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder.withSecretKey(secretKey)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
