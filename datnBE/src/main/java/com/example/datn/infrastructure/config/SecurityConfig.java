package com.example.datn.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(Customizer.withDefaults()) // Kích hoạt CORS
                .csrf(csrf -> csrf.disable())    // Tạm thời disable để test
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/admin/vouchers/**").permitAll() // Cho phép truy cập voucher
                        .anyRequest().permitAll() // Tạm thời permitAll để kiểm tra dữ liệu có lên không
                );
        return http.build();
    }
}
