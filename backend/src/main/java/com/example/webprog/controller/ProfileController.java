package com.example.webprog.controller;

import com.example.webprog.dto.UserResponse;
import com.example.webprog.exception.UnauthorizedException;
import com.example.webprog.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ProfileController {
    private final UserRepository users;

    public ProfileController(UserRepository users) { this.users = users; }

    @GetMapping("/api/users/me")
    public UserResponse me(Authentication authentication) {
        UserResponse user = users.findPublicByUsername(authentication.getName());
        if (user == null) throw new UnauthorizedException("Пользователь удалён");
        return user;
    }
}
