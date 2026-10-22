package com.example.webprog.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

        @NotBlank(
                message = "Имя пользователя обязательно"
        )
        @Size(
                min = 3,
                max = 100,
                message = "Имя пользователя должно содержать от 3 до 100 символов"
        )
        String username,

        @NotBlank(
                message = "Email обязателен"
        )
        @Email(
                message = "Некорректный email"
        )
        @Size(max = 255)
        String email,

        @NotBlank(
                message = "Пароль обязателен"
        )
        @Size(
                min = 8,
                max = 100,
                message = "Пароль должен содержать от 8 до 100 символов"
        )
        String password

) {
    @jakarta.validation.constraints.AssertTrue(message = "Password must fit in 72 UTF-8 bytes")
    public boolean isPasswordWithinBcryptLimit() {
        return password == null || password.getBytes(java.nio.charset.StandardCharsets.UTF_8).length <= 72;
    }
}