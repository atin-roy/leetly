package com.atinroy.leetly.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.io.PrintWriter;
import java.io.StringWriter;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class AuthRateLimitFilterTest {

    @Test
    void allowsRequestsUnderTheLimitThenRejects() throws Exception {
        AuthRateLimitFilter filter = new AuthRateLimitFilter(3, Duration.ofMinutes(1));
        FilterChain chain = mock(FilterChain.class);

        for (int i = 0; i < 3; i++) {
            HttpServletRequest request = mockLoginRequest();
            HttpServletResponse response = mock(HttpServletResponse.class);
            filter.doFilter(request, response, chain);
        }
        verify(chain, times(3)).doFilter(any(), any());

        HttpServletRequest fourthRequest = mockLoginRequest();
        HttpServletResponse fourthResponse = mock(HttpServletResponse.class);
        StringWriter body = new StringWriter();
        when(fourthResponse.getWriter()).thenReturn(new PrintWriter(body));

        filter.doFilter(fourthRequest, fourthResponse, chain);

        verify(fourthResponse).setStatus(429);
        verify(chain, times(3)).doFilter(any(), any());
    }

    @Test
    void doesNotLimitUnrelatedPaths() throws Exception {
        AuthRateLimitFilter filter = new AuthRateLimitFilter(1, Duration.ofMinutes(1));
        FilterChain chain = mock(FilterChain.class);

        for (int i = 0; i < 5; i++) {
            HttpServletRequest request = mock(HttpServletRequest.class);
            when(request.getRequestURI()).thenReturn("/api/problems");
            HttpServletResponse response = mock(HttpServletResponse.class);
            filter.doFilter(request, response, chain);
        }

        verify(chain, times(5)).doFilter(any(), any());
    }

    /**
     * The proxy appends the peer it saw, so a spoofed header lands first and
     * the genuine address last. Keying on the first entry would let one client
     * mint a fresh bucket per request just by varying the header.
     */
    @Test
    void ignoresSpoofedForwardedForEntriesFromTheSameClient() throws Exception {
        AuthRateLimitFilter filter = new AuthRateLimitFilter(3, Duration.ofMinutes(1));
        FilterChain chain = mock(FilterChain.class);

        for (int i = 0; i < 3; i++) {
            HttpServletRequest request = mockLoginRequest("10.0.0.2");
            when(request.getHeader("X-Forwarded-For"))
                    .thenReturn("198.51.100." + i + ", 203.0.113.5");
            filter.doFilter(request, mock(HttpServletResponse.class), chain);
        }
        verify(chain, times(3)).doFilter(any(), any());

        HttpServletRequest fourth = mockLoginRequest("10.0.0.2");
        when(fourth.getHeader("X-Forwarded-For")).thenReturn("198.51.100.99, 203.0.113.5");
        HttpServletResponse response = mock(HttpServletResponse.class);
        when(response.getWriter()).thenReturn(new PrintWriter(new StringWriter()));

        filter.doFilter(fourth, response, chain);

        verify(response).setStatus(429);
        verify(chain, times(3)).doFilter(any(), any());
    }

    @Test
    void separatesDistinctClientsBehindTheProxy() throws Exception {
        AuthRateLimitFilter filter = new AuthRateLimitFilter(2, Duration.ofMinutes(1));
        FilterChain chain = mock(FilterChain.class);

        for (int i = 0; i < 2; i++) {
            HttpServletRequest first = mockLoginRequest("10.0.0.2");
            when(first.getHeader("X-Forwarded-For")).thenReturn("203.0.113.5");
            filter.doFilter(first, mock(HttpServletResponse.class), chain);
        }

        // A different real client must not inherit the exhausted bucket.
        HttpServletRequest other = mockLoginRequest("10.0.0.2");
        when(other.getHeader("X-Forwarded-For")).thenReturn("203.0.113.9");
        filter.doFilter(other, mock(HttpServletResponse.class), chain);

        verify(chain, times(3)).doFilter(any(), any());
    }

    /**
     * A caller reaching the container directly is not the proxy, so its
     * headers carry no authority and the peer address is used instead.
     */
    @Test
    void ignoresForwardedForFromUntrustedPeers() throws Exception {
        AuthRateLimitFilter filter = new AuthRateLimitFilter(2, Duration.ofMinutes(1));
        FilterChain chain = mock(FilterChain.class);

        for (int i = 0; i < 2; i++) {
            HttpServletRequest request = mockLoginRequest("203.0.113.5");
            when(request.getHeader("X-Forwarded-For")).thenReturn("198.51.100." + i);
            filter.doFilter(request, mock(HttpServletResponse.class), chain);
        }

        HttpServletRequest third = mockLoginRequest("203.0.113.5");
        when(third.getHeader("X-Forwarded-For")).thenReturn("198.51.100.42");
        HttpServletResponse response = mock(HttpServletResponse.class);
        when(response.getWriter()).thenReturn(new PrintWriter(new StringWriter()));

        filter.doFilter(third, response, chain);

        verify(response).setStatus(429);
        verify(chain, times(2)).doFilter(any(), any());
    }

    @Test
    void startsAFreshWindowOnceTheOldOneElapses() throws Exception {
        AuthRateLimitFilter filter = new AuthRateLimitFilter(1, Duration.ofMillis(50));
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(mockLoginRequest("203.0.113.5"), mock(HttpServletResponse.class), chain);
        Thread.sleep(80);
        filter.doFilter(mockLoginRequest("203.0.113.5"), mock(HttpServletResponse.class), chain);

        verify(chain, times(2)).doFilter(any(), any());
    }

    private HttpServletRequest mockLoginRequest() {
        return mockLoginRequest("203.0.113.5");
    }

    private HttpServletRequest mockLoginRequest(String remoteAddr) {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn("/api/auth/login");
        when(request.getRemoteAddr()).thenReturn(remoteAddr);
        return request;
    }
}
