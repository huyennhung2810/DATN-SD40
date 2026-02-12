package com.example.datn.infrastructure.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.context.Context;

@Slf4j
@Service
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private SpringTemplateEngine templateEngine;

    @Async
    public void sendAccountEmail(String toEmail, String fullName, String staffCode, String username, String password) {
        try {
            Context context = new Context();
            context.setVariable("fullName", fullName);
            context.setVariable("staffCode", staffCode);
            context.setVariable("username", username);
            context.setVariable("password", password);

            String html = templateEngine.process("new_staff_email", context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("Canon Store <your-email@gmail.com>"); // Thêm dòng này
            helper.setTo(toEmail);
            helper.setSubject("🌿 [Canon Store] Thông tin tài khoản nhân viên mới");
            helper.setText(html, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            System.err.println("Lỗi gửi mail cho: " + toEmail + " - " + e.getMessage());
        }
    }

    @Async
    public void sendOtpEmail(String toEmail, String fullName, String otp) {
        try {
            Context context = new Context();
            context.setVariable("fullName", fullName);
            context.setVariable("otp", otp);

            String html = templateEngine.process("otp_email", context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject("🔑 Mã xác nhận (OTP) thay đổi mật khẩu");
            helper.setText(html, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            log.error("Lỗi gửi OTP: {}", e.getMessage());
        }
    }
}