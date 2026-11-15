package com.example.webprog.config;

import com.example.webprog.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

// Только для первоначального создания администратора из локальной конфигурации.
// Существующий аккаунт не изменяется и не повышается автоматически.
@Component
public class AdminBootstrap implements ApplicationRunner {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final String username, email, password;
    public AdminBootstrap(UserRepository users, PasswordEncoder encoder,
            @Value("${BOOTSTRAP_ADMIN_USERNAME:}") String username,
            @Value("${BOOTSTRAP_ADMIN_EMAIL:}") String email,
            @Value("${BOOTSTRAP_ADMIN_PASSWORD:}") String password) {
        this.users = users; this.encoder = encoder;
        this.username = username; this.email = email; this.password = password;
    }
    @Override
    public void run(ApplicationArguments args) {
        if (username.isBlank() && email.isBlank() && password.isBlank()) return;
        if (username.length() < 3 || username.length() > 100 || !email.contains("@") || password.length() < 8
                || password.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72)
            throw new IllegalArgumentException("Проверьте BOOTSTRAP_ADMIN_* в .env: имя, email, пароль от 8 символов до 72 байт");
        if (!users.existsByUsername(username) && !users.existsByEmail(email))
            users.create(username, email, encoder.encode(password), "ADMIN");
    }
}
