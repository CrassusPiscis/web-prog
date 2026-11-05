package com.example.webprog.security;

import com.example.webprog.exception.UnauthorizedException;
import com.example.webprog.repository.UserRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter
        extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    private final JwtAuthenticationEntryPoint
            authenticationEntryPoint;


    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserRepository userRepository,
            JwtAuthenticationEntryPoint authenticationEntryPoint
    ) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.authenticationEntryPoint =
                authenticationEntryPoint;
    }


    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authorizationHeader =
                request.getHeader("Authorization");


        if (
                authorizationHeader == null
                        || !authorizationHeader.startsWith("Bearer ")
        ) {
            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }


        String token =
                authorizationHeader.substring(7);


        try {
            Claims claims =
                    jwtService.parseToken(token);


            String type =
                    claims.get(
                            "type",
                            String.class
                    );


            if (!"access".equals(type)) {
                throw new UnauthorizedException(
                        "Ожидался access-токен"
                );
            }


            String username =
                    claims.getSubject();

            if (username == null || username.isBlank()) {
                throw new UnauthorizedException(
                        "Некорректный токен"
                );
            }

            // Роль могла измениться после выдачи токена: читаем её из БД.
            UserAuthData user = userRepository.findAuthByUsername(username);

            if (user == null) {
                throw new UnauthorizedException(
                        "Пользователь больше не существует"
                );
            }

            // Не позволяем старому токену войти в заново созданный аккаунт
            // с тем же именем, но другим ID.
            Number tokenUserId = claims.get("userId", Number.class);
            if (tokenUserId == null || user.id() == null
                    || tokenUserId.longValue() != user.id().longValue()) {
                throw new UnauthorizedException("Некорректный токен");
            }

            String role = user.role();

            if (
                    !"USER".equals(role)
                            && !"ADMIN".equals(role)
            ) {
                throw new UnauthorizedException(
                        "Некорректная роль"
                );
            }


            var authorities =
                    List.of(
                            new SimpleGrantedAuthority(
                                    "ROLE_" + role
                            )
                    );


            var authentication =
                    new UsernamePasswordAuthenticationToken(
                            username,
                            null,
                            authorities
                    );


            SecurityContextHolder
                    .getContext()
                    .setAuthentication(
                            authentication
                    );


        } catch (UnauthorizedException exception) {

            SecurityContextHolder.clearContext();

            authenticationEntryPoint.commence(
                    request,
                    response,
                    new BadCredentialsException(
                            exception.getMessage(),
                            exception
                    )
            );
            return;
        }

        filterChain.doFilter(request, response);
    }


    @Override
    protected boolean shouldNotFilter(
            HttpServletRequest request
    ) {

        return request
                .getServletPath()
                .startsWith("/api/auth/");
    }
}
