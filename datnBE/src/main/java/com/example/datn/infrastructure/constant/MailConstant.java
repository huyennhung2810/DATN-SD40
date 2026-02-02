package com.example.datn.infrastructure.constant;

public class MailConstant {
    private MailConstant() {}

    // Đường dẫn logo shop - Nên để ảnh trên Cloudinary để đảm bảo hiển thị tốt nhất
    public static final String LOGO_PATH = "/static/images/logo-camera-shop.png";

    public static final String BODY_STARTS = "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional //EN\"\n" +
            "        \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">\n" +
            "<html xmlns:th=\"http://www.thymeleaf.org\">\n" +
            "<head>\n" +
            "    <meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\">\n" +
            "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
            "    <style type=\"text/css\">\n" +
            "        /* CSS giữ nguyên như của bạn để đảm bảo hiển thị trên Mobile */\n" +
            "        .u-row { width: 600px !important; }\n" +
            "        body { margin: 0; padding: 0; font-family: 'Open Sans',sans-serif; }\n" +
            "    </style>\n" +
            "</head>\n" +
            "<body style=\"background-color: #e7e7e7;\">\n" +
            "    <div style=\"background-color: #ffffff; max-width: 600px; margin: 0 auto;\">\n" +
            "        \n" +
            "        <div style=\"text-align: center; padding: 25px;\">\n" +
            "            <img src='cid:logoImage' alt=\"Camera Shop Logo\" style=\"width: 180px;\"/>\n" +
            "        </div>\n" +
            "        <hr style=\"border: 0; border-top: 1px solid #BBBBBB; margin: 0 10px;\">\n" +
            "        \n" +
            "        <div style=\"text-align: center; padding: 10px;\">\n" +
            "            <h2 style=\"color: #e67e23; font-size: 26px;\">";

    public static final String BODY_BODY = "</h2>\n" +
            "        </div>\n" +
            "        \n" +
            "        <div style=\"padding: 20px 30px; font-size: 16px; line-height: 1.6; color: #333333;\">";

    public static final String BODY_END = "</div>\n" +
            "        \n" +
            "        <div style=\"border-top: 2px solid #939391; padding: 20px; text-align: center; background-color: #f9f9f9;\">\n" +
            "            <p style=\"font-size: 14px; color: #828080; font-style: italic;\">\n" +
            "                Lưu ý: Đây là email tự động, vui lòng không phản hồi email này.<br>\n" +
            "                Mọi thắc mắc xin liên hệ <strong>Hotline: 1900 xxxx</strong> hoặc ghé thăm hệ thống cửa hàng máy ảnh của chúng tôi.\n" +
            "            </p>\n" +
            "            <p style=\"font-size: 12px; color: #aaaaaa;\">© 2026 Camera Shop - Uy tín trên từng khung hình</p>\n" +
            "        </div>\n" +
            "    </div>\n" +
            "</body>\n" +
            "</html>";


//    public static final String BODY_STARTS = "<html><body><div style='font-family: Arial, sans-serif;'>";
//    public static final String BODY_BODY = "<p>";
//    public static final String BODY_END = "</p></div></body></html>";
//    public static final String LOGO_PATH = "static/logo.png";
}
