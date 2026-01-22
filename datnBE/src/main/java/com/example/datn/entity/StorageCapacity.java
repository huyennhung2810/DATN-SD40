package com.example.datn.entity;

import com.example.datn.entity.base.NameEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.io.Serializable;

@Entity
@Getter
@Setter
@NoArgsConstructor
@ToString
@Table(name = "storage_capacity")
public class StorageCapacity extends NameEntity implements Serializable {

}
