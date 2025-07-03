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
        // JWT 검증 코드
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
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
        System.out.println("token : " + token);
        System.out.println("jwtUtil : " + jwtUtil);
        System.out.println("jwtUtil.validate(token) : " + jwtUtil.validate(token));
        if (token != null && jwtUtil != null && jwtUtil.validate(token)) {
            chain.doFilter(request, response);
            return;
        }

        httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        httpResponse.setContentType("application/json;charset=UTF-8");
        httpResponse.getWriter().write("{\"success\":false,\"msg\":\"인증 실패\"}");
    }

    @Override
    public void destroy() {}
}
