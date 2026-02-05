package com.example.datn.infrastructure.constant;

public class PaginationConstant {
//chuẩn hóa các giá trị mặc định của phân trang và sắp xếp
    private PaginationConstant() {
    }

    //Mỗi trang 5 phần tử
    public static final int DEFAULT_SIZE = 5;

    //Trang bắt đầu từ 1
    public static final int DEFAULT_PAGE = 0;

    //Mặc định sắp xếp theo giảm dần
    public static final String DEFAULT_ORDER_BY = "desc";

    //Sắp xếp cột id giảm dần
    public static final String DEFAULT_SORT_BY = "id";

    //Dùng trong tìm kiếm, lọc dữ liệu. Mặc định là rỗng nếu không truyền keyword
    public static final String DEFAULT_Q = "";
}
