package com.example.webprog;

import com.example.webprog.exception.UnauthorizedException;
import com.example.webprog.security.JwtService;
import com.example.webprog.security.UserAuthData;
import org.junit.jupiter.api.Test;
import java.util.Base64;
import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTests {
    private final String secret = Base64.getEncoder().encodeToString(new byte[32]);
    private final UserAuthData user = new UserAuthData(1L, "reader", "hash", "USER");
    private final JwtService service = new JwtService(secret, 60000, 120000);

    @Test
    void accessAndRefreshHaveDifferentPurposes() {
        String access = service.generateAccessToken(user);
        String refresh = service.generateRefreshToken(user);
        assertTrue(service.isAccessToken(access));
        assertFalse(service.isAccessToken(refresh));
        assertTrue(service.isRefreshToken(refresh));
        assertFalse(service.isRefreshToken(access));
        assertEquals("reader", service.getUsername(access));
        assertEquals("USER", service.parseToken(access).get("role"));
    }

    @Test
    void rejectsExpiredMalformedAndWronglySignedTokens() {
        JwtService expired = new JwtService(secret, -60000, -60000);
        assertThrows(UnauthorizedException.class, () -> service.parseToken(expired.generateAccessToken(user)));
        assertThrows(UnauthorizedException.class, () -> service.parseToken("not-a-jwt"));
        String anotherSecret = Base64.getEncoder().encodeToString("another-key-with-at-least-32-bytes!".getBytes());
        JwtService other = new JwtService(anotherSecret, 60000, 120000);
        assertThrows(UnauthorizedException.class, () -> service.parseToken(other.generateAccessToken(user)));
    }
}
