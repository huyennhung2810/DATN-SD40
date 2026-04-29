package com.example.datn;

import jakarta.annotation.PostConstruct;

import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableJpaAuditing
@EnableAsync
@EnableCaching

public class DatnApplication {

    @PostConstruct
    public void init() {
        // Ép JVM chạy ở múi giờ Việt Nam thay vì múi giờ của hệ điều hành host
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
    }

    public static void main(String[] args) {
        SpringApplication.run(DatnApplication.class, args);
    }

}
