package com.example.datn.core.admin.customer.service.Impl;

import com.example.datn.core.admin.customer.model.request.ADAddressRequest;
import com.example.datn.core.admin.customer.model.request.ADCustomerRequest;
import com.example.datn.core.admin.customer.model.request.ADCustomerSearchRequest;
import com.example.datn.core.admin.customer.repository.ADAddressRepository;
import com.example.datn.core.admin.customer.repository.ADCustomerRepository;
import com.example.datn.core.admin.customer.service.ADCustomerService;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.entity.Account;
import com.example.datn.entity.Address;
import com.example.datn.entity.Customer;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.infrastructure.constant.RoleConstant;
import com.example.datn.repository.AccountRepository;
import com.example.datn.utils.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ADCustomerServiceImpl implements ADCustomerService {

    private final ADCustomerRepository adCustomerRepository;
    private final CloudinaryUtils cloudinaryUtils;
    private final AccountRepository accountRepository;
    private final ADAddressRepository adAddressRepository;

    private void mapRequestToEntity(ADCustomerRequest req, Customer customer) {
        customer.setCode(req.getCode());
        customer.setName(req.getName());
        customer.setEmail(req.getEmail());
        customer.setPhoneNumber(req.getPhoneNumber());
        customer.setGender(req.getGender());
        customer.setDateOfBirth(req.getDateOfBirth());
        customer.setIdentityCard(req.getIdentityCard());
    }

    private void handleUploadImage(ADCustomerRequest req, Customer customer) {
        if (req.getImage() == null || req.getImage().isEmpty()) return;

        FileUploadUtils.assertAllowed(req.getImage(), FileUploadUtils.IMAGE_PATTERN);
        try {
            if (StringUtils.hasText(customer.getImage())) {
                cloudinaryUtils.deleteImage(customer.getImage());
            }

            String imageUrl = cloudinaryUtils.uploadImage(
                    req.getImage().getBytes(),
                    "customers/" + customer.getId()
            );
            customer.setImage(imageUrl);
        } catch (IOException e) {
            log.error("Lỗi Cloudinary: ", e);
            throw new RuntimeException("Lỗi upload ảnh khách hàng");
        }
    }

    // SỬA: Đổi String thành List<ADAddressRequest>
    private void processAddresses(List<ADAddressRequest> addressRequests, Customer customer, boolean isUpdate) {
        if (addressRequests == null || addressRequests.isEmpty()) {
            return;
        }

        // Nếu là cập nhật (Edit), bạn có thể cần xóa địa chỉ cũ hoặc xử lý ghi đè
        if (isUpdate) {
             adAddressRepository.deleteAllByCustomerId(customer.getId()); // Tùy vào logic của bạn
        }

        List<Address> addresses = addressRequests.stream().map(req -> {
            Address address = new Address();
            address.setCustomer(customer);
            address.setName(req.getName());
            address.setPhoneNumber(req.getPhoneNumber());

            // Gán đầy đủ mã vùng để không bị null
            address.setProvinceCode(req.getProvinceCode());
            address.setWardCode(req.getWardCode());

            address.setProvinceCity(req.getProvinceCity());
            address.setWardCommune(req.getWardCommune());

            address.setAddressDetail(req.getAddressDetail());
            address.setIsDefault(req.getIsDefault() != null ? req.getIsDefault() : false);
            address.setStatus(EntityStatus.ACTIVE);
            return address;
        }).collect(Collectors.toList());

        adAddressRepository.saveAll(addresses);
    }

    @Override
    public ResponseObject<?> getAllCustomer(ADCustomerSearchRequest request) {
        Pageable pageable = Helper.createPageable(request);

        Page<Customer> page = adCustomerRepository.getAllCustomer(
                pageable,
                request.getKeyword(),
                request.getStatus(),
                request.getGender()
        );

        return ResponseObject.success(PageableObject.of(page), "Lấy danh sách khách hàng thành công");
    }

    @Override
    public ResponseObject<?> getCustomerById(String id) {
        return adCustomerRepository.findById(id)
                .map(c -> ResponseObject.success(c, "Lấy khách hàng thành công"))
                .orElse(ResponseObject.error(HttpStatus.NOT_FOUND, "Không tìm thấy khách hàng"));
    }

    @Override
    @Transactional
    public ResponseObject<?> addCustomer(ADCustomerRequest request) {
        // Tạo Account để lưu Role CUSTOMER từ bảng Account
        Account account = new Account();
        account.setRole(RoleConstant.CUSTOMER);
        account.setStatus(EntityStatus.ACTIVE);
        accountRepository.save(account);

        Customer customer = new Customer();
        customer.setAccount(account);
        customer.setStatus(EntityStatus.ACTIVE);
        customer.setAddresses(new ArrayList<>());

        mapRequestToEntity(request, customer);

        // Save lần 1 để lấy ID cho folder ảnh
        adCustomerRepository.save(customer);
        handleUploadImage(request, customer);

        // Save lần 2 để cập nhật URL ảnh
        Customer savedCustomer = adCustomerRepository.save(customer);

        //Lưu địa chỉ
        try {
            processAddresses(request.getAddresses(), savedCustomer, false);
        } catch (Exception e) {
            log.error("Address Error: ", e);
            throw new RuntimeException("Dữ liệu địa chỉ không hợp lệ");
        }

        return ResponseObject.success(savedCustomer, "Thêm mới khách hàng thành công");
    }


    @Override
    @Transactional
    public ResponseObject<?> updateCustomer(ADCustomerRequest request) {
        if (!StringUtils.hasText(request.getId())) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Thiếu ID khách hàng");
        }

        Customer customer = adCustomerRepository.findById(request.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));

        // Cập nhật thông tin
        mapRequestToEntity(request, customer);
        handleUploadImage(request, customer);

        Customer savedCustomer = adCustomerRepository.save(customer);

        try {
            processAddresses(request.getAddresses(), savedCustomer, true);
        } catch (Exception e) {
            log.error("Update Address Error: ", e);
            throw new RuntimeException("Cập nhật địa chỉ thất bại");
        }

        return ResponseObject.success(savedCustomer, "Cập nhật khách hàng thành công");
    }

    private String getFormattedAddress(Customer customer) {
        if (customer.getAddresses() == null || customer.getAddresses().isEmpty()) {
            return "Chưa có địa chỉ";
        }
        Address address = customer.getAddresses().stream()
                .filter(addr -> Boolean.TRUE.equals(addr.getIsDefault()))
                .findFirst()
                .orElse(customer.getAddresses().get(0));

        return String.format("%s, %s, %s, %s",
                address.getAddressDetail(),
                address.getWardCommune(),
                address.getProvinceCity());
    }

    @Override
    public ResponseObject<?> changeCustomerStatus(String id) {
        Customer customer = adCustomerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));

        customer.setStatus(
                customer.getStatus() == EntityStatus.ACTIVE ? EntityStatus.INACTIVE : EntityStatus.ACTIVE
        );

        adCustomerRepository.save(customer);
        return ResponseObject.success(customer, "Đổi trạng thái khách hàng thành công");
    }

    @Override
    public byte[] exportAllCustomers() {
        List<String> headers = List.of(
                "STT", "Mã KH", "Họ Tên", "Email", "Số điện thoại",
                "Giới tính", "Ngày sinh", "Số CCCD", "Trạng thái", "Địa chỉ mặc định"
        );

        List<Customer> customers = adCustomerRepository.findAll();
        AtomicInteger index = new AtomicInteger(1);

        List<List<Object>> data = customers.stream().map(c -> List.<Object>of(
                index.getAndIncrement(),
                Optional.ofNullable(c.getCode()).orElse(""),
                Optional.ofNullable(c.getName()).orElse(""),
                Optional.ofNullable(c.getEmail()).orElse(""),
                Optional.ofNullable(c.getPhoneNumber()).orElse(""),
                c.getGender() != null ? (c.getGender() ? "Nam" : "Nữ") : "Khác",
                c.getDateOfBirth() != null ? DateConverter.convertDateToString(c.getDateOfBirth()) : "---",
                Optional.ofNullable(c.getIdentityCard()).orElse(""),
                EntityStatus.ACTIVE.equals(c.getStatus()) ? "Hoạt động" : "Ngừng",
                getFormattedAddress(c)
        )).collect(Collectors.toList());

        return ExcelHelper.createExcelStream("Danh sách khách hàng", headers, data);
    }

    @Override
    public ResponseObject<?> checkDuplicate(String identityCard, String phoneNumber, String email, String id) {
        // Nếu không có ID (thêm mới), gán ID thành một chuỗi rỗng để query không bị lỗi null
        String safeId = (id == null || id.equalsIgnoreCase("undefined") || id.equalsIgnoreCase("null")) ? "" : id;

        // Kiểm tra trùng CCCD
        if (StringUtils.hasText(identityCard)) {
            boolean exists = StringUtils.hasText(safeId)
                    ? adCustomerRepository.existsByIdentityCardAndIdNot(identityCard, safeId)
                    : adCustomerRepository.existsByIdentityCard(identityCard);
            if (exists) return ResponseObject.success(true, "Số CCCD đã tồn tại");
        }

        // Kiểm tra trùng Số điện thoại
        if (StringUtils.hasText(phoneNumber)) {
            boolean exists = StringUtils.hasText(safeId)
                    ? adCustomerRepository.existsByPhoneNumberAndIdNot(phoneNumber, safeId)
                    : adCustomerRepository.existsByPhoneNumber(phoneNumber);
            if (exists) return ResponseObject.success(true, "Số điện thoại đã tồn tại");
        }

        //Kiểm tra trùng Email
        if (StringUtils.hasText(email)) {
            boolean exists = StringUtils.hasText(safeId)
                    ? adCustomerRepository.existsByEmailAndIdNot(email, safeId)
                    : adCustomerRepository.existsByEmail(email);
            if (exists) return ResponseObject.success(true, "Email đã tồn tại");
        }

        // Không trùng trường nào
        return ResponseObject.success(false, "Dữ liệu hợp lệ");
    }
}
