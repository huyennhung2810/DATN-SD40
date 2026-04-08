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
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpMethod;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor

public class SecurityConfig {

        private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;
        private final OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler;
        private final CustomOAuth2UserService customOAuth2UserService;
        private final HttpCookieOAuth2AuthorizationRequestRepository httpCookieOAuth2AuthorizationRequestRepository;

        @Value("${frontend.url}")
        private String allowedOrigin;

        @Bean
        public TokenAuthenticationFilter tokenAuthenticationFilter() {
                return new TokenAuthenticationFilter();
        }

        @Bean
        public AuthenticationManager authenticationManager(
                        PasswordEncoder passwordEncoder,
                        CustomUserDetailsService userDetailsService) {
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
        public SecurityFilterChain securityFilterChain(HttpSecurity http,
                        CorsConfigurationSource corsConfigurationSource,
                        TokenAuthenticationFilter tokenAuthenticationFilter) throws Exception {
                http
                                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                                .csrf(AbstractHttpConfigurer::disable)
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .exceptionHandling(e -> e.authenticationEntryPoint(new RestAuthenticationEntryPoint()))
                                .authorizeHttpRequests(auth -> auth
                                                // 1. Tài nguyên công khai (Ảnh, Auth, Common)
                                                .requestMatchers("/api/upload/**", "/uploads/**").permitAll()
                                                .requestMatchers(MappingConstants.API_AUTH_PREFIX + "/**").permitAll()
                                                .requestMatchers(MappingConstants.API_COMMON + "/**").permitAll()
                                                .requestMatchers("/api/v1/admin/employee/change-password/**")
                                                .permitAll()
                                                .requestMatchers(MappingConstants.API_LOGIN + "/**").permitAll()
                                                .requestMatchers("/oauth2/**", "/login/oauth2/**", "/error").permitAll()
                                                .requestMatchers("/api/v1/support/**", "/ws-chat/**").permitAll()
                                                .requestMatchers("/api/v1/client/payment/vnpay-return").permitAll()
                                                .requestMatchers("/api/v1/admin/pos/orders/vnpay-return").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/v1/client/vouchers").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/v1/client/product/**")
                                                .permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/v1/public/**").permitAll()

                                                // 2. Quyền xem sản phẩm cho khách vãng lai (Public Read)
                                                .requestMatchers(HttpMethod.GET,
                                                                MappingConstants.ADMIN_PRODUCT_CATEGORY + "/**")
                                                .permitAll()
                                                .requestMatchers(HttpMethod.GET, MappingConstants.ADMIN_BRAND + "/**")
                                                .permitAll()
                                                .requestMatchers(HttpMethod.GET, MappingConstants.ADMIN_PRODUCT + "/**")
                                                .permitAll()
                                                .requestMatchers(HttpMethod.GET,
                                                                MappingConstants.ADMIN_TECH_SPEC + "/**")
                                                .permitAll()
                                                .requestMatchers(HttpMethod.GET, MappingConstants.ADMIN_BANNER + "/**")
                                                .permitAll()
                                                .requestMatchers(HttpMethod.GET,
                                                                MappingConstants.API_ADMIN_PREFIX_PRODUCTS + "/**")
                                                .permitAll()

                                                // Cho phép STAFF xem (GET) dữ liệu để vẽ Lịch
                                                .requestMatchers(HttpMethod.GET,
                                                                MappingConstants.API_ADMIN_PREFIX_EMPLOYEE + "/**")
                                                .hasAnyAuthority(RoleConstant.ADMIN.name(), RoleConstant.STAFF.name())
                                                .requestMatchers(HttpMethod.GET,
                                                                MappingConstants.API_ADMIN_PREFIX_SHIFT_TEMPLATE
                                                                                + "/**")
                                                .hasAnyAuthority(RoleConstant.ADMIN.name(), RoleConstant.STAFF.name())

                                                // 3. CHỈ ADMIN (Quyền nhạy cảm: Tiền bạc, Nhân sự, Tài khoản)
                                                .requestMatchers(MappingConstants.API_ADMIN_PREFIX_STATISTICS + "/**")
                                                .hasAuthority(RoleConstant.ADMIN.name())
                                                .requestMatchers(MappingConstants.API_ADMIN_PREFIX_EMPLOYEE + "/**")
                                                .hasAuthority(RoleConstant.ADMIN.name())
                                                .requestMatchers(MappingConstants.API_ADMIN_PREFIX_SHIFT_TEMPLATE
                                                                + "/**")
                                                .hasAuthority(RoleConstant.ADMIN.name())
                                                .requestMatchers(MappingConstants.API_ADMIN_PREFIX + "/accounts/**")
                                                .hasAuthority(RoleConstant.ADMIN.name())

                                                // 4. ADMIN & STAFF (Nghiệp vụ: Bán hàng, Kho, Voucher, Giao ca)
                                                .requestMatchers(
                                                                MappingConstants.API_ADMIN_PREFIX_PRODUCTS + "/**",
                                                                MappingConstants.API_ADMIN_PREFIX_DISCOUNT + "/**",
                                                                MappingConstants.API_ADMIN_PREFIX_SERIALS + "/**",
                                                                MappingConstants.API_ADMIN_PREFIX_SHIFT_HANDOVER
                                                                                + "/**",
                                                                MappingConstants.API_ADMIN_PREFIX_WORK_SCHEDULE + "/**",
                                                                MappingConstants.API_ADMIN_PREFIX_CUSTOMERS + "/**",
                                                                MappingConstants.ADMIN_BRAND + "/**",
                                                                MappingConstants.ADMIN_PRODUCT_CATEGORY + "/**")
                                                .hasAnyAuthority(RoleConstant.ADMIN.name(), RoleConstant.STAFF.name())

                                                // 5. KHÁCH HÀNG (Mua hàng)
                                                .requestMatchers(MappingConstants.API_VERSION_PREFIX + "/customer/**")
                                                .hasAuthority(RoleConstant.CUSTOMER.name())
                                                .requestMatchers("/api/v1/client/**")
                                                .hasAuthority(RoleConstant.CUSTOMER.name())

                                                // 6. Các request còn lại
                                                .anyRequest().authenticated())
                                .oauth2Login(oauth2 -> oauth2
                                                .authorizationEndpoint(authorization -> authorization
                                                                .baseUri("/oauth2/authorization")
                                                                .authorizationRequestRepository(
                                                                                httpCookieOAuth2AuthorizationRequestRepository))
                                                .redirectionEndpoint(redirection -> redirection
                                                                .baseUri("/login/oauth2/code/*"))
                                                .userInfoEndpoint(userInfo -> userInfo
                                                                .userService(customOAuth2UserService))
                                                .successHandler(oAuth2AuthenticationSuccessHandler)
                                                .failureHandler(oAuth2AuthenticationFailureHandler));

                http.addFilterBefore(tokenAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }
}
