package com.example.datn.entity.base;


import com.example.datn.infrastructure.constant.EntityProperties;
import com.example.datn.infrastructure.constant.EntityStatus;
import com.example.datn.infrastructure.listener.CreatePrimaryEntityListener;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter

@NoArgsConstructor
@MappedSuperclass
@EntityListeners(CreatePrimaryEntityListener.class)
public class PrimaryEntity extends AuditEntity  implements Isdentified{

    @Id
    @Column(length = EntityProperties.LENGTH_ID, updatable = false)
    private String id;

    @Column(name = "code", unique = true, length = EntityProperties.LENGTH_CODE)
    private String code;

    @Column(name = "status")
    @Enumerated(EnumType.ORDINAL)
    private EntityStatus status;
}
