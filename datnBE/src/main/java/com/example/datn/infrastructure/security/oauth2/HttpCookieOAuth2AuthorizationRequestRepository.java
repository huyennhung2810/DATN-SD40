package com.example.datn.infrastructure.security.oauth2;

import com.example.datn.infrastructure.constant.OAuth2Constant;
import com.example.datn.utils.CookieUtils;
import com.nimbusds.oauth2.sdk.util.StringUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;

@Component
public class HttpCookieOAuth2AuthorizationRequestRepository implements AuthorizationRequestRepository<OAuth2AuthorizationRequest> {
    private static final int cookieExpireSeconds = 180;

    @Override
    public void saveAuthorizationRequest(OAuth2AuthorizationRequest authorizationRequest, HttpServletRequest request, HttpServletResponse response) {
        if(authorizationRequest == null) {
            CookieUtils.deleteCookie(request, response, OAuth2Constant.OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME);
            CookieUtils.deleteCookie(request, response, OAuth2Constant.REDIRECT_URI_PARAM_COOKIE_NAME);
            CookieUtils.deleteCookie(request, response, OAuth2Constant.SCREEN_FOR_ROLE_COOKIE_NAME);

            return;
        }

        CookieUtils.addCookie(
                response,
                OAuth2Constant.OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME,
                CookieUtils.serialize(authorizationRequest),
                cookieExpireSeconds
        );
        String redirectUriAfterLogin = request.getParameter(OAuth2Constant.REDIRECT_URI_PARAM_COOKIE_NAME);
        if(StringUtils.isNotBlank(redirectUriAfterLogin)) {
            CookieUtils.addCookie(response, OAuth2Constant.REDIRECT_URI_PARAM_COOKIE_NAME, redirectUriAfterLogin, cookieExpireSeconds);
        }

        String screenForRole = request.getParameter(OAuth2Constant.SCREEN_FOR_ROLE_COOKIE_NAME);
        if(StringUtils.isNotBlank(screenForRole)) {
            CookieUtils.addCookie(response, OAuth2Constant.SCREEN_FOR_ROLE_COOKIE_NAME, screenForRole, cookieExpireSeconds);
        }
    }
    @Override
    public OAuth2AuthorizationRequest removeAuthorizationRequest(HttpServletRequest request, HttpServletResponse response) {
        return this.loadAuthorizationRequest(request);
    }

    public void removeAuthorizationRequestCookies(HttpServletRequest request, HttpServletResponse response) {
        CookieUtils.deleteCookie(request, response, OAuth2Constant.OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME);
        CookieUtils.deleteCookie(request, response, OAuth2Constant.REDIRECT_URI_PARAM_COOKIE_NAME);
        CookieUtils.deleteCookie(request, response, OAuth2Constant.SCREEN_FOR_ROLE_COOKIE_NAME);
    }

    @Override
    public OAuth2AuthorizationRequest loadAuthorizationRequest(HttpServletRequest request) {
        return CookieUtils.getCookie(request, OAuth2Constant.OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME)
                .map(cookie -> CookieUtils.deserialize(cookie, OAuth2AuthorizationRequest.class))
                .orElse(null);
    }
}
