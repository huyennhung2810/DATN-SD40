package com.example.datn.core.admin.vouchers.service.Impl;

import com.example.datn.core.admin.vouchers.model.PostOrPutVoucherDto;
import com.example.datn.core.admin.vouchers.model.request.ADVoucherSearchRequest;
import com.example.datn.core.admin.vouchers.repository.ADVouchersRepository;
import com.example.datn.core.admin.vouchers.service.ADVoucherService;
import com.example.datn.core.common.base.PageableObject;
import com.example.datn.core.common.base.ResponseObject;
import com.example.datn.entity.Voucher;
import com.example.datn.utils.Helper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ADVoucherServiceImpl implements ADVoucherService {
    private final ADVouchersRepository  adVouchersRepository;

    @Override
    public ResponseObject<?> getAllVoucher(ADVoucherSearchRequest request) {
        // 1. Tạo đối tượng phân trang từ Helper (lấy page và size từ request)
        Pageable pageable = Helper.createPageable(request);

        // 2. Gọi Repository với đầy đủ 5 tham số lọc
        Page<Voucher> page = adVouchersRepository.getAllVouchers(
                pageable,
                request.getKeyword(),
                request.getStatus(),
                request.getVoucherType(),
                request.getStartDate(), // Tham số mới
                request.getEndDate()    // Tham số mới
        );

        // 3. Trả về kết quả bọc trong PageableObject để Frontend xử lý phân trang
        return ResponseObject.success(PageableObject.of(page), "Lấy danh sách voucher thành công");
    }



    @Override
    public ResponseObject<?> getByVoucher(String voucherId) {
        // Tìm Voucher theo ID, nếu không thấy thì trả về thông báo lỗi
        return adVouchersRepository.findById(voucherId)
                .map(v -> ResponseObject.success(v, "Lấy chi tiết voucher thành công"))
                .orElse(ResponseObject.error(HttpStatus.NOT_FOUND, "Không tìm thấy Voucher với ID: " + voucherId));
    }

    @Override
    public ResponseObject<?> createOrUpdate(String id, PostOrPutVoucherDto dto) {
        // 1. Kiểm tra trùng mã
        // Nếu id == null (tạo mới), ta truyền một chuỗi rỗng vào IdNot để nó check toàn bộ bảng
        String currentId = (id != null) ? id : "";

        if (adVouchersRepository.existsByCodeAndIdNot(dto.getVoucherCode(), currentId)) {
            return ResponseObject.error(HttpStatus.BAD_REQUEST, "Mã voucher '" + dto.getVoucherCode() + "' đã tồn tại!");
        }
        Voucher voucher;
        long currentTime = System.currentTimeMillis(); // Lấy timestamp hiện tại cho created_date/last_modified_date

        if (id != null && !id.isEmpty()) {
            // TRƯỜNG HỢP UPDATE: Tìm voucher cũ trong DB
            voucher = adVouchersRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Voucher không tồn tại để cập nhật"));
            voucher.setLastModifiedDate(currentTime);
        } else {
            // TRƯỜNG HỢP CREATE: Tạo mới hoàn toàn
            voucher = new Voucher();
            voucher.setId(UUID.randomUUID().toString()); // Sử dụng VARCHAR(36) làm Primary Key
            voucher.setCreatedDate(currentTime);
            voucher.setLastModifiedDate(currentTime);
        }

        // Mapping dữ liệu từ DTO sang Entity (Dựa trên cấu trúc bảng thực tế của bạn)
        voucher.setCode(dto.getVoucherCode());
        voucher.setName(dto.getVoucherName());
        voucher.setVoucherType(dto.getVoucherType());
        voucher.setDiscountUnit(dto.getDiscountUnit());
        voucher.setMaxDiscountAmount(dto.getMaxDiscountAmount());
        voucher.setConditions(dto.getConditions());
        voucher.setStartDate(dto.getStartDate()); // Nhận kiểu Long (BIGINT)
        voucher.setEndDate(dto.getEndDate());     // Nhận kiểu Long (BIGINT)
        voucher.setNote(dto.getNote());
        voucher.setStatus(dto.getStatus());       // TINYINT trong DB ứng với Integer/Short trong Java
        voucher.setQuantity(dto.getQuantity());
        Voucher savedVoucher = adVouchersRepository.save(voucher);
        return ResponseObject.success(savedVoucher, (id == null ? "Thêm mới" : "Cập nhật") + " thành công");
    }

    @Override
    public ResponseObject<?> delete(String id) {
        // Kiểm tra tồn tại trước khi xóa
        if (!adVouchersRepository.existsById(id)) {
            return ResponseObject.error(HttpStatus.NOT_FOUND,"Không tìm thấy Voucher để xóa");
        }
        adVouchersRepository.deleteById(id);
        return ResponseObject.success(null, "Xóa voucher thành công");
    }
}
