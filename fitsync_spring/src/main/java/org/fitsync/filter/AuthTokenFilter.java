package org.fitsync.filter;

import org.fitsync.util.JwtUtil;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class AuthTokenFilter implements Filter {
    private JwtUtil jwtUtil;

    public void setJwtUtil(JwtUtil jwtUtil) { this.jwtUtil = jwtUtil; }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {}

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        String requestURI = httpRequest.getRequestURI();
        
        // 인증이 필요하지 않은 경로들
        if (isPublicPath(requestURI)) {
            chain.doFilter(request, response);
            return;
        }
        
        String token = null;
        Cookie[] cookies = httpRequest.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("accessToken".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        if (token != null && jwtUtil != null && jwtUtil.validate(token)) {
            // 세션 대신 request attribute 사용 (필요하다면 세션 사용)
            request.setAttribute("member_idx", jwtUtil.getUserIdx(token).intValue());
            chain.doFilter(request, response);
            return;
        }

        httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        httpResponse.setContentType("application/json;charset=UTF-8");
        httpResponse.getWriter().write("{\"success\":false,\"msg\":\"인증 실패\"}");
    }
    
    /**
     * 인증이 필요하지 않은 공개 경로인지 확인
     */
    private boolean isPublicPath(String requestURI) {
        // 인증이 필요하지 않은 경로들
        String[] publicPaths = {
            "/auth",           // 인증 관련 API
            "/",               // 메인 페이지
            "/static",         // 정적 리소스
            "/css",           // CSS 파일
            "/js",            // JavaScript 파일
            "/images",        // 이미지 파일
            "/favicon.ico",   // 파비콘
            "/robots.txt",    // robots.txt
            "/manifest.json", // PWA manifest
            "/public",        // public 폴더
            "/resources",     // 리소스 폴더
            "/assets"         // 에셋 폴더
        };
        
        for (String path : publicPaths) {
            if (requestURI.startsWith(path)) {
                return true;
            }
        }
        
        // 확장자로 판단 (정적 파일들)
        String[] publicExtensions = {
            ".css", ".js", ".png", ".jpg", ".jpeg", ".gif", ".ico", 
            ".svg", ".woff", ".woff2", ".ttf", ".eot", ".map"
        };
        
        for (String ext : publicExtensions) {
            if (requestURI.endsWith(ext)) {
                return true;
            }
        }
        
        return false;
    }

    @Override
    public void destroy() {}
}