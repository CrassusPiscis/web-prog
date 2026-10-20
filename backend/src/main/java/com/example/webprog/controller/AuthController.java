package com.example.webprog.controller;

import com.example.webprog.dto.RegisterRequest;
import com.example.webprog.dto.UserResponse;
import com.example.webprog.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import com.example.webprog.dto.LoginRequest;
import com.example.webprog.dto.RefreshTokenRequest;
import com.example.webprog.dto.TokenResponse;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;


    public AuthController(
            AuthService authService
    ) {
        this.authService = authService;
    }


    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(
            @Valid
            @RequestBody RegisterRequest request
    ) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public TokenResponse login(
            @Valid
            @RequestBody LoginRequest request
    ) {
        return authService.login(request);
    }

    @PostMapping("/refresh")
    public TokenResponse refresh(
            @Valid
            @RequestBody RefreshTokenRequest request
    ) {
        return authService.refresh(request);
    }
}