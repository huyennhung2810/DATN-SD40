package com.example.datn.infrastructure.security.oauth2.user;

import lombok.extern.slf4j.Slf4j;

import java.util.Map;

@Slf4j
public class GithubOAuth2UserInfo extends OAuth2UserInfo{
    public GithubOAuth2UserInfo(Map<String, Object> attributes) {
        super(attributes);
    }

    @Override
    public String getId() {
        return String.valueOf(attributes.get("id"));
    }

    @Override
    public String getName() {
        return attributes.get("name") != null ? (String) attributes.get("name") : (String) attributes.get("login");
    }

    @Override
    public String getEmail() {
        String email = (String) attributes.get("email");
        if (email == null) {
           return attributes.get("login") + "@github.com";
        }
        return email;
    }

    @Override
    public String getImageUrl() {
        return (String) attributes.get("avatar_url");
    }
}
