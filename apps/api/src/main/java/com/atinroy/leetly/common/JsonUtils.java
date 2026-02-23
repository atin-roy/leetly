package com.atinroy.leetly.common;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

public final class JsonUtils {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private JsonUtils() {}

    /**
     * Throws {@link IllegalArgumentException} if {@code json} is not valid JSON.
     * Pass-through for null values so callers can decide whether null is allowed.
     */
    public static void assertValidJson(String json) {
        if (json == null) return;
        try {
            MAPPER.readTree(json);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Invalid JSON: " + e.getOriginalMessage());
        }
    }
}
