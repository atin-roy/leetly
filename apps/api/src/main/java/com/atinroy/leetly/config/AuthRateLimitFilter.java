package com.atinroy.leetly.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.time.Duration;
import java.time.Instant;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Fixed-window, per-client limiter for the unauthenticated auth endpoints.
 * In-memory is sufficient here: the app runs as a single instance, so there is
 * no shared-store coordination problem to solve.
 */
@Component
public class AuthRateLimitFilter extends OncePerRequestFilter {

    private static final Set<String> LIMITED_PATHS = Set.of("/api/auth/login", "/api/auth/register");

    /** Stale buckets are swept once the map grows past this. */
    private static final int SWEEP_THRESHOLD = 10_000;

    private final int maxRequests;
    private final Duration window;
    private final ConcurrentHashMap<String, Window> buckets = new ConcurrentHashMap<>();

    public AuthRateLimitFilter(
            @Value("${app.rate-limit.auth.max-requests:10}") int maxRequests,
            @Value("${app.rate-limit.auth.window:PT1M}") Duration window) {
        this.maxRequests = maxRequests;
        this.window = window;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        if (!LIMITED_PATHS.contains(request.getRequestURI())) {
            filterChain.doFilter(request, response);
            return;
        }

        Instant now = Instant.now();
        if (buckets.size() > SWEEP_THRESHOLD) {
            evictExpired(now);
        }

        String key = clientIp(request) + ":" + request.getRequestURI();
        Window bucket = buckets.compute(key, (k, existing) -> {
            if (existing == null || existing.windowStart.plus(window).isBefore(now)) {
                return new Window(now, new AtomicInteger(1));
            }
            existing.count.incrementAndGet();
            return existing;
        });

        if (bucket.count.get() > maxRequests) {
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write("{\"detail\":\"Too many requests, try again later.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Identifies the caller for bucketing.
     *
     * <p>X-Forwarded-For is only consulted when the request actually arrived
     * from a trusted proxy, and then the <em>last</em> entry is used, not the
     * first. Our reverse proxy appends the peer address it observed, so a
     * client that sends {@code X-Forwarded-For: 1.2.3.4} produces
     * {@code "1.2.3.4, <real client>"} — reading the first entry would let
     * anyone mint a fresh bucket per request by varying one header, which
     * defeats the limiter and lets the map grow without bound.
     */
    private String clientIp(HttpServletRequest request) {
        String peer = request.getRemoteAddr();
        String forwarded = request.getHeader("X-Forwarded-For");

        if (forwarded == null || forwarded.isBlank() || !isTrustedProxy(peer)) {
            return peer;
        }

        String[] hops = forwarded.split(",");
        String appended = hops[hops.length - 1].trim();
        return appended.isEmpty() ? peer : appended;
    }

    /**
     * The API is only reachable through the reverse proxy on the container
     * network, so a loopback or private-range peer is the proxy and anything
     * else is a direct caller whose headers mean nothing.
     */
    private boolean isTrustedProxy(String peer) {
        if (peer == null || peer.isBlank()) {
            return false;
        }
        try {
            InetAddress address = InetAddress.getByName(peer);
            return address.isLoopbackAddress()
                    || address.isSiteLocalAddress()
                    || address.isLinkLocalAddress();
        } catch (UnknownHostException e) {
            return false;
        }
    }

    private void evictExpired(Instant now) {
        buckets.values().removeIf(bucket -> bucket.windowStart.plus(window).isBefore(now));
    }

    private static final class Window {
        final Instant windowStart;
        final AtomicInteger count;

        Window(Instant windowStart, AtomicInteger count) {
            this.windowStart = windowStart;
            this.count = count;
        }
    }
}
