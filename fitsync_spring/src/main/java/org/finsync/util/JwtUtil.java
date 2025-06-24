package org.finsync.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

import javax.annotation.PostConstruct;
import java.security.Key;
import java.util.Date;

public class JwtUtil {

    private String secret = "YourSecretKeyMustBeAtLeast32CharactersLong!"; // 최소 32자 이상
    private long expirationMs = 1000 * 60 * 60 * 24 * 7; // 7일
    private Key key;

    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    // createToken 파라미터 이름 user -> userId 로 변경 (가독성)
    public String createToken(Long userId) {
        return Jwts.builder()
                .setSubject(String.valueOf(userId))    // 오타 수정: userId 사용
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Long getUserId(String token) {
        Claims claims = parseClaims(token);
        return Long.parseLong(claims.getSubject());
    }

    public boolean validate(String token) {
        try {
            parseClaims(token);
            return true;
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
}
