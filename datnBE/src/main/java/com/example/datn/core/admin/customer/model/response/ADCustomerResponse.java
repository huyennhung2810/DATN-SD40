package com.example.datn.core.admin.customer.model.response;


import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ADCustomerResponse {
    private String id;
    private String code;
    private String name;
    private String email;
    private String phoneNumber;
    private Boolean gender;
    private Long dateOfBirth;
    private String identityCard;
    private String image;
    private String status;
    private Long createdDate;
    private ADAddressResponse address;
}
