package com.example.webprog.dto;

public record UserResponse(
        Long id,
        String username,
        String email,
        String role
) {
}