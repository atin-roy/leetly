package com.atinroy.leetly.problem.dto;

import com.atinroy.leetly.problem.model.Mistake;

public record MistakeOptionDto(
        Mistake value,
        String label
) {
    public static MistakeOptionDto from(Mistake mistake) {
        return new MistakeOptionDto(mistake, switch (mistake) {
            case WRONG_PATTERN -> "Wrong Pattern";
            case OFF_BY_ONE -> "Off By One";
            case MISSED_EDGE_CASE -> "Missed Edge Case";
            case FORGOT_BASE_CASE -> "Forgot Base Case";
            case WRONG_DATA_STRUCTURE -> "Wrong Data Structure";
            case OVERCOMPLICATED -> "Overcomplicated";
            case TIMEOUT -> "Timeout";
            case OVERFLOW -> "Overflow";
            case WRONG_INITIALIZATION -> "Wrong Initialization";
            case INCORRECT_LOGIC -> "Incorrect Logic";
        });
    }
}
