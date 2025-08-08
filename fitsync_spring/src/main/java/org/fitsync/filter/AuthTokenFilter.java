package org.fitsync.filter;

import org.fitsync.util.JwtUtil;
import org.fitsync.service.MemberServiceImple;
import org.fitsync.domain.MemberVO;

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
    private MemberServiceImple memberService;

    public void setJwtUtil(JwtUtil jwtUtil) { this.jwtUtil = jwtUtil; }
    public void setMemberService(MemberServiceImple memberService) { this.memberService = memberService; }

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
            Integer memberIdx = jwtUtil.getUserIdx(token).intValue();
            
            // DB에서 member_type 조회
            String memberType = null;
            try {
                if (memberService != null) {
                    MemberVO member = memberService.getMemberByIdx(memberIdx);
                    if (member != null) {
                        memberType = member.getMember_type();
                    }
                }
            } catch (Exception e) {
                // DB 조회 실패 시 로그만 남기고 계속 진행
                System.err.println("Failed to get member_type from DB: " + e.getMessage());
            }
            
            // request attribute에 저장
            request.setAttribute("member_idx", memberIdx);
            if (memberType != null) {
                request.setAttribute("member_type", memberType);
            }
            
            // 세션에도 저장
            httpRequest.getSession().setAttribute("member_idx", memberIdx);
            if (memberType != null) {
                httpRequest.getSession().setAttribute("member_type", memberType);
            }
            
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
            "/member/register", // 회원가입 API 추가
            "/member/trainers", // 트레이너 목록 조회 (공개)
            "/static",         // 정적 리소스
            "/css",           // CSS 파일
            "/js",            // JavaScript 파일
            "/images",        // 이미지 파일
            "/favicon.ico",   // 파비콘
            "/robots.txt",    // robots.txt
            "/manifest.json", // PWA manifest
            "/public",        // public 폴더
            "/resources",     // 리소스 폴더
            "/assets",         // 에셋 폴더
            "/trainer/profile",
            "/trainer/lesson",
            "/trainer/awards",
            "/trainer/gym",
            "/trainer/reviews",
            "/trainer/images"
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