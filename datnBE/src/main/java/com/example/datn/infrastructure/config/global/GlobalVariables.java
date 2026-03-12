package com.example.datn.infrastructure.config.global;

import lombok.Getter;
import lombok.Setter;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Setter
@Getter
@Component
public class GlobalVariables {
    private Map<String, Object> globalVariables = new ConcurrentHashMap<>();

    public void setGlobalVariable(String key, Object value) {
        globalVariables.put(key, value);
    }

    public Object getGlobalVariable(String key) {
        return globalVariables.get(key);
    }
}
