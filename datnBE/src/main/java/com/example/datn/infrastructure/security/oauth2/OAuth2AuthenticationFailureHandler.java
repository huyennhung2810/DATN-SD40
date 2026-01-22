package com.example.datn.infrastructure.security.oauth2;

import com.example.datn.infrastructure.constant.OAuth2Constant;
import com.example.datn.utils.CookieUtils;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import org.springframework.security.core.AuthenticationException;import java.io.IOException;

@Component
@Slf4j
public class OAuth2AuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {
    @Value("${frontend.url}")
    private String urlFrontend;

    @Autowired
    private HttpCookieOAuth2AuthorizationRequestRepository httpCookieOAuth2AuthorizationRequestRepository;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {
        String screen = CookieUtils.getCookie(request, OAuth2Constant.SCREEN_FOR_ROLE_COOKIE_NAME)
                .map(Cookie::getValue)
                .orElse("/");

        String targetUrl = urlFrontend + OAuth2Constant.REDIRECT_LOGIN_ADMIN;

        httpCookieOAuth2AuthorizationRequestRepository.removeAuthorizationRequest(request, response);

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
