package com.example.datn.infrastructure.security.oauth2;

import com.example.datn.infrastructure.constant.OAuth2Constant;
import com.example.datn.infrastructure.security.response.TokenUriResponse;
import com.example.datn.infrastructure.security.service.RefreshTokenService;
import com.example.datn.infrastructure.security.service.TokenProvider;
import com.example.datn.utils.CookieUtils;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Optional;

@Component
@Slf4j
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final TokenProvider tokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final HttpCookieOAuth2AuthorizationRequestRepository httpCookieOAuth2AuthorizationRequestRepository;

    @Value("${frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        String targetUrl = determineTargetUrl(request, response, authentication);

        if (response.isCommitted()) {
            log.debug("Response has already been committed. Unable to redirect to {}", targetUrl);
            return;
        }

        clearAuthenticationAttributes(request, response);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    protected String determineTargetUrl(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        Optional<String> redirectUri = CookieUtils.getCookie(request, OAuth2Constant.REDIRECT_URI_PARAM_COOKIE_NAME)
                .map(Cookie::getValue);

        // Nếu không có redirect_uri trong cookie, có thể redirect về trang chủ frontend
        String targetUrl = redirectUri.orElse(frontendUrl);

        try {
            String token = tokenProvider.createToken(authentication);
            String refreshToken = refreshTokenService.createRefreshToken(authentication).getRefreshToken();

            // Gộp token vào URL (Đảm bảo TokenUriResponse.getState đã encode chuẩn)
            return UriComponentsBuilder.fromUriString(targetUrl)
                    .queryParam("state", TokenUriResponse.getState(token, refreshToken))
                    .build().toUriString();
        } catch (Exception e) {
            log.error("Error creating tokens during OAuth2 success: ", e);
            return frontendUrl + "/login?error=token_creation_failed";
        }
    }

    protected void clearAuthenticationAttributes(HttpServletRequest request, HttpServletResponse response) {
        super.clearAuthenticationAttributes(request);
        httpCookieOAuth2AuthorizationRequestRepository.removeAuthorizationRequestCookies(request, response);
    }
}
