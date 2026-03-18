package com.example.datn.entity;

import com.example.datn.entity.base.NameEntity;
import com.example.datn.infrastructure.constant.EntityProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import java.io.Serializable;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Table(name = "brand")
public class Brand extends NameEntity implements Serializable {

    @Column(length = EntityProperties.LENGTH_DESCRIPTION)
    private String description;
}
