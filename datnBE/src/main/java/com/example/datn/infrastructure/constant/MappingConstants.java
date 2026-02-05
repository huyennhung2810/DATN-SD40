package com.example.datn.infrastructure.constant;

public class MappingConstants {

    /* API VERSION PREFIX */
    public static final String API_VERSION_PREFIX = "/api/v1";

    //  API base role
    public static final String MANAGE = "/manage";
    public static final String STAFF = "/staff";
    public static final String CUSTOMER = "/customer";

    /* AUTHENTICATION */
    public static final String API_AUTH_PREFIX = API_VERSION_PREFIX + "/auth";

    /* API COMMON */
    public static final String API_COMMON = API_VERSION_PREFIX + "/common";
    public static final String API_LOGIN = API_VERSION_PREFIX + "/login";

    /* API FOR MANAGE */

    public static final String ADMIN = "/admin";




    /* API PRODUCTS */
    public static final String API_ADMIN_PREFIX = API_VERSION_PREFIX + ADMIN;

    public static final String API_ADMIN_PREFIX_PRODUCTS = API_ADMIN_PREFIX + "/products";
    public static final String API_ADMIN_PREFIX_PRODUCTS_COLOR = API_ADMIN_PREFIX_PRODUCTS + "/color";

    public static final String API_ADMIN_PREFIX_DISCOUNT = API_ADMIN_PREFIX + "/discounts";
    public static final String API_ADMIN_PREFIX_DISCOUNT_DISCOUNT = API_ADMIN_PREFIX_DISCOUNT + "/discount";
    public static final String API_ADMIN_PREFIX_DISCOUNT_DETAIL = API_ADMIN_PREFIX_DISCOUNT + "/detail";




    public static final String API_ADMIN_PREFIX_STATISTICS= API_ADMIN_PREFIX + "/statistics";

    public static final String API_ADMIN_PREFIX_DISCOUNT_VOUCHER = API_ADMIN_PREFIX_DISCOUNT + "/voucher";


    public static final String API_ADMIN_PREFIX_PRODUCTS_DETAIL = API_ADMIN_PREFIX_PRODUCTS + "/product-detail";

    public static final String API_ADMIN_PREFIX_EMPLOYEE =  API_ADMIN_PREFIX + "/employee";
    public static final String API_ADMIN_PREFIX_CUSTOMERS = API_ADMIN_PREFIX + "/customers";
    public static final String API_ADMIN_PREFIX_CUSTOMER_ADDRESSES = API_ADMIN_PREFIX_CUSTOMERS + "/{customerId}/addresses";

}
