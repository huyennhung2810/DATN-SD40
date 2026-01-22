package com.example.datn.infrastructure.security.response;

import com.example.datn.utils.SecurityUtils;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.extern.slf4j.Slf4j;

@Setter
@Getter
@AllArgsConstructor
@ToString
@Slf4j
public class TokenUriResponse {
    private String accessToken;

    private String refreshToken;

    public String getTokenAuthorizationSimple() {
        String tokenObject = "{" + "\"accessToken\":\"" + accessToken + "\",\"refreshToken\":\"" + refreshToken + "\"}";
        return SecurityUtils.encodeBase64(tokenObject);
    }

    public static String getState(
            String accessToken,
            String refreshToken
    ) {
        TokenUriResponse tokenUriResponse = new TokenUriResponse(accessToken, refreshToken);
        return tokenUriResponse.getTokenAuthorizationSimple();
    }
}
