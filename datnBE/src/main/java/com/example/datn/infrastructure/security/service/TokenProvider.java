package com.example.datn.infrastructure.security.service;

import com.example.datn.entity.Customer;
import com.example.datn.entity.Employee;
import com.example.datn.infrastructure.constant.CookieConstant;
import com.example.datn.infrastructure.constant.OAuth2Constant;
import com.example.datn.infrastructure.security.exception.RedirectException;
import com.example.datn.infrastructure.security.repository.AuthCustomerRepository;
import com.example.datn.infrastructure.security.repository.AuthRoleRepository;
import com.example.datn.infrastructure.security.repository.AuthStaffRepository;
import com.example.datn.infrastructure.security.response.TokenInfoResponse;
import com.example.datn.infrastructure.security.user.UserPrincipal;
import com.example.datn.utils.CookieUtils;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class TokenProvider {
    @Value("${jwt.secret}")
    private String tokenSecret;

    private final long TOKEN_EXP = System.currentTimeMillis() + 2 * 60 * 60 * 100000;

    private final AuthStaffRepository staffRepository;

    private final HttpServletRequest request;

    private final AuthRoleRepository roleRepository;

    private final AuthCustomerRepository customerRepository;

    public String createTokenLogin(Authentication authentication) throws BadRequestException, JsonProcessingException {
        UserPrincipal user = (UserPrincipal) authentication.getPrincipal();

        log.info("Create token login principal: {}", user);

        String screen = request.getParameter(OAuth2Constant.SCREEN_FOR_ROLE_COOKIE_NAME);

        TokenInfoResponse tokenInfoResponse = new TokenInfoResponse();

        if(screen == null) {
            throw new BadRequestException(CookieConstant.ACCOUNT_NOT_EXIST);
        }

        Optional<Employee> optionalStaff = staffRepository.findById(user.getId());

        if(optionalStaff.isPresent()) {
            Employee staff = optionalStaff.get();
            tokenInfoResponse = getTokenSubjectResponse(staff);
            tokenInfoResponse.setRoleScreen(screen);
        }

        String subject = new ObjectMapper().writeValueAsString(tokenInfoResponse);
        Map<String, Object> claims = getBodyClaims(tokenInfoResponse);

        String token = Jwts.builder()
                .setSubject(subject)
                .setClaims(claims)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(TOKEN_EXP))
                .setIssuer("sd20201.datn")
                .signWith(Keys.hmacShaKeyFor(tokenSecret.getBytes()))
                .compact();

        log.info("Created token login: {}", token);
        return token;
    }

    public String createToken(Authentication authentication) throws BadRequestException, JsonProcessingException {
        log.info("Creating new token: {}", authentication.toString());

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        Optional<String> screenForRole = CookieUtils.getCookie(request, OAuth2Constant.SCREEN_FOR_ROLE_COOKIE_NAME)
                .map(Cookie::getValue);

        TokenInfoResponse tokenInfoResponse = new TokenInfoResponse();
        if (screenForRole.isEmpty()) {
            throw new RedirectException(CookieConstant.ACCOUNT_NOT_EXIST);
        } else {
            Optional<Employee> optionalStaff = getCurrentStaffLogin(userPrincipal.getEmail());

            if (optionalStaff.isPresent()) {
                tokenInfoResponse = getTokenSubjectResponse(optionalStaff.get());
                tokenInfoResponse.setRoleScreen(screenForRole.get());
            }

            Optional<Customer> optionalCustomer = customerRepository.findByEmail(userPrincipal.getEmail());

            if (optionalCustomer.isPresent()) {
                tokenInfoResponse = getTokenSubjectResponse(optionalCustomer.get());
                tokenInfoResponse.setRoleScreen(screenForRole.get());
            }
        }

        String subject = new ObjectMapper().writeValueAsString(tokenInfoResponse);
        Map<String, Object> claims = getBodyClaims(tokenInfoResponse);

        String token = Jwts.builder()
                .setSubject(subject)
                .setClaims(claims)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(TOKEN_EXP))
                .setIssuer("sd20201.datn")
                .signWith(Keys.hmacShaKeyFor(tokenSecret.getBytes()))
                .compact();

        log.info("Created token: {}", token);
        return token;
    }

    public String generateToken(Map<String, Object> claims) throws JsonProcessingException {
        String subject = new ObjectMapper().writeValueAsString(claims);
        return Jwts.builder()
                .setSubject(subject)
                .setClaims(claims)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(TOKEN_EXP))
                .setIssuer("sd20201.datn")
                .signWith(Keys.hmacShaKeyFor(tokenSecret.getBytes()))
                .compact();
    }

    private Map<String, Object> getBodyClaims(TokenInfoResponse tokenInfoResponse) {
        Map<String, Object> claims = new HashMap<>();

        claims.put("userId", tokenInfoResponse.getUserId());
        claims.put("userName", tokenInfoResponse.getFullName());
        claims.put("userCode", tokenInfoResponse.getUserCode());
        claims.put("username", tokenInfoResponse.getUsername());
        claims.put("fullName", tokenInfoResponse.getFullName());
        claims.put("pictureUrl", tokenInfoResponse.getPictureUrl());
        List<String> rolesCode = tokenInfoResponse.getRolesCode();
        List<String> rolesName = tokenInfoResponse.getRolesName();
        claims.put("rolesCode", rolesCode);
        claims.put("rolesName", rolesName);
        claims.put("host", tokenInfoResponse.getHost());
        claims.put("roleScreen", tokenInfoResponse.getRoleScreen());
        claims.put("roleSwitch", tokenInfoResponse.getRoleSwitch());
        claims.put("email", tokenInfoResponse.getEmail());

        return claims;
    }

    private TokenInfoResponse getTokenSubjectResponse(Employee staff) {
        TokenInfoResponse tokenInfoResponse = new TokenInfoResponse();

        tokenInfoResponse.setUserId(staff.getId());
        tokenInfoResponse.setFullName(staff.getName());
        tokenInfoResponse.setUserCode(staff.getCode());
        tokenInfoResponse.setEmail(staff.getEmail() != null ? staff.getEmail() : "");
        tokenInfoResponse.setUsername(staff.getAccount().getUsername());
        List<String> rolesCode = roleRepository.getRoleCodeByUsername(staff.getAccount().getUsername());
        if (!rolesCode.isEmpty()) {
            tokenInfoResponse.setRolesCode(rolesCode);
            tokenInfoResponse.setRolesName(rolesCode);
        }

        tokenInfoResponse.setHost(request.getRemoteHost());
        tokenInfoResponse.setRoleSwitch("true");

        return tokenInfoResponse;
    }

    private TokenInfoResponse getTokenSubjectResponse(Customer customer) {
        TokenInfoResponse tokenInfoResponse = new TokenInfoResponse();

        tokenInfoResponse.setUserId(customer.getId());
        tokenInfoResponse.setFullName(customer.getName());
        tokenInfoResponse.setUserCode(customer.getCode());
        tokenInfoResponse.setEmail(customer.getEmail() != null ? customer.getEmail() : "");
        tokenInfoResponse.setUsername(customer.getAccount().getUsername());
        List<String> rolesCode = roleRepository.getRoleCodeByUsername(customer.getAccount().getUsername());
        if (!rolesCode.isEmpty()) {
            tokenInfoResponse.setRolesCode(rolesCode);
            tokenInfoResponse.setRolesName(rolesCode);
        }

        tokenInfoResponse.setHost(request.getRemoteHost());
        tokenInfoResponse.setRoleSwitch("true");

        return tokenInfoResponse;
    }

    public String getUserIdFormToken(String token) {
        Claims claims = getClaimsToken(token);
        return claims.get("userId", String.class);
    }

    public String getUsernameFromToken(String token) {
        Claims claims = getClaimsToken(token);
        return claims.get("username", String.class);
    }

    public String getEmailFormToken(String token) {
        Claims claims = getClaimsToken(token);
        return claims.get("email", String.class);
    }

    private Claims getClaimsToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(tokenSecret.getBytes()))
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor(tokenSecret.getBytes()))
                    .build()
                    .parseClaimsJws(authToken);
            return true;
        } catch (SignatureException ex) {
            log.error("Invalid JWT signature");
        } catch (MalformedJwtException ex) {
            log.error("Invalid JWT token");
        } catch (ExpiredJwtException ex) {
            log.error("Expired JWT token");
        } catch (UnsupportedJwtException ex) {
            log.error("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            log.error("JWT claims string is empty.");
        }
        return false;
    }

    public List<String> getRolesFormToken(String authToken) {
        Claims claims = getClaimsToken(authToken);
        log.info("Claims from token: {}", claims);
        return claims.get("rolesCode", List.class);
    }

    private Optional<Employee> getCurrentStaffLogin(String email) {
        return staffRepository.findByEmail(email);
    }
}
