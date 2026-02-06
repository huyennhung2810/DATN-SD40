package com.example.datn.entity;


import com.example.datn.entity.base.PrimaryEntity;
import com.example.datn.infrastructure.constant.ShiftStatus;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@ToString
@Table(name = "work_schedule")
public class WorkSchedule extends PrimaryEntity implements Serializable {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "shift_template_id", nullable = false)
    private ShiftTemplate shiftTemplate;

    @Column(nullable = false)
    private Long workDate;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ShiftStatus status;

    @OneToOne(mappedBy = "workSchedule", cascade = CascadeType.ALL)
    private ShiftHandover shiftHandover;

}
