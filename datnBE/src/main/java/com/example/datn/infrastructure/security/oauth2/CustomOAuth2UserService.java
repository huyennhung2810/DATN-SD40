package com.example.datn.infrastructure.security.oauth2;

import com.example.datn.entity.Customer;
import com.example.datn.entity.Employee;
import com.example.datn.infrastructure.constant.CookieConstant;
import com.example.datn.infrastructure.constant.OAuth2Constant;
import com.example.datn.infrastructure.constant.RoleConstant;
import com.example.datn.infrastructure.security.exception.OAuth2AuthenticationProcessingException;
import com.example.datn.infrastructure.security.oauth2.user.OAuth2UserInfo;
import com.example.datn.infrastructure.security.oauth2.user.OAuth2UserInfoFactory;
import com.example.datn.infrastructure.security.repository.AuthCustomerRepository;
import com.example.datn.infrastructure.security.repository.AuthRoleRepository;
import com.example.datn.infrastructure.security.repository.AuthStaffRepository;
import com.example.datn.infrastructure.security.user.UserPrincipal;
import com.example.datn.utils.CookieUtils;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;

import java.util.List;
import java.util.Optional;


@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    private final HttpServletRequest request;

    private final HttpServletResponse response;

    private final AuthStaffRepository staffRepository;

    private final AuthRoleRepository roleRepository;

    private final AuthCustomerRepository customerRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        log.info("OAuth2User loadUser: {}", oAuth2User.toString());

        try {
            return processOAuth2User(userRequest, oAuth2User);
        } catch (AuthenticationException ex) {
            throw ex;
        } catch(Exception ex) {
            throw new InternalAuthenticationServiceException(ex.getMessage(), ex.getCause());
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest oAuth2UserRequest, OAuth2User oAuth2User) {

        OAuth2UserInfo oAuth2UserInfo = OAuth2UserInfoFactory
                .getOAuth2UserInfo(
                        oAuth2UserRequest.getClientRegistration().getRegistrationId(),
                        oAuth2User.getAttributes()
                );

        if(oAuth2UserInfo.getEmail() == null || oAuth2UserInfo.getEmail().isBlank()) {
            log.warn("Email is null or blank, adding failure cookie and throwing exception.");
            CookieUtils.addCookie(response, CookieConstant.ACCOUNT_NOT_EXIST, CookieConstant.ACCOUNT_NOT_EXIST);
            throw new OAuth2AuthenticationProcessingException(CookieConstant.ACCOUNT_NOT_EXIST);
        }

        Optional<Cookie> optionalCookieRole = CookieUtils.getCookie(request, OAuth2Constant.SCREEN_FOR_ROLE_COOKIE_NAME);

        if(optionalCookieRole.isPresent()) {
            String roleValueScreen = optionalCookieRole.get().getValue();

            switch (roleValueScreen) {
                case OAuth2Constant.ROLE_ADMIN -> {
                    log.info("process role admin");
                    return this.processAdmin(oAuth2UserInfo);
                }

                case OAuth2Constant.ROLE_CUSTOMER -> {
                    log.info("process role customer");
                    return this.processCustomer(oAuth2UserInfo);
                }

                default -> {
                    log.info("unknown role : {}", roleValueScreen);
                }
            }
        } else {
            log.warn("Role cookie not found");
        }

        log.warn("Invalid login attempt, adding failure cookie and throwing exception.");
        CookieUtils.addCookie(response, CookieConstant.ACCOUNT_NOT_EXIST, CookieConstant.ACCOUNT_NOT_EXIST);
        throw new OAuth2AuthenticationProcessingException(CookieConstant.ACCOUNT_NOT_EXIST);
    }

    private OAuth2User processAdmin(OAuth2UserInfo oAuth2UserInfo) {
        Optional<Employee> optionalStaff = staffRepository.findByEmail(oAuth2UserInfo.getEmail());

        if(optionalStaff.isPresent()) {
            List<String> rolesUser = roleRepository.getRoleCodeByUsername(optionalStaff.get().getAccount().getUsername());
            if(rolesUser.contains(RoleConstant.ADMIN.name()) || rolesUser.contains(RoleConstant.STAFF.name())) {
                String email = oAuth2UserInfo.getEmail();
                Employee staff = optionalStaff.get();
                staff.setCode(email.substring(0, email.indexOf("@")));
                staff.setEmployeeImage(oAuth2UserInfo.getImageUrl());
                staffRepository.save(staff);
                return UserPrincipal.create(staff, oAuth2UserInfo.getAttributes(), rolesUser);
            } else {
                CookieUtils.addCookie(response, CookieConstant.ACCOUNT_NOT_EXIST, CookieConstant.ACCOUNT_NOT_EXIST);
                throw new OAuth2AuthenticationProcessingException(CookieConstant.ACCOUNT_NOT_EXIST);
            }
        } else {
            CookieUtils.addCookie(response, CookieConstant.ACCOUNT_NOT_EXIST, CookieConstant.ACCOUNT_NOT_EXIST);
            throw new OAuth2AuthenticationProcessingException(CookieConstant.ACCOUNT_NOT_EXIST);
        }
    }

    private OAuth2User processCustomer(OAuth2UserInfo oAuth2UserInfo) {
        Optional<Customer> optionalCustomer = customerRepository.findByEmail(oAuth2UserInfo.getEmail());

        if(optionalCustomer.isPresent()) {
            List<String> rolesUser = roleRepository.getRoleCodeByUsername(optionalCustomer.get().getAccount().getUsername());
            if(rolesUser.contains(RoleConstant.CUSTOMER.name())) {
                String email = oAuth2UserInfo.getEmail();
                Customer customer = optionalCustomer.get();
                customer.setCode(email.substring(0, email.indexOf("@")));
                customer.setImage(oAuth2UserInfo.getImageUrl());
                customerRepository.save(customer);
                return UserPrincipal.create(customer, oAuth2UserInfo.getAttributes(), rolesUser);
            } else {
                CookieUtils.addCookie(response, CookieConstant.ACCOUNT_NOT_EXIST, CookieConstant.ACCOUNT_NOT_EXIST);
                throw new OAuth2AuthenticationProcessingException(CookieConstant.ACCOUNT_NOT_EXIST);
            }
        } else {
            CookieUtils.addCookie(response, CookieConstant.ACCOUNT_NOT_EXIST, CookieConstant.ACCOUNT_NOT_EXIST);
            throw new OAuth2AuthenticationProcessingException(CookieConstant.ACCOUNT_NOT_EXIST);
        }
    }
}
