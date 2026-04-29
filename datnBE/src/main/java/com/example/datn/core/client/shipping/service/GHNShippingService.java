package com.example.datn.core.client.shipping.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GHNShippingService {

    @Value("${ghn.token}")
    private String ghnToken;

    @Value("${ghn.shop-id}")
    private String ghnShopId;

    @Value("${ghn.base-url}")
    private String ghnBaseUrl;

    @Value("${ghn.from-district-id}")
    private Integer fromDistrictId;

    @Value("${ghn.from-ward-code}")
    private String fromWardCode;

    private final RestTemplate restTemplate = new RestTemplate();

    public BigDecimal calculateFee(Integer toDistrictId, String toWardCode, int quantity, BigDecimal totalOrderValue) {
        try {
            if (toDistrictId == null || toWardCode == null) {
                log.warn("Thiếu thông tin địa chỉ GHN để tính phí ship");
                return BigDecimal.ZERO; // Hoặc throw exception tuỳ nghiệp vụ
            }

            // Tính weight: mặc định 2000g/sp
            int weight = quantity * 2000;
            if (weight <= 0) weight = 2000;

            // GHN giới hạn insurance_value tối đa 5.000.000
            int insuranceValue = 0;
            if (totalOrderValue != null) {
                insuranceValue = totalOrderValue.intValue();
                if (insuranceValue > 5000000) {
                    insuranceValue = 5000000;
                }
            }

            String url = ghnBaseUrl + "/shipping-order/fee";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Token", ghnToken);
            headers.set("ShopId", ghnShopId);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("from_district_id", fromDistrictId);
            requestBody.put("from_ward_code", fromWardCode);
            requestBody.put("to_district_id", toDistrictId);
            requestBody.put("to_ward_code", toWardCode);
            requestBody.put("service_type_id", 2); // 2: Đường bộ (chuẩn)
            requestBody.put("weight", weight);
            requestBody.put("insurance_value", insuranceValue);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                Integer code = (Integer) body.get("code");
                if (code != null && code == 200) {
                    Map<String, Object> data = (Map<String, Object>) body.get("data");
                    if (data != null && data.get("total") != null) {
                        Number totalFee = (Number) data.get("total");
                        return BigDecimal.valueOf(totalFee.longValue());
                    }
                } else {
                    log.error("GHN trả về lỗi: {}", body);
                }
            }
            return BigDecimal.ZERO;
        } catch (Exception e) {
            log.error("Lỗi khi gọi API GHN tính phí vận chuyển: {}", e.getMessage());
            return BigDecimal.ZERO;
        }
    }

    public Object getProvinces() {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Token", ghnToken);
            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<Object> response = restTemplate.exchange(
                    ghnBaseUrl + "/master-data/province",
                    org.springframework.http.HttpMethod.GET,
                    entity,
                    Object.class
            );
            return response.getBody();
        } catch (Exception e) {
            log.error("Lỗi gọi GHN getProvinces: {}", e.getMessage());
            return null;
        }
    }

    public Object getDistricts(Integer provinceId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Token", ghnToken);
            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<Object> response = restTemplate.exchange(
                    ghnBaseUrl + "/master-data/district?province_id=" + provinceId,
                    org.springframework.http.HttpMethod.GET,
                    entity,
                    Object.class
            );
            return response.getBody();
        } catch (Exception e) {
            log.error("Lỗi gọi GHN getDistricts: {}", e.getMessage());
            return null;
        }
    }

    public Object getWards(Integer districtId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Token", ghnToken);
            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<Object> response = restTemplate.exchange(
                    ghnBaseUrl + "/master-data/ward?district_id=" + districtId,
                    org.springframework.http.HttpMethod.GET,
                    entity,
                    Object.class
            );
            return response.getBody();
        } catch (Exception e) {
            log.error("Lỗi gọi GHN getWards: {}", e.getMessage());
            return null;
        }
    }
}
