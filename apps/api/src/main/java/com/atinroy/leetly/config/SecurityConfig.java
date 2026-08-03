package com.atinroy.leetly.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final LeetlyJwtAuthenticationConverter jwtConverter;
    private final List<String> allowedOriginPatterns;

    public SecurityConfig(
            LeetlyJwtAuthenticationConverter jwtConverter,
            @Value("${app.cors.allowed-origins:http://localhost:3000,https://leetly.atinroy.com}") String allowedOrigins) {
        this.jwtConverter = jwtConverter;
        this.allowedOriginPatterns = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toList();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                /*
                 * CSRF protection is off because there is nothing here for a
                 * forged request to ride on. This API authenticates solely from
                 * the Authorization header — it issues no session cookie and
                 * reads none — so a cross-site form post arrives unauthenticated
                 * no matter what the browser attaches to it. A CSRF token would
                 * guard a mechanism the API does not use.
                 *
                 * The cookie in this system is the refresh token, and it belongs
                 * to the web app's own origin, not to this service. That surface
                 * is defended in apps/web/lib/session.ts: HttpOnly (script cannot
                 * read it), Secure in production, and SameSite=Lax, which is what
                 * actually stops a cross-site POST from carrying it to the
                 * refresh route. Allowed origins are an explicit list below, and
                 * allowCredentials is only safe because that list is never a
                 * wildcard.
                 */
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(
                                "/api/auth/register",
                                "/api/auth/login",
                                "/api/auth/refresh",
                                "/api/auth/logout"
                        ).permitAll()
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/topics/**",
                                "/api/patterns/**",
                                "/api/themes/**"
                        ).denyAll()
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/topics/**",
                                "/api/patterns/**",
                                "/api/themes/**"
                        ).denyAll()
                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/topics/**",
                                "/api/patterns/**",
                                "/api/themes/**"
                        ).denyAll()
                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/topics/**",
                                "/api/patterns/**",
                                "/api/themes/**"
                        ).denyAll()
                        // Liveness for the deploy check. Exposes only UP/DOWN;
                        // details stay off by default.
                        .requestMatchers("/actuator/health", "/actuator/health/**").permitAll()
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**"
                        ).permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 ->
                        oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtConverter)));
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(allowedOriginPatterns);
        config.setAllowedMethods(List.of(
                HttpMethod.GET.name(),
                HttpMethod.POST.name(),
                HttpMethod.PUT.name(),
                HttpMethod.PATCH.name(),
                HttpMethod.DELETE.name(),
                HttpMethod.OPTIONS.name()
        ));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
