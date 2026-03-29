package com.loanlens.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

@Service
@Slf4j
public class JwtService {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.access-token-expiry-ms:900000}")
    private long accessTokenExpiry;

    @Value("${app.jwt.refresh-token-expiry-ms:604800000}")
    private long refreshTokenExpiry;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateAccessToken(String userId, String email) {
        return buildToken(Map.of("type", "access"), email, userId.toString(), accessTokenExpiry);
    }

    public String generateRefreshToken(String userId, String email) { 
        return buildToken(Map.of("type", "refresh"), email, userId.toString(), refreshTokenExpiry);
    }

    private String buildToken(Map<String, Object> claims, String subject, String userId, long expiry) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .id(UUID.randomUUID().toString())
                .claim("userId", userId)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiry))
                .signWith(getSigningKey())
                .compact();
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractUserId(String token) {
        return extractClaim(token, c -> c.get("userId", String.class));
    }

    public boolean isTokenValid(String token) {
        try {
            Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    public long getAccessTokenExpiry() { return accessTokenExpiry; }

    private <T> T extractClaim(String token, Function<Claims, T> resolver) {
        Claims claims = Jwts.parser().verifyWith(getSigningKey()).build()
                .parseSignedClaims(token).getPayload();
        return resolver.apply(claims);
    }
}
