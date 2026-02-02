package com.example.datn.infrastructure.job.common.model.request;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashMap;
import java.util.Map;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Setter
public class EXImportRequest {

    private String code;

    private String fileName;

    private Integer line;

    private Map<String, Object> data;

    private Map<String, String> item;

    //Tự động xóa các ký tự lạ, khoảng trắng thừa từ file Excel trước khi đưa vào Database.
    public Map<String, String> getItem() {
        if (item == null) return null;

        Map<String, String> result = new HashMap<>();
        for (Map.Entry<String, String> entry : item.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();
            if (value != null) {
                value = value.replaceAll("[^\\p{L}\\p{N}\\s~`!@#$%^&*()_+\\-=\\[\\]{}|;:'\",.<>/?\\\\]", "").replaceAll("\\s+", " ").trim();
            }
            result.put(key, value);
        }
        return result;
    }
}
