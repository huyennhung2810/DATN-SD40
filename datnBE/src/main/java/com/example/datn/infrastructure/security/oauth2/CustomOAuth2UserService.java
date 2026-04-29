package com.example.datn.infrastructure.security.oauth2;

import com.example.datn.entity.Account;
import com.example.datn.entity.Customer;
import com.example.datn.entity.Employee;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.infrastructure.constant.OAuth2Constant;
import com.example.datn.infrastructure.security.exception.OAuth2AuthenticationProcessingException;
import com.example.datn.infrastructure.security.oauth2.user.OAuth2UserInfo;
import com.example.datn.infrastructure.security.oauth2.user.OAuth2UserInfoFactory;
import com.example.datn.infrastructure.security.repository.AuthAccountRepository;
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
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    private final HttpServletRequest request;
    private final HttpServletResponse response;
    private final AuthStaffRepository staffRepository;
    private final AuthRoleRepository roleRepository;
    private final AuthCustomerRepository customerRepository;
    private final AuthAccountRepository accountRepository; // Thêm Repo Account để tạo mới
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional // Đảm bảo lưu cả Account và Customer cùng lúc
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        log.info("OAuth2User login attempt: {}", oAuth2User.getAttributes().get("email"));

        try {
            return processOAuth2User(userRequest, oAuth2User);
        } catch (AuthenticationException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Internal OAuth2 Error: ", ex);
            throw new InternalAuthenticationServiceException(ex.getMessage(), ex.getCause());
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest oAuth2UserRequest, OAuth2User oAuth2User) {
        // 1. Lấy thông tin user từ Factory
        OAuth2UserInfo oAuth2UserInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(
                oAuth2UserRequest.getClientRegistration().getRegistrationId(),
                oAuth2User.getAttributes());

        if (oAuth2UserInfo.getEmail() == null || oAuth2UserInfo.getEmail().isBlank()) {
            throw new OAuth2AuthenticationProcessingException(
                    "Không tìm thấy Email từ nhà cung cấp dịch vụ mạng xã hội.");
        }

        // 2. Lấy role từ cookie (để biết đang đăng nhập ở trang Admin hay Khách)
        String roleValueScreen = CookieUtils.getCookie(request, OAuth2Constant.SCREEN_FOR_ROLE_COOKIE_NAME)
                .map(Cookie::getValue)
                .orElse(OAuth2Constant.ROLE_CUSTOMER);

        log.info("Processing login for role: {}", roleValueScreen);

        // 3. Kiểm tra điều kiện Role
        if (OAuth2Constant.ROLE_ADMIN.equalsIgnoreCase(roleValueScreen)) {
            return this.processAdmin(oAuth2UserInfo);
        } else {
            // 🔥 ĐÂY LÀ DÒNG PHẢI SỬA: Thêm oAuth2UserRequest vào tham số đầu tiên
            return this.processCustomer(oAuth2UserRequest, oAuth2UserInfo);
        }
    }

    // Luồng ADMIN: Phải có sẵn trong DB mới cho vào
    private OAuth2User processAdmin(OAuth2UserInfo oAuth2UserInfo) {
        Employee staff = staffRepository.findByEmail(oAuth2UserInfo.getEmail())
                .orElseThrow(() -> new OAuth2AuthenticationProcessingException(
                        "Email nhân viên [" + oAuth2UserInfo.getEmail() + "] không tồn tại trên hệ thống."));

        List<String> roles = roleRepository.getRoleCodeByUsername(staff.getAccount().getUsername());

        // Cập nhật ảnh từ Google nếu có
        staff.setEmployeeImage(oAuth2UserInfo.getImageUrl());
        staffRepository.save(staff);

        return UserPrincipal.create(staff, oAuth2UserInfo.getAttributes(), roles);
    }

    // 1. Cập nhật hàm gọi để truyền thêm RegistrationId
    private OAuth2User processCustomer(OAuth2UserRequest oAuth2UserRequest, OAuth2UserInfo oAuth2UserInfo) {
        Optional<Customer> optionalCustomer = customerRepository.findByEmail(oAuth2UserInfo.getEmail());
        Customer customer;

        if (optionalCustomer.isPresent()) {
            log.info("Existing customer logging in: {}", oAuth2UserInfo.getEmail());
            customer = optionalCustomer.get();
            customer.setImage(oAuth2UserInfo.getImageUrl());
            customerRepository.save(customer);
        } else {
            // Truyền thêm RegistrationId (google/github) vào đây
            String registrationId = oAuth2UserRequest.getClientRegistration().getRegistrationId();
            log.info("New customer! Registering via Social: {}", oAuth2UserInfo.getEmail());
            customer = registerNewCustomer(oAuth2UserInfo, registrationId);
        }

        List<String> rolesUser = roleRepository.getRoleCodeByUsername(customer.getAccount().getUsername());
        return UserPrincipal.create(customer, oAuth2UserInfo.getAttributes(), rolesUser);
    }

    // 2. Hàm tạo mới tài khoản - ĐÃ FIX LỖI NULL ROLE
    private Customer registerNewCustomer(OAuth2UserInfo oAuth2UserInfo, String registrationId) {
        // Tái sử dụng account nếu đã tồn tại (tránh tạo trùng do customer bị xóa nhưng
        // account còn)
        Account account = accountRepository.findFirstByUsername(oAuth2UserInfo.getEmail());
        if (account == null) {
            account = new Account();
            account.setUsername(oAuth2UserInfo.getEmail());
            account.setEmail(oAuth2UserInfo.getEmail());
            account.setFullName(oAuth2UserInfo.getName());
            account.setPassword(passwordEncoder.encode("OAUTH2_USER_" + UUID.randomUUID().toString()));
            account.setRole(com.example.datn.infrastructure.constant.RoleConstant.CUSTOMER);
            account.setStatus(EntityStatus.ACTIVE);
            try {
                account.setProvider(
                        com.example.datn.infrastructure.constant.AuthProvider.valueOf(registrationId.toLowerCase()));
            } catch (Exception e) {
                log.warn("Lỗi gán provider, đang dùng mặc định");
            }
            account = accountRepository.save(account);
        }

        // Tạo Customer gắn với Account vừa tạo
        Customer customer = new Customer();
        customer.setAccount(account);
        customer.setName(oAuth2UserInfo.getName());
        customer.setEmail(oAuth2UserInfo.getEmail());
        customer.setImage(oAuth2UserInfo.getImageUrl());
        customer.setCode("KH_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        return customerRepository.save(customer);
    }
}