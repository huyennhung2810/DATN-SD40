package com.example.datn.infrastructure.security.oauth2.user;

import com.example.datn.infrastructure.constant.AuthProvider;
import com.example.datn.infrastructure.security.exception.OAuth2AuthenticationProcessingException;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

@Slf4j
public class OAuth2UserInfoFactory {
    public static OAuth2UserInfo getOAuth2UserInfo(String registrationId, Map<String, Object> attributes) {
        log.info("OAuth2UserInfoFactory ===> registrationId = {}, attributes = {} ", registrationId, attributes);

        // Kiểm tra Google
        if (registrationId.equalsIgnoreCase(AuthProvider.google.name())) {
            return new GoogleOAuth2UserInfo(attributes);
        }
        //Mở cửa cho GitHub
        else if (registrationId.equalsIgnoreCase(AuthProvider.github.name())) {
            return new GithubOAuth2UserInfo(attributes);
        }
        else {
            throw new OAuth2AuthenticationProcessingException("Xin lỗi! Đăng nhập với " + registrationId + " chưa được hỗ trợ.");
        }
    }

}
