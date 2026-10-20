package com.example.webprog.dto;

public record TokenResponse(
        String accessToken,
        String refreshToken
) {
}