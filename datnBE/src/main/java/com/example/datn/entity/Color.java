package com.example.datn.entity;

import com.example.datn.entity.base.NameEntity;
import com.example.datn.entity.base.PrimaryEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.io.Serializable;

@Entity
@Getter
@Setter
@NoArgsConstructor
@ToString
@Table(name = "color")
public class Color extends NameEntity implements Serializable {
}
