package com.example.datn.entity.base;

import com.example.datn.infrastructure.constant.EntityProperties;
import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;

@MappedSuperclass
@Getter
@Setter
public class NameEntity extends PrimaryEntity{

    @Column(name = "name", length = EntityProperties.LENGTH_NAME)
    private String name;
}
