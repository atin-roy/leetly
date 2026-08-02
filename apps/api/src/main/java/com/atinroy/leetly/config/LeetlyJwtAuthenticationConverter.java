package com.atinroy.leetly.config;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Builds the authentication from a locally issued token.
 *
 * Leetly has no roles: every endpoint is scoped to the calling user's own data,
 * enforced in the repository layer rather than by authority checks. So no
 * authorities are granted, and the principal name is the token subject.
 */
@Component
public class LeetlyJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        String preferredUsername = jwt.getClaimAsString("preferred_username");
        return new JwtAuthenticationToken(
                jwt,
                List.of(),
                preferredUsername != null ? preferredUsername : jwt.getSubject());
    }
}
