package com.example.datn.infrastructure.geo;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
public class GeoService {

    //Gọi api địa giới hành chính VN
    private final RestTemplate restTemplate = new RestTemplate();

    public List<Map<String, Object>> getProvinces() {
        String url = "https://provinces.open-api.vn/api/p/";
        return Arrays.asList(restTemplate.getForObject(url, Map[].class));
    }

    public List<Map<String, Object>> getDistricts(String provinceCode) {
        String url = "https://provinces.open-api.vn/api/p/" + provinceCode + "?depth=2";
        Map<String, Object> province = restTemplate.getForObject(url, Map.class);
        return (List<Map<String, Object>>) province.get("districts");
    }

    public List<Map<String, Object>> getCommunes(String districtCode) {
        String url = "https://provinces.open-api.vn/api/d/" + districtCode + "?depth=2";
        Map<String, Object> district = restTemplate.getForObject(url, Map.class);
        return (List<Map<String, Object>>) district.get("wards");
    }
}
