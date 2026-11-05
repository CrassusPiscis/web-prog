package com.example.webprog.security;

public record UserAuthData(
        Long id,
        String username,
        String passwordHash,
        String role
) {
}