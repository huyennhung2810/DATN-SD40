package com.example.datn.infrastructure.security.filter;

import com.example.datn.infrastructure.config.global.GlobalVariables;
import com.example.datn.infrastructure.constant.GlobalVariablesConstant;
import com.example.datn.infrastructure.security.service.CustomUserDetailsService;
import com.example.datn.infrastructure.security.service.TokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Slf4j
@Component
public class TokenAuthenticationFilter extends OncePerRequestFilter {

    @Setter(onMethod = @__({@Autowired}))
    private TokenProvider tokenProvider;

    @Setter(onMethod = @__({@Autowired}))
    private CustomUserDetailsService customUserDetailsService;

    @Setter(onMethod = @__({@Autowired}))
    private GlobalVariables globalVariables;
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        try {
            logger.info("request nhận vào trong doFilter");

            String jwt = getJwtFromRequest(request);

            log.info("doFilter internal ===> jwt = {}", jwt);

            if(StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                String username = tokenProvider.getUsernameFromToken(jwt);
                String userId = tokenProvider.getUserIdFormToken(jwt);
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);
                List<String> rolesCode = tokenProvider.getRolesFormToken(jwt);

                UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );

                authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                globalVariables.setGlobalVariable(GlobalVariablesConstant.CURRENT_USER_ID, userId);
                globalVariables.setGlobalVariable(GlobalVariablesConstant.CURRENT_ROLE_CODE, rolesCode);

                SecurityContextHolder.getContext().setAuthentication(authenticationToken);

            }

        } catch (Exception e) {
            log.error("Could not set user authentication in security context", e);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");

        if(StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        return null;
    }
}
