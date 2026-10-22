package com.example.webprog.service;

import com.example.webprog.dto.LoginRequest;
import com.example.webprog.dto.RefreshTokenRequest;
import com.example.webprog.dto.RegisterRequest;
import com.example.webprog.dto.TokenResponse;
import com.example.webprog.dto.UserResponse;
import com.example.webprog.exception.DuplicateUserException;
import com.example.webprog.exception.UnauthorizedException;
import com.example.webprog.repository.UserRepository;
import com.example.webprog.security.JwtService;
import com.example.webprog.security.UserAuthData;
import com.example.webprog.security.UserRole;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(AuthService.class);

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public UserResponse register(
            RegisterRequest request
    ) {
        if (userRepository.existsByUsername(request.username())) {
            throw new DuplicateUserException(
                    "Пользователь с таким именем уже существует"
            );
        }

        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateUserException(
                    "Пользователь с таким email уже существует"
            );
        }

        String passwordHash =
                passwordEncoder.encode(
                        request.password()
                );

        return userRepository.create(
                request.username(),
                request.email(),
                passwordHash,
                UserRole.USER.name()
        );
    }

    public TokenResponse login(
            LoginRequest request
    ) {
        UserAuthData user =
                userRepository.findAuthByUsername(
                        request.username()
                );

        if (user == null) {
            throw new UnauthorizedException(
                    "Неверное имя пользователя или пароль"
            );
        }

        boolean passwordMatches =
                passwordEncoder.matches(
                        request.password(),
                        user.passwordHash()
                );

        if (!passwordMatches) {
            throw new UnauthorizedException(
                    "Неверное имя пользователя или пароль"
            );
        }

        log.info("Authentication succeeded for user id={}", user.id());
        return createTokens(user);
    }

    public TokenResponse refresh(
            RefreshTokenRequest request
    ) {
        String refreshToken =
                request.refreshToken();

        if (!jwtService.isRefreshToken(refreshToken)) {
            throw new UnauthorizedException(
                    "Ожидался refresh-токен"
            );
        }

        String username =
                jwtService.getUsername(refreshToken);

        UserAuthData user =
                userRepository.findAuthByUsername(
                        username
                );

        if (user == null) {
            throw new UnauthorizedException(
                    "Пользователь больше не существует"
            );
        }

        log.info("Authentication succeeded for user id={}", user.id());
        return createTokens(user);
    }

    private TokenResponse createTokens(
            UserAuthData user
    ) {
        String accessToken =
                jwtService.generateAccessToken(user);

        String refreshToken =
                jwtService.generateRefreshToken(user);

        return new TokenResponse(
                accessToken,
                refreshToken
        );
    }
}