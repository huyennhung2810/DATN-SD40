package com.example.datn.infrastructure.constant;

import lombok.Getter;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public enum RoleConstant {

    ADMIN("Quản trị viên"),

    STAFF("Nhân viên"),

    CUSTOMER("Khách hàng");

    private final String nameInVietNamese;

    RoleConstant(String nameInVietNamese) {
        this.nameInVietNamese = nameInVietNamese;
    }

    //Lấy tất cả vai trò mảng ["ADMIN", "STAFF", "CUSTOMER"]
    public static List<String> getAllRoles() {
        return Arrays.stream(RoleConstant.values())
                .map(Enum::name)
                .collect(Collectors.toList());
    }

    //Lấy tất cả vai trò chuỗi ngăn cách bởi dấu phẩy
    public static String getAllRolesString() {
        return Arrays.stream(RoleConstant.values())
                .map(Enum::name)
                .collect(Collectors.joining(", "));
    }

    //Lấy danh sách tên hiển thị tiếng việt
    public static List<String> getAllRolesInVietnamese() {
        return Arrays.stream(RoleConstant.values())
                .map(RoleConstant::getNameInVietNamese)
                .collect(Collectors.toList());
    }

    //Lấy tên tiếng việt theo từng vai trò
    public static String getVietnameseNameByRole(String roleName) {
        return Arrays.stream(RoleConstant.values())
                .filter(role -> role.name().equalsIgnoreCase(roleName))
                .map(RoleConstant::getNameInVietNamese)
                .findFirst()
                .orElse(null);
    }

}
