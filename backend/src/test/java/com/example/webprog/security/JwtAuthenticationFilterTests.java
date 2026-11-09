package com.example.webprog.security;

import com.example.webprog.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.Base64;
import java.util.concurrent.atomic.AtomicBoolean;
import static org.junit.jupiter.api.Assertions.*;

class JwtAuthenticationFilterTests {
    private final JwtService jwt = new JwtService(Base64.getEncoder().encodeToString(new byte[32]), 60000, 120000);
    private static class Users extends UserRepository {
        UserAuthData current;
        Users() { super(null); }
        @Override public UserAuthData findAuthByUsername(String username) { return current; }
    }
    @AfterEach void cleanup() { SecurityContextHolder.clearContext(); }

    @Test void demotionUsesDatabaseRoleEvenWithOldAdminToken() throws Exception {
        Users users = new Users();
        users.current = new UserAuthData(1L, "reader", "hash", "USER");
        String token = jwt.generateAccessToken(new UserAuthData(1L, "reader", "hash", "ADMIN"));
        var request = new MockHttpServletRequest("GET", "/api/requests");
        request.addHeader("Authorization", "Bearer " + token);
        AtomicBoolean continued = new AtomicBoolean();
        new JwtAuthenticationFilter(jwt, users, new JwtAuthenticationEntryPoint()).doFilter(request,
                new MockHttpServletResponse(), (req, res) -> continued.set(true));
        assertTrue(continued.get());
        var authorities = SecurityContextHolder.getContext().getAuthentication().getAuthorities();
        assertTrue(authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_USER")));
        assertFalse(authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));
    }

    @Test void deletedAndRecreatedAccountsAreRejected() throws Exception {
        Users users = new Users();
        var original = new UserAuthData(1L, "reader", "hash", "USER");
        String token = jwt.generateAccessToken(original);
        for (UserAuthData current : new UserAuthData[]{null, new UserAuthData(2L, "reader", "hash", "USER")}) {
            users.current = current;
            var request = new MockHttpServletRequest("GET", "/api/requests");
            request.addHeader("Authorization", "Bearer " + token);
            var response = new MockHttpServletResponse();
            new JwtAuthenticationFilter(jwt, users, new JwtAuthenticationEntryPoint()).doFilter(request, response,
                    (req, res) -> fail("Must not reach controller"));
            assertEquals(401, response.getStatus());
        }
    }

    @Test void refreshTokenCannotAuthorizeApiRequest() throws Exception {
        Users users = new Users();
        users.current = new UserAuthData(1L, "reader", "hash", "ADMIN");
        var request = new MockHttpServletRequest("GET", "/api/requests");
        request.addHeader("Authorization", "Bearer " + jwt.generateRefreshToken(users.current));
        var response = new MockHttpServletResponse();
        new JwtAuthenticationFilter(jwt, users, new JwtAuthenticationEntryPoint()).doFilter(request, response,
                (req, res) -> fail("Refresh token must be rejected"));
        assertEquals(401, response.getStatus());
    }
}
