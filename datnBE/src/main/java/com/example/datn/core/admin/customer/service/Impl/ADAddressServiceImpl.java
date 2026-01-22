package com.example.datn.core.admin.customer.service.Impl;

import com.example.datn.core.admin.customer.model.request.ADAddressRequest;
import com.example.datn.core.admin.customer.repository.ADAddressRepository;
import com.example.datn.core.admin.customer.service.ADAddressService;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.entity.Address;
import com.example.datn.entity.Customer;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class ADAddressServiceImpl implements ADAddressService {

    private final ADAddressRepository adAddressRepository;
    private final CustomerRepository customerRepository;

    private void mapRequestToEntity(ADAddressRequest req, Address address) {
        address.setName(req.getName());
        address.setPhoneNumber(req.getPhoneNumber());
        address.setProvinceCode(req.getProvinceCode());
        address.setWardCode(req.getWardCode());
        address.setProvinceCity(req.getProvinceCity());
        address.setWardCommune(req.getWardCommune());

        address.setAddressDetail(req.getAddressDetail());
        address.setIsDefault(req.getIsDefault() != null ? req.getIsDefault() : false);
        address.setStatus(EntityStatus.ACTIVE);
    }
    @Override
    public ResponseObject<?> getByCustomer(String customerId) {

        if (!StringUtils.hasText(customerId)) {
            return ResponseObject.error(
                    HttpStatus.BAD_REQUEST,
                    "Thiếu id khách hàng"
            );
        }

        return ResponseObject.success(
                adAddressRepository.findByCustomerIdAndStatus(
                        customerId,
                        EntityStatus.ACTIVE
                ),
                "Lấy danh sách địa chỉ thành công"
        );
    }

    @Override
    @Transactional
    public ResponseObject<?> createOrUpdate(String customerId, ADAddressRequest request) {
        if (!StringUtils.hasText(customerId)) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Thiếu id khách hàng");
        }

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));

        Address address;
        boolean isUpdate = StringUtils.hasText(request.getId());

        if (isUpdate) {
            address = adAddressRepository
                    .findByIdAndCustomerId(request.getId(), customer.getId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy địa chỉ của khách hàng"));
        } else {
            address = new Address();
            address.setCustomer(customer);
        }

        mapRequestToEntity(request, address);

        // Xử lý địa chỉ mặc định
        if (Boolean.TRUE.equals(address.getIsDefault())) {
            adAddressRepository.unsetDefaultByCustomer(customer.getId());
        }

        adAddressRepository.save(address);

        return ResponseObject.success(
                address,
                isUpdate ? "Cập nhật địa chỉ thành công" : "Thêm địa chỉ thành công"
        );
    }


    @Override
    public ResponseObject<?> delete(String id) {
        if (!StringUtils.hasText(id)) {
            return ResponseObject.error(
                    HttpStatus.BAD_REQUEST,
                    "Thiếu id địa chỉ"
            );
        }

        Address address = adAddressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy địa chỉ"));

        address.setStatus(EntityStatus.INACTIVE);
        address.setIsDefault(false);

        adAddressRepository.save(address);

        return ResponseObject.success(null, "Xóa địa chỉ thành công");
    }

    @Override
    @Transactional
    public ResponseObject<?> setDefault(String id) {

        Address address = adAddressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy địa chỉ"));

        if (address.getStatus() != EntityStatus.ACTIVE) {
            return ResponseObject.error(
                    HttpStatus.BAD_REQUEST,
                    "Không thể đặt mặc định cho địa chỉ không hoạt động"
            );
        }

        adAddressRepository.unsetDefaultByCustomer(
                address.getCustomer().getId()
        );

        address.setIsDefault(true);
        adAddressRepository.save(address);

        return ResponseObject.success(
                address,
                "Đặt địa chỉ mặc định thành công"
        );
    }

}
