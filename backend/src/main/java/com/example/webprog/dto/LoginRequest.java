package com.example.webprog.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(

        @NotBlank(
                message = "Имя пользователя обязательно"
        )
        String username,

        @NotBlank(
                message = "Пароль обязателен"
        )
        String password

) {
    @jakarta.validation.constraints.AssertTrue(message = "Password must fit in 72 UTF-8 bytes")
    public boolean isPasswordWithinBcryptLimit() {
        return password == null || password.getBytes(java.nio.charset.StandardCharsets.UTF_8).length <= 72;
    }
}