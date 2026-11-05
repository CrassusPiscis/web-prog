package com.example.webprog.security;

import com.example.webprog.exception.UnauthorizedException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey key;

    private final long accessExpirationMs;
    private final long refreshExpirationMs;


    public JwtService(
            @Value("${jwt.secret}")
            String secret,

            @Value("${jwt.access-expiration-ms}")
            long accessExpirationMs,

            @Value("${jwt.refresh-expiration-ms}")
            long refreshExpirationMs
    ) {
        this.key = Keys.hmacShaKeyFor(
                Decoders.BASE64.decode(secret)
        );

        this.accessExpirationMs =
                accessExpirationMs;

        this.refreshExpirationMs =
                refreshExpirationMs;
    }


    public String generateAccessToken(
            UserAuthData user
    ) {
        return generateToken(
                user,
                "access",
                accessExpirationMs
        );
    }


    public String generateRefreshToken(
            UserAuthData user
    ) {
        return generateToken(
                user,
                "refresh",
                refreshExpirationMs
        );
    }


    private String generateToken(
            UserAuthData user,
            String type,
            long expirationMs
    ) {
        Date now = new Date();

        Date expiration =
                new Date(
                        now.getTime()
                                + expirationMs
                );

        return Jwts.builder()
                .subject(user.username())
                .claim("userId", user.id())
                .claim("role", user.role())
                .claim("type", type)
                .issuedAt(now)
                .expiration(expiration)
                .signWith(key)
                .compact();
    }


    public Claims parseToken(String token) {
        try {
            return Jwts
                    .parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

        } catch (JwtException | IllegalArgumentException e) {

            throw new UnauthorizedException(
                    "Недействительный или просроченный токен"
            );
        }
    }


    public String getUsername(String token) {
        return parseToken(token)
                .getSubject();
    }


    public boolean isAccessToken(String token) {
        String type = parseToken(token)
                .get("type", String.class);

        return "access".equals(type);
    }


    public boolean isRefreshToken(String token) {
        String type = parseToken(token)
                .get("type", String.class);

        return "refresh".equals(type);
    }
}