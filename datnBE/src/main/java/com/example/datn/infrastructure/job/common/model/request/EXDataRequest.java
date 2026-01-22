package com.example.datn.infrastructure.job.common.model.request;

import com.example.datn.core.common.base.PageableRequest;
import lombok.*;

import java.util.Map;
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class EXDataRequest extends PageableRequest {

    //Dùng để hiển thị danh sách lịch sử các lần Import.
    // Nó kế thừa PageableRequest để có thể phân trang danh sách các bản log này.
    private Map<String, Object> data;
}
