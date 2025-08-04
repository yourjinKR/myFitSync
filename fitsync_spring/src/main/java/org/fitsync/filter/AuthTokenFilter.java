package org.fitsync.filter;

import org.fitsync.util.JwtUtil;

import io.jsonwebtoken.Claims;

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
import java.sql.Date;

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
            // 사용자 정보 추출
            Integer memberIdx = jwtUtil.getUserIdx(token).intValue();
            
            java.util.Date blockDate = jwtUtil.getBlockDate(token);
            if(blockDate != null) {
            	request.setAttribute("block_date", blockDate);
            	httpRequest.getSession().setAttribute("block_date", blockDate);            	
            }

            // request에 저장
            request.setAttribute("member_idx", memberIdx);

            // 세션에도 저장
            httpRequest.getSession().setAttribute("member_idx", memberIdx);

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
        // 정확한 경로 매칭을 위해 루트 경로를 먼저 체크
        if ("/".equals(requestURI)) {
            return true; // 메인 페이지만 허용
        }
        
        // 인증이 필요하지 않은 경로들 (로그인, 회원가입, 정적 리소스만)
        String[] publicPaths = {
            "/auth",           // 인증 관련 API (로그인, 회원가입)
            "/login",          // 로그인 페이지
            "/register",       // 회원가입 페이지
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