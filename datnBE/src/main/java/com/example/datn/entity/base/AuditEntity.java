package com.example.datn.entity.base;

import com.example.datn.infrastructure.listener.AuditEntityListener;
import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@MappedSuperclass
@EntityListeners(AuditEntityListener.class)
public abstract class AuditEntity {

    @Column(updatable = false)
    private Long createdDate;

    @Column
    private Long lastModifiedDate;

//    @Column
//    private String createdBy;
//
//    @Column
//    private String lastModifiedBy;
}
