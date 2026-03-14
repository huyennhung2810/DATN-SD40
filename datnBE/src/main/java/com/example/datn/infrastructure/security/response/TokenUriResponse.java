package com.example.datn.infrastructure.security.response;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.extern.slf4j.Slf4j;

import java.util.Base64;

@Setter
@Getter
@AllArgsConstructor
@ToString
@Slf4j
public class TokenUriResponse {
    private String accessToken;
    private String refreshToken;

    public String getTokenAuthorizationSimple() {
        try {
            String json = String.format("{\"accessToken\":\"%s\",\"refreshToken\":\"%s\"}",
                    this.accessToken, this.refreshToken);

            // Dùng thư viện chuẩn của Java để Base64 (Tránh phụ thuộc SecurityUtils cũ)
            return Base64.getEncoder().encodeToString(json.getBytes());
        } catch (Exception e) {
            log.error("Lỗi đóng gói Token: {}", e.getMessage());
            return "";
        }
    }

    public static String getState(
            String accessToken,
            String refreshToken
    ) {
        TokenUriResponse tokenUriResponse = new TokenUriResponse(accessToken, refreshToken);
        return tokenUriResponse.getTokenAuthorizationSimple();
    }
}
