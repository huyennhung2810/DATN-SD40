package com.example.datn.infrastructure.email;

import com.example.datn.entity.Voucher;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.stereotype.Service;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.context.Context;

import java.util.List;


@Service
@EnableAsync
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private SpringTemplateEngine templateEngine;

    @Async
    public void sendNewStaffEmail(String toEmail, String fullName, String staffCode, String username, String password) throws MessagingException {
        Context context = new Context();
        context.setVariable("fullName", fullName);
        context.setVariable("staffCode", staffCode);
        context.setVariable("username", username);
        context.setVariable("password", password);

        String html = templateEngine.process("new_staff_email", context);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true,"UTF-8");
        helper.setTo(toEmail);
        helper.setSubject("Thông tin tài khoản mới");
        helper.setText(html, true); // HTML
        mailSender.send(message);
    }
    @Async // Gửi mail chạy ngầm để không làm chậm API
    public void sendVoucherNotification(List<String> emails, Voucher voucher) {
        try {
            for (String email : emails) {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                helper.setTo(email);
                helper.setSubject("Quà tặng đặc biệt: Mã giảm giá " + voucher.getName() + " dành riêng cho bạn!");

                // Nội dung HTML cho Email
                String htmlContent = String.format("""
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; padding: 20px;">
                        <h2 style="color: #e44d26; text-align: center;">Chúc mừng bạn nhận được Voucher!</h2>
                        <p>Chào bạn,</p>
                        <p>Chúng tôi xin gửi tặng bạn mã giảm giá đặc biệt để tri ân sự ủng hộ của bạn:</p>
                        <div style="background-color: #f9f9f9; border: 2px dashed #e44d26; padding: 20px; text-align: center; margin: 20px 0;">
                            <span style="font-size: 24px; font-weight: bold; color: #e44d26;">%s</span>
                        </div>
                        <ul>
                            <li><strong>Giảm giá:</strong> %s %s</li>
                            <li><strong>Giá trị giảm tối đa:</strong> %,.0f VND</li>
                            <li><strong>Điều kiện đơn tối thiểu:</strong> %,.0f VND</li>
                            <li><strong>Hạn sử dụng:</strong> Đến hết ngày %s</li>
                        </ul>
                        <p style="text-align: center; margin-top: 30px;">
                            <a href="http://yourwebsite.com" style="background-color: #e44d26; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Mua sắm ngay</a>
                        </p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                        <p style="font-size: 12px; color: #888; text-align: center;">Đây là email tự động, vui lòng không phản hồi email này.</p>
                    </div>
                """,
                        voucher.getCode(),
                        voucher.getDiscountValue(),
                        voucher.getDiscountUnit().equals("PERCENT") ? "%" : "VND",
                        voucher.getMaxDiscountAmount(),
                        voucher.getConditions(),
                        new java.util.Date(voucher.getEndDate()).toLocaleString()
                );

                helper.setText(htmlContent, true);
                mailSender.send(message);
            }
        } catch (Exception e) {
            e.printStackTrace();
            // Bạn có thể log lỗi ở đây nếu gửi mail thất bại
        }
    }
}
