package com.example.webprog.dto;

import java.util.Map;

public record ApiErrorResponse(
        ErrorData error
) {
    public record ErrorData(
            int code,
            String message,
            Map<String, String> details
    ) {
    }

    public static ApiErrorResponse of(
            int code,
            String message
    ) {
        return new ApiErrorResponse(
                new ErrorData(
                        code,
                        message,
                        Map.of()
                )
        );
    }

    public static ApiErrorResponse of(
            int code,
            String message,
            Map<String, String> details
    ) {
        return new ApiErrorResponse(
                new ErrorData(
                        code,
                        message,
                        details
                )
        );
    }
}