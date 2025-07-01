package org.fitsync.filter;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.fitsync.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;

import com.fasterxml.jackson.databind.ObjectMapper;

@WebFilter("/AuthTokenFilter")
public class AuthTokenFilter implements Filter {

    public AuthTokenFilter() {}
  	public void destroy() {}
  	public void init(FilterConfig fConfig) throws ServletException {}

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        String token = null;
        Cookie[] cookies = req.getCookies();
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
            Long userIdx = jwtUtil.getUserIdx(token);
            // 세션이 없으면 생성(true), 있으면 그대로 사용
            HttpSession session = req.getSession(true);
            session.setAttribute("member_idx", userIdx);
            chain.doFilter(request, response);
            System.out.println("aaaaa");
            return;
        }

        // 인증 실패 시 응답
        
        res.setContentType("application/json;charset=UTF-8");
        res.getWriter().write("{\"success\":false,\"msg\":\"인증 실패\"}");
    }

    private void sendJsonResponse(HttpServletResponse res, Map<String, Object> result, int status) throws IOException {
        res.setStatus(status);
        res.setContentType("application/json;charset=UTF-8");
        ObjectMapper mapper = new ObjectMapper();
        res.getWriter().write(mapper.writeValueAsString(result));
    }
  
}
