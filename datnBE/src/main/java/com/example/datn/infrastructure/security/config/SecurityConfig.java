package com.example.datn.infrastructure.security.config;

import com.example.datn.infrastructure.constant.MappingConstants;
import com.example.datn.infrastructure.constant.RoleConstant;
import com.example.datn.infrastructure.security.exception.RestAuthenticationEntryPoint;
import com.example.datn.infrastructure.security.filter.TokenAuthenticationFilter;
import com.example.datn.infrastructure.security.oauth2.CustomOAuth2UserService;
import com.example.datn.infrastructure.security.oauth2.HttpCookieOAuth2AuthorizationRequestRepository;
import com.example.datn.infrastructure.security.oauth2.OAuth2AuthenticationFailureHandler;
import com.example.datn.infrastructure.security.oauth2.OAuth2AuthenticationSuccessHandler;

import com.example.datn.infrastructure.security.service.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpMethod;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Collections;
import java.util.List;
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor

public class SecurityConfig {

    private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;
    private final OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final HttpCookieOAuth2AuthorizationRequestRepository httpCookieOAuth2AuthorizationRequestRepository;

    @Value("${frontend.url}")
    private String allowedOrigin;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public TokenAuthenticationFilter tokenAuthenticationFilter() {
        return new TokenAuthenticationFilter();
    }


    @Bean
    public AuthenticationManager authenticationManager(
            PasswordEncoder passwordEncoder,
            CustomUserDetailsService userDetailsService
    ) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setPasswordEncoder(passwordEncoder);
        provider.setUserDetailsService(userDetailsService);
        return new ProviderManager(provider);
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(allowedOrigin));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Cache-Control"));
        config.setAllowCredentials(true);
        config.setExposedHeaders(List.of("Authorization"));
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, CorsConfigurationSource corsConfigurationSource, TokenAuthenticationFilter tokenAuthenticationFilter) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .exceptionHandling(e ->
                        e.authenticationEntryPoint(new RestAuthenticationEntryPoint())
                )
                .authorizeHttpRequests(auth -> auth
                        // 1. Static & Public Resources
                        .requestMatchers("/api/upload/**", "/uploads/**").permitAll()
                        .requestMatchers(MappingConstants.API_AUTH_PREFIX + "/**").permitAll()
                        .requestMatchers(MappingConstants.API_COMMON + "/**").permitAll()
                        .requestMatchers("/api/v1/product-image/**").permitAll()
                        .requestMatchers("/oauth2/**").permitAll()

                        // 2. Public Read-only (Sản phẩm máy ảnh)
                        .requestMatchers(HttpMethod.GET, MappingConstants.API_ADMIN_PREFIX + "/product-category/**").permitAll()
                        .requestMatchers(HttpMethod.GET, MappingConstants.API_ADMIN_PREFIX + "/product/**").permitAll()
                        .requestMatchers(HttpMethod.GET, MappingConstants.API_ADMIN_PREFIX + "/tech-spec/**").permitAll()
                        .requestMatchers(HttpMethod.GET, MappingConstants.API_ADMIN_PREFIX + "/banner/**").permitAll()
                        .requestMatchers(HttpMethod.GET, MappingConstants.API_ADMIN_PREFIX + "/products/**").permitAll()

                        // 3. Role-based Authorization
                        .requestMatchers(MappingConstants.API_ADMIN_PREFIX + "/**")
                        .hasAnyAuthority(RoleConstant.ADMIN.name(), RoleConstant.STAFF.name())
                        .requestMatchers(MappingConstants.API_VERSION_PREFIX + "/customer/**")
                        .hasAuthority(RoleConstant.CUSTOMER.name())

                        // 4. Các request còn lại
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .authorizationEndpoint(authorization -> authorization
                                .baseUri("/oauth2/authorize")
                                .authorizationRequestRepository(httpCookieOAuth2AuthorizationRequestRepository)
                        )
                        .redirectionEndpoint(redirection -> redirection
                                .baseUri("/oauth2/callback/*")
                        )
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2UserService)
                        )
                        .successHandler(oAuth2AuthenticationSuccessHandler)
                        .failureHandler(oAuth2AuthenticationFailureHandler)
                );

        http.addFilterBefore(tokenAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
