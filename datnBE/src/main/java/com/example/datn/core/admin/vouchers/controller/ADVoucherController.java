package com.example.datn.core.admin.vouchers.controller;


import com.example.datn.core.admin.vouchers.model.PostOrPutVoucherDto;
import com.example.datn.core.admin.vouchers.model.request.ADVoucherSearchRequest;
import com.example.datn.core.admin.vouchers.service.ADVoucherService;
import com.example.datn.infrastructure.constant.MappingConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/vouchers")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:6689")
public class ADVoucherController {

    private final ADVoucherService adVoucherService;
    @GetMapping
    public ResponseEntity<?> GetALlVouchers(ADVoucherSearchRequest request) {
        // Log để kiểm tra các tham số request gửi lên
        log.info("Request tìm kiếm voucher: {}", request);
        return ResponseEntity.ok(adVoucherService.getAllVoucher(request));
    }
    // 2. Lấy chi tiết một Voucher theo ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        log.info("Truy vấn chi tiết voucher ID: {}", id);
        return ResponseEntity.ok(adVoucherService.getByVoucher(id));
    }

    // 3. Thêm mới Voucher
    @PostMapping
    public ResponseEntity<?> create(@RequestBody PostOrPutVoucherDto dto) {
        log.info("Hành động: Thêm mới Voucher - Data: {}", dto);
        return ResponseEntity.ok(adVoucherService.createOrUpdate(null, dto));
    }

    // 4. C ập nhật Voucher theo ID
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id,@Valid @RequestBody PostOrPutVoucherDto dto) {
        log.info("Hành động: Cập nhật Voucher ID: {} - Data: {}", id, dto);
        return ResponseEntity.ok(adVoucherService.createOrUpdate(id, dto));
    }

    // 5. Xóa Voucher
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        log.info("Hành động: Xóa Voucher ID: {}", id);
        return ResponseEntity.ok(adVoucherService.delete(id));
    }
}
