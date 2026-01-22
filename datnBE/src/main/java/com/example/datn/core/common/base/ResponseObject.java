package com.example.datn.core.common.base;

import lombok.*;
import org.springframework.http.HttpStatus;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResponseObject<T> {
    private boolean isSuccess;

    private HttpStatus status;

    private T data;

    private String message;

    @Builder.Default
    private Instant timestamp = Instant.now();

    // Phản hồi thành công kèm dữ liệu (Ví dụ: Lấy danh sách máy ảnh, Chi tiết đơn hàng)
    public static <T> ResponseObject<T> success(T data, String message) {
        return ResponseObject.<T>builder()
                .isSuccess(true)
                .status(HttpStatus.OK)
                .data(data)
                .message(message)
                .build();
    }

    // Phản hồi thành công không kèm dữ liệu (Ví dụ: Xóa sản phẩm, Cập nhật trạng thái thành công)
    public static <T> ResponseObject<T> success(String message) {
        return ResponseObject.<T>builder()
                .isSuccess(true)
                .status(HttpStatus.OK)
                .message(message)
                .build();
    }

    // Phản hồi lỗi (Ví dụ: Không tìm thấy máy ảnh, Sai mật khẩu, Hết hàng)
    public static <T> ResponseObject<T> error(HttpStatus status, String message) {
        return ResponseObject.<T>builder()
                .isSuccess(false)
                .status(status)
                .message(message)
                .build();
    }
}
