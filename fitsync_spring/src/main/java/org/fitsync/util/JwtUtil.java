package org.fitsync.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {
    @Value("${jwt.secret:YourSecretKeyMustBeAtLeast32CharactersLong!}")
    private String secret;

    private long expirationMs = 8 * 60 * 60 * 1000L; // 8시간

    private Key key;

    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    // 이메일도 claim에 추가 (원하면)
    public String generateToken(int idx, java.sql.Date date, int count, String email) {
        Date now = new Date();
        Date expiration = new Date(now.getTime() + expirationMs);

        JwtBuilder builder = Jwts.builder()
                .setSubject(String.valueOf(idx))
                .setIssuedAt(now)
                .setExpiration(expiration)
                .claim("block_date", date)
                .claim("block_count", count)
                .claim("email", email);

        return builder
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Long getUserIdx(String token) {
        Claims claims = parseClaims(token);
        return Long.parseLong(claims.getSubject());
    }

    public String getEmail(String token) {
        Claims claims = parseClaims(token);
        return claims.get("email", String.class);
    }

    public boolean validate(String token) {
        try {
            Claims claims = parseClaims(token);
            Date expiration = claims.getExpiration();
            Date now = new Date();
            return !expiration.before(now);
        } catch (ExpiredJwtException e) {
            return false;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public Key getKey() {
        return this.key;
    }
}